import React, { useState, useLayoutEffect, useEffect } from 'react'
import queryStirng from 'query-string'
import { withRouter } from 'react-router-dom'
import moment from 'moment'
import { Row, Col, Input, DatePicker, Select, Typography } from 'antd'
import CustomBreadcrumb from '/src/utils/CustomBreadcrumb'
import { AgGridReact } from 'ag-grid-react'
import Https from '../../../api/http'
import * as GridKeyValue from '../../../utils/GridKeyValue'
import * as Helpers from '../../../utils/Helpers'
import * as Constans from '../../../utils/Constans'

import '/src/style/custom.css'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-alpine.css'

const { Text } = Typography
const { Option } = Select

// 상품구분 JSON
let newAssortgb = {}
for (let i = 0; i < Constans.ASSORTGB.length; i++) {
    newAssortgb[Constans.ASSORTGB[i].value] = Constans.ASSORTGB[i].label
}

const ReleaseOrderOne = props => {
    let params = queryStirng.parse(props.params)

    const [gridApi, setGridApi] = useState(null)
    const [gridColumnApi, setGridColumnApi] = useState(null)
    const [purchaseVendorList, setPurchaseVendorList] = useState([])
    const [storageList, setStorageList] = useState([])

    // API 호출 get state
    const [getData, setGetData] = useState({
        vendorId: '',
        storageId: '',
        orderDt: '',
        shipIndicateDt: '',
        shipId: params.shipId
    })

    // 화면 노출 상태 state
    const [state, setState] = useState({
        rowData: [],
        columnDefs: [
            { field: 'shipKey', headerName: '출고지시번호', editable: false, suppressMenu: true },
            { field: 'orderKey', headerName: '주문번호', editable: false, suppressMenu: true },
            {
                field: 'assortGb',
                headerName: '상품구분',
                editable: false,
                suppressMenu: true,
                cellEditor: 'select',
                cellEditorParams: {
                    values: Helpers.extractValues(newAssortgb)
                },
                valueFormatter: function(params) {
                    return Helpers.lookupValue(newAssortgb, params.value)
                },
                valueParser: function(params) {
                    return Helpers.lookupKey(newAssortgb, params.newValue)
                }
            },
            {
                field: 'deliMethod',
                headerName: '배송방법',
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
            { field: 'assortId', headerName: '품목코드', editable: false, suppressMenu: true },
            { field: 'itemId', headerName: '상품코드', editable: false, suppressMenu: true },
            { field: 'assortNm', headerName: '상품명', editable: false, suppressMenu: true },
            { field: 'optionNm1', headerName: '옵션1', editable: false, suppressMenu: true },
            { field: 'optionNm2', headerName: '옵션2', editable: false, suppressMenu: true },
            { field: 'qty', headerName: '수량', editable: false, suppressMenu: true },
            { field: 'cost', headerName: '원가', editable: false, suppressMenu: true }
        ]
    })

    // 화면 그려지기 전에 호출
    useLayoutEffect(() => {
        setInit()
    }, [])

    // 화면초기화
    const setInit = async () => {
        try {
            props.setSpin(true)

            let res = await Https.getStorageList()
            console.log('---------------------------------------------------')
            console.log(res)

            setStorageList(res.data.data.Storages) // 입고창고 State
        } catch (error) {
            console.error(error)
            props.setSpin(false)
        } finally {
            getVendorList()
        }
    }

    // 구매처 리스트 호출
    const getVendorList = async () => {
        try {
            let res = await Https.getVendorList()
            console.log('---------------------------------------------------')
            console.log(res)
            setPurchaseVendorList(res.data.data.PurchaseVendors) // 구매처 State
        } catch (error) {
            console.error(error)
            props.setSpin(false)
        } finally {
            setView()
        }
    }

    const setView = async () => {
        try {
            let res = await Https.getReleasOne(getData)

            console.log('---------------------------------------------------')
            console.log(JSON.stringify(res))

            setState({
                ...state,
                rowData: res.data.data.ships
            })

            setGetData({
                ...getData,
                shipId: res.data.data.shipId,
                vendorId: res.data.data.vendorId,
                storageId: res.data.data.storageId,
                orderDt: moment(res.data.data.orderDt),
                shipIndicateDt: moment(res.data.data.shipIndicateDt)
            })
        } catch (error) {
            console.error(error)
        } finally {
            props.setSpin(false)
        }
    }

    const onGridReady = params => {
        setGridApi(params.api)
        setGridColumnApi(params.columnApi)
    }

    // Input 입력
    const handlechangeInput = e => {
        setGetData({
            ...getData,
            [e.target.name]: e.target.value
        })
    }

    // 입고 날짜 선택
    const handleChangeOrderDate = e => {
        setGetData({
            ...getData,
            orderDate: e
        })
    }

    // 출고지시일자 선택
    const handleChangeReleaseCallDate = e => {
        setGetData({
            ...getData,
            releaseCallDate: e
        })
    }

    // 구매처 선택
    const handleChangeVendorOption = e => {
        setGetData({
            ...getData,
            vendorId: e
        })
    }

    // 창고 선택
    const handleChangeStorageOption = e => {
        setGetData({
            ...getData,
            storageId: e
        })
    }

    // 컬럼 리사이즈
    const onFirstDataRendered = params => {
        var allColumnIds = []
        //debugger;
        params.columnApi.getAllColumns().forEach(function(column) {
            allColumnIds.push(column.colId)
        })

        params.columnApi.autoSizeColumns(allColumnIds, true)
    }

    return (
        <>
            <CustomBreadcrumb arr={['국내출고', '국내출고지시']}></CustomBreadcrumb>
            <Row gutter={[16, 8]}>
                <Col span={20}>
                    <Row gutter={[16, 8]} className='onVerticalCenter marginTop-10'>
                        <Col span={4}>
                            <Text className='font-15 NanumGothic-Regular' strong>
                                출고지시번호
                            </Text>
                        </Col>
                        <Col span={6}>
                            <Input
                                name='shipId'
                                placeholder='shipId'
                                className='fullWidth'
                                defaultValue={getData.shipId}
                                onInput={handlechangeInput}
                                disabled
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
                                placeholder='출고창고선택'
                                className='fullWidth'
                                value={getData.storageId}
                                name='selectStorage'
                                onChange={handleChangeStorageOption}
                                disabled>
                                {storageList.map(item => (
                                    <Option key={item.value}>{item.label}</Option>
                                ))}
                            </Select>
                        </Col>
                    </Row>
                    <Row gutter={[16, 8]} className='onVerticalCenter marginTop-10'>
                        <Col span={4}>
                            <Text className='font-15 NanumGothic-Regular' strong>
                                구매처
                            </Text>
                        </Col>
                        <Col span={6}>
                            <Select
                                placeholder='구매처선택'
                                className='fullWidth'
                                value={getData.vendorId}
                                name='selectVendor'
                                onChange={handleChangeVendorOption}
                                disabled>
                                {purchaseVendorList.map(item => (
                                    <Option key={item.value}>{item.label}</Option>
                                ))}
                            </Select>
                        </Col>
                    </Row>
                    <Row gutter={[16, 8]} className='onVerticalCenter marginTop-10'>
                        <Col span={4}>
                            <Text className='font-15 NanumGothic-Regular' strong>
                                주문일자
                            </Text>
                        </Col>
                        <Col span={6}>
                            <DatePicker
                                name='orderDate'
                                className='fullWidth'
                                value={getData.orderDt}
                                onChange={handleChangeOrderDate}
                                disabled
                            />
                        </Col>
                    </Row>
                    <Row gutter={[16, 8]} className='onVerticalCenter marginTop-10'>
                        <Col span={4}>
                            <Text className='font-15 NanumGothic-Regular' strong>
                                출고지시일자
                            </Text>
                        </Col>
                        <Col span={6}>
                            <DatePicker
                                name='releaseDate'
                                className='fullWidth'
                                value={getData.shipIndicateDt}
                                onChange={handleChangeReleaseCallDate}
                                disabled
                            />
                        </Col>
                    </Row>
                </Col>
                {/* <Col span={4}>
                    <Row>
                        <Col span={12}>
                            <Button type='primary' className='fullWidth margin-10'>
                                출고지시취소
                            </Button>
                        </Col>
                    </Row>
                </Col> */}
            </Row>

            <Row className='marginTop-10'>
                <div className='ag-theme-alpine' style={{ height: 550, width: '100%' }}>
                    <AgGridReact
                        enableCellTextSelection={true}
                        rowData={state.rowData}
                        suppressDragLeaveHidesColumns={true}
                        defaultColDef={{ flex: 1, minWidth: 100, resizable: true }}
                        // rowSelection={'multiple'}
                        onFirstDataRendered={onFirstDataRendered}
                        columnDefs={state.columnDefs}
                        onGridReady={onGridReady}></AgGridReact>
                </div>
            </Row>
        </>
    )
}

//export default Create
export default withRouter(ReleaseOrderOne)
