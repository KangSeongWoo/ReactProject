import React, { useState, useLayoutEffect, useCallback } from 'react'
import { withRouter } from 'react-router-dom'
import CustomBreadcrumb from '/src/utils/CustomBreadcrumb'
import moment from 'moment'
import { Row, Col, Button, Input, Typography, DatePicker, Select, Divider, Spin } from 'antd'
import { AgGridReact } from 'ag-grid-react'
import Https from '../../../api/http'
import * as GridKeyValue from '../../../utils/GridKeyValue'
import * as Helpers from '../../../utils/Helpers'
import * as Common from '../../../utils/Common.js'

import '/src/style/custom.css'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-alpine.css'

const { Text } = Typography
const { Option } = Select

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

// 창고
const OrderItemMoveOrder = props => {
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
        storageId: '000002',
        deliMethod: '',
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
            {
                field: 'shipKey',
                headerName: '이동지시번호',
                editable: false,
                suppressMenu: true,
                headerCheckboxSelection: true,
                headerCheckboxSelectionFilteredOnly: true,
                checkboxSelection: true
            },
            { field: 'orderKey', headerName: '주문번호', editable: false, suppressMenu: true },
            {
                field: 'orderStoreCd',
                headerName: '주문센터',
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
            { field: 'receiptDt', headerName: '입고일자', editable: false, suppressMenu: true },
            { field: 'assortId', headerName: '품목코드', editable: false, suppressMenu: true },
            { field: 'itemId', headerName: '상품코드', editable: false, suppressMenu: true },
            { field: 'assortNm', headerName: '상품명', editable: false, suppressMenu: true },
            { field: 'optionNm1', headerName: '옵션1', editable: false, suppressMenu: true },
            { field: 'optionNm2', headerName: '옵션2', editable: false, suppressMenu: true },
            {
                field: 'qty',
                headerName: '수량',
                editable: true,
                suppressMenu: true,
                cellStyle: { backgroundColor: '#B5E0F7' }
            }
        ]
    }

    // 화면 그려지기 전에 호출
    useLayoutEffect(() => {
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

    // 조건에 따라 주문이동 가능 내역 조회
    const checkTheValue = () => {
        const { startDt, endDt, storageId, deliMethod, assortId, assortNm } = getData

        if (startDt == '') {
            alert('입고시작일자를 선택하세요.')
            return false
        }

        if (endDt == '') {
            alert('입고종료일자를 선택하세요.')
            return false
        }

        if (storageId == '') {
            alert('출고창고를 선택하세요.')
            return false
        }
        props.setSpin(true)

        let params = {}

        params.startDt = Common.trim(startDt.format('YYYY-MM-DD'))
        params.endDt = Common.trim(endDt.format('YYYY-MM-DD'))
        params.storageId = Common.trim(storageId)
        params.deliMethod = Common.trim(deliMethod)
        params.assortId = Common.trim(assortId)
        params.assortNm = Common.trim(assortNm)

        const p = new URLSearchParams(params)

        console.log('getData : ' + JSON.stringify(params))

        return Https.getOrderItemMoveOrder(p)
            .then(response => {
                console.log(response)

                let target = response.data.data
                setState({
                    ...state,
                    rowData: target // 화면에 보여줄 리스트
                })
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
            })
            .finally(() => {
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

    // 입고시작일자 변경
    const handleChangeStartDate = e => {
        setGetData({
            ...getData,
            startDt: e
        })
    }

    // 입고종료일자 변경
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

    // 이동방법 선택
    const handleChangeDelivery = e => {
        setGetData({
            ...getData,
            deliMethod: e
        })
    }

    // 입고수량 저장하기
    const saveOrderItemMove = e => {
        var selectedRows = gridApi.getSelectedRows()

        if (selectedRows.length == 0) {
            alert('입고할 내역을 선택해 주세요')
            return false
        }

        const config = { headers: { 'Content-Type': 'application/json' } }

        let params = {}

        params.storageId = Common.trim(getData.storageId)
        params.startDt = Common.trim(getData.startDt.format('YYYY-MM-DD'))
        params.endDt = Common.trim(getData.endDt.format('YYYY-MM-DD'))
        params.assortId = Common.trim(getData.assortId)
        params.assortNm = Common.trim(getData.assortNm)
        params.deliMethod = Common.trim(getData.deliMethod)
        params.userId = Common.trim(getData.userId)
        params.moves = selectedRows

        console.log(JSON.stringify(params))

        props.setSpin(true)
        return Https.postOrderItemMoveOrder(params, config)
            .then(response => {
                //message.success('저장 성공')
                console.log(response)
                removeProduct()
            })
            .catch(error => {
                console.error(error)
                Common.commonNotification({
                    kind: 'error',
                    message: '에러 발생',
                    description: '잠시후 다시 시도해 주세요'
                })
            })
            .finally(() => {
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

    // 선택된 상품 삭제 하기
    const removeProduct = () => {
        var selectedRows = gridApi.getSelectedRows()

        let temp = state.rowData

        for (let i = 0; i < selectedRows.length; i++) {
            temp = temp.filter(element => {
                return !(element.orderkey == selectedRows[i].orderkey && element.receiptDt == selectedRows[i].receiptDt)
            })
        }

        setState({
            ...state,
            rowData: [...temp]
        })
    }

    return (
        <>
            <CustomBreadcrumb style={{ marginBottom: '0px' }} arr={['이동', '주문이동지시']}></CustomBreadcrumb>
            <Row type='flex' justify='end' gutter={[16, 8]}>
                <Col style={{ width: '150px' }}>
                    <Button type='primary' className='fullWidth search' onClick={checkTheValue} ghost>
                        조회
                    </Button>
                </Col>
                <Col style={{ width: '150px' }}>
                    <Button type='primary' className='fullWidth' onClick={saveOrderItemMove}>
                        저장
                    </Button>
                </Col>
            </Row>
            <Divider style={{ margin: '10px 0' }} />
            <Row gutter={[16, 8]}>
                <Col span={20}>
                    <Row gutter={[16, 8]} className='onVerticalCenter marginTop-10'>
                        <Col span={4}>
                            <Text className='font-15 NanumGothic-Regular' strong>
                                입고일자
                            </Text>
                        </Col>
                        <Col span={6}>
                            <DatePicker
                                name='startDt'
                                className='fullWidth'
                                value={getData.startDt}
                                onChange={handleChangeStartDate}
                            />
                        </Col>
                        <Col span={6}>
                            <DatePicker
                                name='endDt'
                                className='fullWidth'
                                value={getData.endDt}
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
                        <Col span={12}>
                            <Select
                                placeholder='출고창고선택'
                                className='fullWidth'
                                value={getData.storageId}
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
                    <Row gutter={[16, 8]} className='onVerticalCenter marginTop-10'>
                        <Col span={4}>
                            <Text className='font-15 NanumGothic-Regular' strong>
                                이동방법
                            </Text>
                        </Col>
                        <Col span={12}>
                            <Select
                                name='deliMethod'
                                placeholder='이동방법을 선택해 주세요'
                                className='fullWidth'
                                onChange={handleChangeDelivery}>
                                {shipmentList.map(item => (
                                    <Option key={item.value}>{item.label}</Option>
                                ))}
                            </Select>
                        </Col>
                    </Row>
                </Col>
            </Row>

            <Row className=' marginTop-10'>
                <div className='ag-theme-alpine' style={{ height: 550, width: '100%' }}>
                    <AgGridReact
                        enableCellTextSelection={true}
                        rowData={state.rowData}
                        suppressDragLeaveHidesColumns={true}
                        defaultColDef={{ flex: 1, minWidth: 100, resizable: true }}
                        suppressRowClickSelection={true}
                        onFirstDataRendered={onFirstDataRendered}
                        rowSelection={'multiple'}
                        columnDefs={columnDefs()}
                        onGridReady={onGridReady}></AgGridReact>
                </div>
            </Row>
        </>
    )
}

export default withRouter(OrderItemMoveOrder)
