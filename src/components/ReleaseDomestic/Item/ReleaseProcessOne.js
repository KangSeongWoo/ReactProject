import React, { useState, useEffect, useLayoutEffect , useMemo } from 'react'
import queryStirng from 'query-string'
import { withRouter } from 'react-router-dom'
import moment from 'moment'
import { Row, Col, Input, DatePicker, Select, Typography, Button } from 'antd'
import { AgGridReact } from 'ag-grid-react'
import Https from '../../../api/http'
import CustomBreadcrumb from '/src/utils/CustomBreadcrumb'
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
        purchaseVendorId: '00',
        storageId: '',
        orderDate: moment(),
        releaseDate: moment(),
        releaseCallDate: moment(),
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
            { field: 'cost', headerName: '원가', editable: false, suppressMenu: true }
        ]
    })

    // 화면 그려지기 전에 호출
    useLayoutEffect(() => {
        window.addEventListener('resize', () => props.setHeight());
        props.setHeight();
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
        } finally {
            setView()
        }
    }

    const setView = async () => {
        try {
            let res = await Https.getReleaseProcessOne(getData)

            console.log('---------------------------------------------------')
            console.log(JSON.stringify(res))

            setState({
                ...state,
                height: window.innerHeight - (document.querySelector('header') != undefined ? document.querySelector('header').clientHeight : 0) - (document.querySelector('footer') != undefined ? document.querySelector('footer').clientHeight : 0) - document.querySelector('.notice-condition').clientHeight - 100,
                rowData: res.data.data.ships
            })

            setGetData({
                ...getData,
                purchaseVendorId: res.data.data.vendorId,
                storageId: res.data.data.storageId,
                orderDate: moment(res.data.data.orderDt),
                releaseDate: moment(res.data.data.shipDt),
                releaseCallDate: moment(res.data.data.shipIndicateDt),

                depositDt: moment(res.data.data.depositDt)
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

    const onSelectionChanged = () => {
        var selectedRows = gridApi.getSelectedRows()
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

    // 출고일자 선택
    const handleChangeReleaseDate = e => {
        setGetData({
            ...getData,
            releaseDate: e
        })
    }

    // 구매처 선택
    const handleChangeVendorOption = e => {
        setGetData({
            ...getData,
            purchaseVendorId: e
        })
    }

    // 창고 선택
    const handleChangeStorageOption = e => {
        setGetData({
            ...getData,
            storageId: e
        })
    }

    const defaultColDef = useMemo(() => {
        return {
          sortable: true,
          flex: 1, minWidth: 100, resizable: true 
        };
    }, []);

    return (
        <>
            <CustomBreadcrumb style={{ marginBottom: '0px' }} arr={['국내출고', '국내출고처리']}></CustomBreadcrumb>
            <div className='notice-wrapper'>
                <div className='notice-condition' style={{ marginTop: '6px' }}>
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
                                value={getData.storageId != '' ? getData.storageId : ''}
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
                                value={getData.purchaseVendorId != '' ? getData.purchaseVendorId : ''}
                                name='selectVendor'
                                onChange={handleChangeVendorOption}
                                disabled>
                                {purchaseVendorList.map(item => (
                                    <Option key={item.value}>{item.label}</Option>
                                ))}
                            </Select>
                        </Col>
                    </Row>
                </Col>
            </Row>
            <Row gutter={[16, 8]}>
                <Col span={8}>
                    <Row gutter={[16, 8]} className='onVerticalCenter marginTop-10'>
                        <Col span={10}>
                            <Text className='font-15 NanumGothic-Regular' strong>
                                주문일자
                            </Text>
                        </Col>
                        <Col span={12}>
                            <DatePicker
                                name='orderDate'
                                className='fullWidth'
                                value={getData.orderDate}
                                onChange={handleChangeOrderDate}
                                disabled
                            />
                        </Col>
                    </Row>
                </Col>
                <Col span={8}>
                    <Row gutter={[16, 8]} className='onVerticalCenter marginTop-10'>
                        <Col span={10}>
                            <Text className='font-15 NanumGothic-Regular' strong>
                                출고지시일자
                            </Text>
                        </Col>
                        <Col span={12}>
                            <DatePicker
                                name='releaseDate'
                                className='fullWidth'
                                value={getData.releaseCallDate}
                                onChange={handleChangeReleaseCallDate}
                                disabled
                            />
                        </Col>
                    </Row>
                </Col>
                <Col span={8}>
                    <Row gutter={[16, 8]} className='onVerticalCenter marginTop-10'>
                        <Col span={10}>
                            <Text className='font-15 NanumGothic-Regular' strong>
                                출고일자
                            </Text>
                        </Col>
                        <Col span={12}>
                            <DatePicker
                                name='releaseDate'
                                className='fullWidth'
                                value={getData.releaseDate}
                                onChange={handleChangeReleaseDate}
                                disabled
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
                        // rowSelection={'multiple'}
                        onSelectionChanged={onSelectionChanged}
                        columnDefs={state.columnDefs}
                        onGridReady={onGridReady}></AgGridReact>
                </div>
            </Row>
            </div>
        </>
    )
}

//export default Create
export default withRouter(ReleaseOrderOne)
