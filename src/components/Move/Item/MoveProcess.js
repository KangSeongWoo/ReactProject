import React, { useState, useLayoutEffect, useCallback , useMemo,useEffect } from 'react'
import CustomBreadcrumb from '/src/utils/CustomBreadcrumb'
import { withRouter } from 'react-router-dom'
import moment from 'moment'
import { Row, Col, Button, Input, Typography, DatePicker, Select, Divider, Spin } from 'antd'
import { AgGridReact } from 'ag-grid-react'
import Https from '../../../api/http'
import * as Helpers from '../../../utils/Helpers'
import * as GridKeyValue from '../../../utils/GridKeyValue'
import * as Constans from '../../../utils/Constans'
import * as Common from '../../../utils/Common.js'
import '/src/style/custom.css'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-alpine.css'

const { Text } = Typography
const { Option } = Select

// 이동지시구분 JSON
let moveIndGb = {}
for (let i = 0; i < Constans.MOVEINBGB.length; i++) {
    moveIndGb[Constans.MOVEINBGB[i].value] = Constans.MOVEINBGB[i].label
}

// 배송방법 관련 Select 박스 적용용
let shipmentList = []
let keys = Object.keys(GridKeyValue.SHIPMENT)
let values = Object.values(GridKeyValue.SHIPMENT)

