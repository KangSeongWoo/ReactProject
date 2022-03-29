import React, { useState, useLayoutEffect, useCallback , useMemo,useEffect } from 'react'
import CustomBreadcrumb from '/src/utils/CustomBreadcrumb'
import { withRouter } from 'react-router-dom'
import queryStirng from 'query-string'
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

const MoveOrderList = props => {
    const { userId } = props

    console.log('유저 ID : ' + userId)

    const [gridApi, setGridApi] = useState(null)
    const [gridColumnApi, setGridColumnApi] = useState(null)
    const [storageList, setStorageList] = useState([])
    const [storageCate, setStorageCate] = useState([])

    // API 호출 get state
    const [getData, setGetData] = useState({
        startDt: moment().subtract(7, 'd'),
        endDt: moment(),
        storageId: '',
        oStorageId: '',
        assortId: '',
        assortNm: '',
        userId: userId
    })

    //화면에 노출되는 state
    const [state, setState] = useState({
        rowData: []
    })

    const columnDefs = () => {
        return [
            { field: 'shipKey', headerName: '이동지시번호', editable: false, suppressMenu: true },
            { field: 'orderKey', headerName: '주문번호', editable: false, suppressMenu: true },
            {
                field: 'moveIndGb',
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
                headerName: '배송구분',
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
            {
                field: 'storageId',
                headerName: '출고창고',
                editable: false,
                suppressMenu: true,
                cellEditor: 'select',
                cellEditorParams: {
                    values: Helpers.extractValues(storageCate)
                },
                valueFormatter: function(params) {
                    return Helpers.lookupValue(storageCate, params.value)
                },
                valueParser: function(params) {
                    return Helpers.lookupKey(storageCate, params.newValue)
                }
            },
            {
                field: 'oStorageId',
                headerName: '입고창고',
                editable: false,
                suppressMenu: true,
                cellEditor: 'select',
                cellEditorParams: {
                    values: Helpers.extractValues(storageCate)
                },
                valueFormatter: function(params) {
                    return Helpers.lookupValue(storageCate, params.value)
                },
                valueParser: function(params) {
                    return Helpers.lookupKey(storageCate, params.newValue)
                }
            },
            { field: 'moveIndDt', headerName: '이동지시일자', editable: false, suppressMenu: true },
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
            { field: 'qty', headerName: '수량', editable: false, suppressMenu: true },
            { field: 'cost', headerName: '금액', editable: false, suppressMenu: true }
        ]
    }

    // 화면 그려지기 전에 호출
    useLayoutEffect(() => {
        window.addEventListener('resize', () => props.setHeight());
        props.setHeight();
        document.addEventListener('keyup', hotkeyFunction)
        setInit()
    }, [])

    const hotkeyFunction = useCallback(event => {
        if (event.key == 'F8') {
            document.querySelector('.search').click()
        }
    }, [])

    // 화면초기화
    const setInit = async () => {
        props.setSpin(true)
        try {
            let res = await Https.getStorageList()
            console.log('---------------------------------------------------')
            console.log(res)

            setStorageList(res.data.data.Storages) // 입고창고 State
            setStorageCate(res.data.data.storagesGridKey)
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

    // 체크박스 또는 클릭으로 선택시
    const onSelectionChanged = () => {
        var selectedRows = gridApi.getSelectedRows()
        setGetData({
            ...getData,
            deposits: [...selectedRows]
        })
    }

    // 조건에 따라 내역 조회
    const checkTheValue = () => {
        props.setSpin(true)
        const { startDt, endDt, storageId, assortId, assortNm, oStorageId } = getData

        let params = {}

        params.startDt = Common.trim(startDt.format('YYYY-MM-DD'))
        params.endDt = Common.trim(endDt.format('YYYY-MM-DD'))
        params.storageId = Common.trim(storageId)
        params.assortId = Common.trim(assortId)
        params.assortNm = Common.trim(assortNm)
        params.oStorageId = Common.trim(oStorageId)

        console.log('getData : ' + JSON.stringify(getData))

        const p = new URLSearchParams(params)

        return Https.getMoveOrderList(p)
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

    // Input 입력
    const handleChangeInput = e => {
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

    // 입고 창고 선택
    const handleChangeStorage = e => {
        setGetData({
            ...getData,
            storageId: e
        })
    }

    // 출고 창고 선택
    const handleChangeOStorage = e => {
        setGetData({
            ...getData,
            oStorageId: e
        })
    }

    // 컬럼 리사이즈
    const onFirstDataRendered = params => {
        var allColumnIds = []
        params.columnApi.getAllColumns().forEach(function(column) {
            allColumnIds.push(column.colId)
        })

        params.columnApi.autoSizeColumns(allColumnIds, false)
    }

    //상세 이동
    const goDetail = e => {
        e.data.displayKd = 'POP'
        //window.location.href = '/#/Move/moveOrderOne?' + queryStirng.stringify(e.data)
        window
            .open(
                '/#/Move/moveOrderOne?' + queryStirng.stringify(e.data),
                '상세' + new Date(),
                'toolbar=no,location=no,directories=no,status=no,scrollbars=yes,resizable=no,width=1610,height=1402,top=, left= '
            )
            .focus()
    }

    const defaultColDef = useMemo(() => {
        return {
          sortable: true,
          flex: 1, minWidth: 100, resizable: true
        };
    }, []);

    return (
        <>
            <CustomBreadcrumb style={{ marginBottom: '0px' }} arr={['이동', '이동지시리스트']}></CustomBreadcrumb>
            <div className='notice-wrapper'>
                <div className='notice-condition'>
            <Row type='flex' justify='end' gutter={[16, 8]}>
                <Col style={{ width: '150px' }}>
                    <Button type='primary' className='fullWidth search' onClick={checkTheValue}>
                        조회
                    </Button>
                </Col>
            </Row>
            <Divider style={{ margin: '10px 0' }} />
            <Row gutter={[16, 8]}>
                <Col span={20}>
                    <Row gutter={[16, 8]} className='onVerticalCenter marginTop-10'>
                        <Col span={4}>
                            <Text className='font-15 NanumGothic-Regular' strong>
                                이동지시일자
                            </Text>
                        </Col>
                        <Col span={6}>
                            <DatePicker
                                name='moveOrderStartDt'
                                className='fullWidth'
                                defaultValue={getData.startDt}
                                onChange={handleChangeStartDate}
                            />
                        </Col>
                        <Col span={6}>
                            <DatePicker
                                name='moveOrderEndDt'
                                className='fullWidth'
                                defaultValue={getData.endDt}
                                onChange={handleChangeEndDate}
                            />
                        </Col>
                    </Row>
                    <Row gutter={[16, 8]} className='onVerticalCenter marginTop-10'>
                        <Col span={4}>
                            <Text className='font-15 NanumGothic-Regular' strong>
                                출고창고
                            </Text>
                        </Col>
                        <Col span={6}>
                            <Select
                                name='oStorageId'
                                placeholder='출고창고선택'
                                className='fullWidth'
                                defaultValue={getData.oStorageId != '' ? getData.oStorageId : undefined}
                                onChange={handleChangeOStorage}>
                                {storageList.map(item => (
                                    <Option key={item.value}>{item.label}</Option>
                                ))}
                            </Select>
                        </Col>
                    </Row>
                    <Row gutter={[16, 8]} className='onVerticalCenter marginTop-10'>
                        <Col span={4}>
                            <Text className='font-15 NanumGothic-Regular' strong>
                                입고창고
                            </Text>
                        </Col>
                        <Col span={6}>
                            <Select
                                name='storageId'
                                placeholder='입고창고선택'
                                className='fullWidth'
                                defaultValue={getData.storageId != '' ? getData.storageId : undefined}
                                onChange={handleChangeStorage}>
                                {storageList.map(item => (
                                    <Option key={item.value}>{item.label}</Option>
                                ))}
                            </Select>
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
                                placeholder='상품코드를 입력하세요'
                                className='fullWidth'
                                value={getData.assortId != '' ? getData.assortId : undefined}
                                onInput={handleChangeInput}
                            />
                        </Col>
                        <Col span={6}>
                            <Input
                                name='assortNm'
                                placeholder='상품명를 입력하세요'
                                className='fullWidth'
                                value={getData.assortNm != '' ? getData.assortNm : undefined}
                                onInput={handleChangeInput}
                            />
                        </Col>
                    </Row>
                </Col>
            </Row>
</div>
            <Row className='marginTop-10'>
                <div className='ag-theme-alpine' style={{ height: props.height, width: '100%' }}>
                    <AgGridReact defaultColDef={defaultColDef} multiSortKey={'ctrl'}
                        enableCellTextSelection={true}
                        rowData={state.rowData}
                        suppressDragLeaveHidesColumns={true}
                        onSelectionChanged={onSelectionChanged}
                        suppressRowClickSelection={true}
                        onFirstDataRendered={onFirstDataRendered}
                        rowSelection={'multiple'}
                        onRowClicked={goDetail}
                        columnDefs={columnDefs()}
                        onGridReady={onGridReady}></AgGridReact>
                </div>
            </Row>
            </div>
        </>
    )
}

export default withRouter(MoveOrderList)
