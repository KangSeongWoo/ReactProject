import React, { useState, useLayoutEffect, useEffect , useMemo } from 'react'
import CustomBreadcrumb from '/src/utils/CustomBreadcrumb'
import queryStirng from 'query-string'
import { withRouter } from 'react-router-dom'
import moment from 'moment'
import { Row, Col, Input, DatePicker, Select, Typography, Spin } from 'antd'
import { AgGridReact } from 'ag-grid-react'
import Https from '/src/api/http'
import * as Helpers from '/src/utils/Helpers'
import * as Constans from '/src/utils/Constans'

import '/src/style/custom.css'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-alpine.css'

const { Text } = Typography
const { Option } = Select

// 발주구분 JSON
let newDealtypecd = {}
for (let i = 0; i < Constans.DEALTYPECD.length; i++) {
    newDealtypecd[Constans.DEALTYPECD[i].value] = Constans.DEALTYPECD[i].label
}

const DepositOne = props => {
    let params = queryStirng.parse(props.params)

    console.log('params : ' + JSON.stringify(params))

    const [gridApi, setGridApi] = useState(null)
    const [gridColumnApi, setGridColumnApi] = useState(null)
    const [purchaseVendorList, setPurchaseVendorList] = useState([])

    // API 호출 get state
    const [getData, setGetData] = useState({
        vendorId: '',
        depositNo: params.depositNo,
        depositDt: '',
    })

    // 화면 노출 상태 state
    const [state, setState] = useState({
        rowData: null,
        columnDefs: [
            { field: 'depositKey', headerName: '입고번호', editable: false, suppressMenu: true },
            { field: 'purchaseKey', headerName: '발주번호', editable: false, suppressMenu: true },
            {
                field: 'dealtypeCd',
                headerName: '발주구분',
                editable: false,
                suppressMenu: true,
                cellEditor: 'select',
                cellEditorParams: {
                    values: Helpers.extractValues(newDealtypecd)
                },
                valueFormatter: function(params) {
                    return Helpers.lookupValue(newDealtypecd, params.value)
                },
                valueParser: function(params) {
                    return Helpers.lookupKey(newDealtypecd, params.newValue)
                }
            },
            { field: 'assortId', headerName: '품목코드', editable: false, suppressMenu: true },
            { field: 'itemId', headerName: '상품코드', editable: false, suppressMenu: true },
            { field: 'itemNm', headerName: '상품명', editable: false, suppressMenu: true },
            { field: 'optionNm1', headerName: '옵션1', editable: false, suppressMenu: true },
            { field: 'optionNm2', headerName: '옵션2', editable: false, suppressMenu: true },
            { field: 'optionNm3', headerName: '옵션3', editable: false, suppressMenu: true },
            { field: 'depositQty', headerName: '수량', editable: false, suppressMenu: true },
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
            { field: 'extraUnitcost', headerName: '원가', editable: false, suppressMenu: true }
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
        props.setSpin(true)
        try {
            let res = await Https.getVendorList()

            console.log('---------------------------------------------------')
            console.log(JSON.stringify(res))

            setPurchaseVendorList(res.data.data.PurchaseVendors)
        } catch (error) {
            console.error(error)
            props.setSpin(false)
        } finally {
            setView()
        }
    }

    const setView = async () => {
        try {
            let res = await Https.getDepositOne(getData)

            console.log('---------------------------------------------------')
            console.log(JSON.stringify(res))

            setState({
                ...state,
                height: window.innerHeight - (document.querySelector('header') != undefined ? document.querySelector('header').clientHeight : 0) - (document.querySelector('footer') != undefined ? document.querySelector('footer').clientHeight : 0) - document.querySelector('.notice-condition').clientHeight - 100,
                rowData: res.data.data.items
            })

            setGetData({
                ...getData,
                vendorId: res.data.data.vendorId,
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

    // 컬럼 리사이즈
    const onFirstDataRendered = params => {
        var allColumnIds = []
        params.columnApi.getAllColumns().forEach(function(column) {
            allColumnIds.push(column.colId)
        })

        params.columnApi.autoSizeColumns(allColumnIds, false)
    }

    // Input 입력
    const handlechangeInput = e => {
        setGetData({
            ...getData,
            [e.target.name]: e.target.value
        })
    }

    // 입고 날짜 선택
    const handleChangeDate = e => {
        setGetData({
            ...getData,
            depositDate: e
        })
    }

    // 구매처 선택
    const handleChangeOption = e => {
        setGetData({
            ...getData,
            vendorId: e
        })
    }

    const defaultColDef = useMemo(() => {
        return {
          sortable: true,flex: 1, minWidth: 100, resizable: true
        };
    }, []);

    return (
        <>
            <CustomBreadcrumb style={{ marginBottom: '0px' }} arr={['국내입고', '국내입고내역']}></CustomBreadcrumb>
            <div className='notice-wrapper'>
                <div className='notice-condition'>
                    <Row gutter={[16, 8]}>
                        <Col span={20}>
                            <Row gutter={[16, 8]} className='onVerticalCenter marginTop-10'>
                                <Col span={4}>
                                    <Text className='font-15 NanumGothic-Regular' strong>
                                        입고번호
                                    </Text>
                                </Col>
                                <Col span={6}>
                                    <Input
                                        name='depositNo'
                                        className='fullWidth'
                                        defaultValue={getData.depositNo != '' ? getData.depositNo : ''}
                                        onInput={handlechangeInput}
                                        disabled
                                    />
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
                                        className='fullWidth'
                                        value={getData.vendorId}
                                        name='selectVendor'
                                        onChange={handleChangeOption}
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
                                        입고일자
                                    </Text>
                                </Col>
                                <Col span={6}>
                                    <DatePicker
                                        name='depositDt'
                                        className='fullWidth'
                                        value={getData.depositDt}
                                        onChange={handleChangeDate}
                                        disabled
                                    />
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </div>
                
                <Row className=' marginTop-10'>
                    <div className='ag-theme-alpine' style={{ height: props.height, width: '100%' }}>
                        <AgGridReact defaultColDef={defaultColDef} multiSortKey={'ctrl'}
                            enableCellTextSelection={true}
                            suppressDragLeaveHidesColumns={true}
                            rowData={state.rowData}
                            // rowSelection={'multiple'}
                            columnDefs={state.columnDefs}
                            onFirstDataRendered={onFirstDataRendered}
                            // colResizeDefault={'shift'}
                            onGridReady={onGridReady}></AgGridReact>
                    </div>
                </Row>
            </div>
        </>
    )
}

//export default Create
export default withRouter(DepositOne)