for (let i = 0; i < keys.length; i++) {
    let tempJson = {}
    tempJson.label = values[i]
    tempJson.value = keys[i]
    shipmentList.push(tempJson)
}
const MoveProcess = props => {
    const { userId } = props

    const [gridApi, setGridApi] = useState(null)
    const [gridColumnApi, setGridColumnApi] = useState(null)
    const [storageList, setStorageList] = useState([])
    const [selectedRows, setSelectedRows] = useState(0);

    // API 호출 get state
    const [getData, setGetData] = useState({
        startDt: moment().subtract(7, 'd'),
        endDt: moment(),
        storageId: '000001',
        deliMethId: '',
        assortId: '',
        assortNm: '',
        shipId: '',
        userId: userId
    })

    //화면에 노출되는 state
    const [state, setState] = useState({
        rowData: []
    })

    const columnDefs = () => {
        return [
            {
                field: 'moveIndDt',
                headerName: '이동지시일자',
                editable: false,
                suppressMenu: true,
                headerCheckboxSelection: true,
                headerCheckboxSelectionFilteredOnly: true,
                checkboxSelection: true
            },
            { field: 'shipKey', headerName: '이동지시번호', editable: false, suppressMenu: true },
            {
                field: 'shipGb',
                headerName: '이동지시구분',
                editable: false,
                suppressMenu: true,
                cellEditor: 'select',
                cellEditorParams: {
                    values: Helpers.extractValues(moveIndGb)
                },
                valueFormatter: function(params) {
                    return Helpers.lookupValue(moveIndGb, params.value)
                },
                valueParser: function(params) {
                    return Helpers.lookupKey(moveIndGb, params.newValue)
                }
            },
            {
                field: 'deliMethod',
                headerName: '이동방법',
                editable: false,
                suppressMenu: true,
                cellEditor: 'select',
                cellEditorParams: {
                    values: Helpers.extractValues(GridKeyValue.SHIPMENT)
                },
                valueFormatter: function(params) {
                    return Helpers.lookupValue(GridKeyValue.SHIPMENT, params.value)
                },
                valueParser: function(params) {
                    return Helpers.lookupKey(GridKeyValue.SHIPMENT, params.newValue)
                }
            },
            { field: 'trackNo', headerName: '트래킹번호', editable: false, suppressMenu: true },
            { field: 'assortId', headerName: '품목코드', editable: false, suppressMenu: true },
            { field: 'itemId', headerName: '상품코드', editable: false, suppressMenu: true },
            { field: 'assortNm', headerName: '상품명', editable: false, suppressMenu: true },
            { field: 'optionNm1', headerName: '옵션1', editable: false, suppressMenu: true },
            { field: 'optionNm2', headerName: '옵션2', editable: false, suppressMenu: true },
            { field: 'optionNm3', headerName: '옵션3', editable: false, suppressMenu: true },
            {
                field: 'rackNo',
                headerName: '렉번호',
                editable: false,
                suppressMenu: true,
                valueFormatter: function(params) {
                    if (params.value == null || params.value == undefined || params.value == '') {
                        return '999999'
                    }
                }
            },
            { field: 'qty', headerName: '수량', editable: false, suppressMenu: true }
        ]
    }

    const hotkeyFunction = useCallback(event => {
        if (event.key == 'F8') {
            document.querySelector('.search').click()
        }
    }, [])

    useLayoutEffect(() => {
        window.addEventListener('resize', () => props.setHeight());
        props.setHeight();
        document.addEventListener('keyup', hotkeyFunction)
    }, [])

    // 화면초기화
    const setInit = async () => {
        props.setSpin(true)
        try {
            let res = await Https.getStorageList()
            console.log('---------------------------------------------------')
            console.log(res)

            setStorageList(res.data.data.Storages) // 입고창고 State
        } catch (error) {
            console.error(error)
        } finally {
            props.setSpin(false)
        }
    }

    // agGrid API 호출
    const onGridReady = params => {
        setGridApi(params.api)
        setGridColumnApi(params.columnApi)
    }

    // 조건에 따라 내역 조회
    const checkTheValue = () => {
        props.setSpin(true)
        const { startDt, endDt, storageId, deliMethId, assortId, assortNm, shipId } = getData

        let params = {}

        params.startDt = Common.trim(startDt.format('YYYY-MM-DD'))
        params.endDt = Common.trim(endDt.format('YYYY-MM-DD'))
        params.storageId = Common.trim(storageId)
        params.deliMethId = Common.trim(deliMethId)
        params.assortId = Common.trim(assortId)
        params.assortNm = Common.trim(assortNm)
        params.shipId = Common.trim(shipId)

        console.log('params : ' + JSON.stringify(params))

        const p = new URLSearchParams(params)

        return Https.getMoveProcess(p)
            .then(response => {
                console.log(response)

                let target = response.data.data
                setState({
                    ...state,
                    rowData: target.moves // 화면에 보여줄 리스트
                })
                props.setSpin(false)
            })
            .catch(error => {
                console.error(error)
                Common.commonNotification({
                    kind: 'error',
                    message: '에러 발생',
                    description: '잠시후 다시 시도해 주세요'
                })
                setState({
                    ...state,
                    rowData: []
                })
                props.setSpin(false)
            }) // ERROR
    }

    // 발주번호 입력
    const handlechangeInput = e => {
        let temp = e.target.value
        if (e.target.name == 'assortId') {
            temp = e.target.value.replace(/[^0-9]/g, '')
        }

        setGetData({
            ...getData,
            [e.target.name]: temp
        })
    }

    // 이동지시시작일자 변경
    const handleChangeStartDate = e => {
        setGetData({
            ...getData,
            startDt: e
        })
    }

    // 이동지시종료일자 변경
    const handleChangeEndDate = e => {
        setGetData({
            ...getData,
            endDt: e
        })
    }

    // 입고수량 저장하기
    const saveMove = e => {
        const { startDt, endDt, storageId, deliMethId, assortId, assortNm, shipId, userId } = getData
        var selectedRows = gridApi.getSelectedRows()

        if (selectedRows.length == 0) {
            alert('이동처리할 내역을 선택해 주세요')
            return false
        }
        props.setSpin(true)

        const config = { headers: { 'Content-Type': 'application/json' } }

        let params = {}

        params.startDt = Common.trim(startDt.format('YYYY-MM-DD'))
        params.endDt = Common.trim(endDt.format('YYYY-MM-DD'))
        params.storageId = Common.trim(storageId)
        params.deliMethId = Common.trim(deliMethId)
        params.assortId = Common.trim(assortId)
        params.assortNm = Common.trim(assortNm)
        params.shipId = Common.trim(shipId)
        params.userId = Common.trim(userId)
        params.moves = selectedRows

        console.log('params : ' + JSON.stringify(params))

        return Https.postMoveProcess(params, config)
            .then(response => {
                //message.success('저장 성공')
                console.log(response)
                props.setSpin(false)
                checkTheValue()
            })
            .catch(error => {
                console.error(error)
                Common.commonNotification({
                    kind: 'error',
                    message: '에러 발생',
                    description: '잠시후 다시 시도해 주세요'
                })
                props.setSpin(false)
            }) // ERROR
    }

    // 컬럼 리사이즈
    const onFirstDataRendered = params => {
        var allColumnIds = []
        params.columnApi.getAllColumns().forEach(function(column) {
            allColumnIds.push(column.colId)
        })

        params.columnApi.autoSizeColumns(allColumnIds, false)
    }
    
    const onSelectionChanged = () => {
        var selectedRows = gridApi.getSelectedRows()

        setSelectedRows(selectedRows.length);
    }

    const defaultColDef = useMemo(() => {
        return {
          sortable: true,
          flex: 1, minWidth: 100, resizable: true 
        };
    }, []);

    return (
        <>
            <CustomBreadcrumb style={{ marginBottom: '0px' }} arr={['이동', '이동처리']}></CustomBreadcrumb>
            <div className='notice-wrapper'>
                <div className='notice-condition'>
            <Row type='flex' justify='end' gutter={[16, 8]}>
                <Col style={{ width: '150px' }}>
                    <Button type='primary' className='fullWidth search' onClick={checkTheValue} ghost>
                        조회
                    </Button>
                </Col>
                <Col style={{ width: '150px' }}>
                    <Button type='primary' className='fullWidth' onClick={saveMove}>
                        저장
                    </Button>
                </Col>
            </Row>
            <Divider style={{ margin: '10px 0' }} />
            <Row>
                <Col span={20}>
                    <Row gutter={[16, 8]} className='onVerticalCenter marginTop-10'>
                        <Col span={4}>
                            <Text className='font-15 NanumGothic-Regular' strong>
                                이동지시일자
                            </Text>
                        </Col>
                        <Col span={6}>
                            <DatePicker
                                name='startDt'
                                className='fullWidth'
                                defaultValue={getData.startDt}
                                onChange={handleChangeStartDate}
                            />
                        </Col>
                        <Col span={6}>
                            <DatePicker
                                name='endDt'
                                className='fullWidth'
                                defaultValue={getData.endDt}
                                onChange={handleChangeEndDate}
                            />
                        </Col>
                    </Row>
                    <Row gutter={[16, 8]} className='onVerticalCenter marginTop-10'>
                        <Col span={4}>
                            <Text className='font-15 NanumGothic-Regular' strong>
                                이동지시번호
                            </Text>
                        </Col>
                        <Col span={12}>
                            <Input
                                name='shipId'
                                placeholder='이동지시번호를 입력해주세요'
                                className='fullWidth'
                                defaultValue={getData.shipId != '' ? getData.shipId : undefined}
                                onInput={handlechangeInput}
                            />
                        </Col>
                    </Row>
                    <Row gutter={[16, 8]} className='onVerticalCenter marginTop-10'>
                        <Col span={4}>
                            <Text className='font-15 NanumGothic-Regular' strong>
                                상품코드
                            </Text>
                        </Col>
                        <Col span={6}>
                            <Input
                                name='assortId'
                                placeholder='상품코드를 입력해 주세요'
                                className='fullWidth'
                                defaultValue={getData.assortId != '' ? getData.assortId : undefined}
                                onInput={handlechangeInput}
                            />
                        </Col>
                        <Col span={6}>
                            <Input
                                name='assortNm'
                                placeholder='상품명을 입력해 주세요'
                                className='fullWidth'
                                defaultValue={getData.assortNm != '' ? getData.assortNm : undefined}
                                onInput={handlechangeInput}
                            />
                        </Col>
                    </Row>
                    <Row gutter={[16, 8]} className='onVerticalCenter marginTop-10'>
                        <Col span={4}>
                            <Text className='font-15 NanumGothic-Regular' strong>
                                이동방법
                            </Text>
                        </Col>
                        <Col span={12}>
                            <Select placeholder='이동방법을 선택해 주세요' className='fullWidth'>
                                {shipmentList.map(item => (
                                    <Option key={item.value}>{item.label}</Option>
                                ))}
                            </Select>
                        </Col>
                    </Row>
                </Col>
            </Row>
</div>
            <Row className='marginTop-10'>
                <Text className='font-15 NanumGothic-Regular'>총 선택 : {selectedRows}개</Text>
                <div className='ag-theme-alpine marginTop-10' style={{ height: props.height, width: '100%' }}>
                    <AgGridReact defaultColDef={defaultColDef} multiSortKey={'ctrl'}
                        enableCellTextSelection={true}
                        rowData={state.rowData}
                        suppressDragLeaveHidesColumns={true}
                        suppressRowClickSelection={true}
                        onSelectionChanged={ onSelectionChanged}
                        onFirstDataRendered={onFirstDataRendered}
                        rowSelection={'multiple'}
                        columnDefs={columnDefs()}
                        onGridReady={onGridReady}></AgGridReact>
                </div>
            </Row>
            </div>
        </>
    )
}

export default withRouter(MoveProcess)
