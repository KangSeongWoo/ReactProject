import React, { useState, useLayoutEffect, useCallback , useMemo, useEffect } from 'react'
import queryStirng from 'query-string'
import { withRouter } from 'react-router-dom'
import CustomBreadcrumb from '/src/utils/CustomBreadcrumb'
import moment from 'moment'
import { Row, Col, Button, Input, Typography, DatePicker, Select, Divider, Spin } from 'antd'
import { AgGridReact } from 'ag-grid-react'
import Https from '/src/api/http'
import * as Helpers from '/src/utils/Helpers'
import * as Common from '/src/utils/Common.js'

import '/src/style/custom.css'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-alpine.css'

const { Text } = Typography
const { Option } = Select

const DepositGoods = props => {
    const [gridApi, setGridApi] = useState(null)
    const [gridColumnApi, setGridColumnApi] = useState(null)
    const [purchaseVendorList, setPurchaseVendorList] = useState([])
    const [purchaseVendorGridKey, setPurchaseVendorGridKey] = useState({})

    // API 호출 get state
    const [getData, setGetData] = useState({
        startDt: moment().subtract(7, 'd'),
        endDt: moment(),
        purchaseVendorId: '00',
        assortId: '',
        storageId: '000001',
        assortNm: ''
    })

    // 화면 노출 상태 state
    const [state, setState] = useState({
        rowData: []
    })

    const columnDefs = () => {
        return [
            { field: 'depositKey', headerName: '입고번호', editable: false, suppressMenu: true },
            { field: 'orderkey', headerName: '주문번호', editable: false, suppressMenu: true },
            {
                field: 'depositDt',
                headerName: '입고일자',
                editable: false,
                suppressMenu: true,
                valueFormatter: function(params) {
                    return params.value.substr(0, 10)
                }
            },
            {
                field: 'purchaseVendorId',
                headerName: '구매처',
                editable: false,
                suppressMenu: true,
                cellEditor: 'select',
                cellEditorParams: {
                    values: Helpers.extractValues(purchaseVendorGridKey)
                },
                valueFormatter: function(params) {
                    return Helpers.lookupValue(purchaseVendorGridKey, params.value)
                },
                valueParser: function(params) {
                    return Helpers.lookupKey(purchaseVendorGridKey, params.newValue)
                }
            },
            { field: 'assortId', headerName: '품목코드', editable: false, suppressMenu: true },
            { field: 'itemId', headerName: '상품코드', editable: false, suppressMenu: true },
            { field: 'assortNm', headerName: '상품명', editable: false, suppressMenu: true },
            { field: 'optionNm1', headerName: '옵션1', editable: false, suppressMenu: true },
            { field: 'optionNm2', headerName: '옵션2', editable: false, suppressMenu: true },
            { field: 'optionNm3', headerName: '옵션3', editable: false, suppressMenu: true },
            { field: 'depositQty', headerName: '수량', editable: false, suppressMenu: true }
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
        setInit()
    }, [])

    // 화면초기화
    const setInit = async () => {
        try {
            props.setSpin(true)

            let res = await Https.getVendorList()
            console.log('---------------------------------------------------')
            console.log(res)

            setPurchaseVendorList(res.data.data.PurchaseVendors) // 구매처 State
            setPurchaseVendorGridKey(res.data.data.purchaseVendorsGridKey)
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

    // 입고 시작 날짜 선택
    const handleChangeStartDate = e => {
        setGetData({
            ...getData,
            startDt: e
        })
    }

    // 입고 종료 날짜 선택
    const handleChangeEndDate = e => {
        setGetData({
            ...getData,
            endDt: e
        })
    }

    // 구매처 선택
    const handleChangeOption = e => {
        setGetData({
            ...getData,
            purchaseVendorId: e
        })
    }

    // Input 입력
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

    // 조건에 맞는 리스트 찾기
    const getSearchList = () => {
        const { startDt, endDt, purchaseVendorId, assortId, assortNm, storageId } = getData

        // if (depositDt == "") {
        //     alert("입고일자를 선택해 주세요.");
        //     return false;
        // } else if (assortId == "" && assortNm == "") {
        //     alert("상품코드나 상품명을 입력해주세요");
        //     return false;
        // } else if (purchaseVendorId == "00" || purchaseVendorId == "") {
        //     alert("구매처를 선택해 주세요");
        //     return false;
        // }

        let params = {}

        params.startDt = Common.trim(startDt.format('YYYY-MM-DD'))
        params.endDt = Common.trim(endDt.format('YYYY-MM-DD'))
        params.purchaseVendorId = purchaseVendorId != '00' ? Common.trim(purchaseVendorId) : ''
        params.assortId = Common.trim(assortId)
        params.assortNm = Common.trim(assortNm)
        params.storageId = Common.trim(storageId)

        console.log('params : ' + JSON.stringify(params))

        const p = new URLSearchParams(params)

        props.setSpin(true)

        return Https.getDepositList(p)
            .then(response => {
                console.log(JSON.stringify(response))

                setState({
                    ...state,
                    rowData: response.data.data.depositList
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

    //상세 이동
    const goDetail = e => {
        e.data.displayKd = 'POP'
        //window.location.href = '/#/DepositDomestic/depositOne?' + queryStirng.stringify(e.data)
        window
            .open(
                '/#/DepositDomestic/depositOne?' + queryStirng.stringify(e.data),
                '상세' + new Date(),
                'toolbar=no,location=no,directories=no,status=no,scrollbars=yes,resizable=no,width=1610,height=1402,top=, left= '
            )
            .focus()
    }

    const defaultColDef = useMemo(() => {
        return {
          sortable: true,flex: 1, minWidth: 100, resizable: true 
        };
    }, []);

    return (
        <>
            <CustomBreadcrumb style={{ marginBottom: '0px' }} arr={['국내입고', '국내입고리스트']}></CustomBreadcrumb>
            <div className='notice-wrapper'>
                <div className='notice-condition'>
            <Row type='flex' justify='end' gutter={[16, 8]}>
                <Col style={{ width: '150px' }}>
                    <Button type='primary' className='fullWidth search' onClick={getSearchList}>
                        조회
                    </Button>
                </Col>
            </Row>
            <Divider style={{ margin: '10px 0' }} />
            <Row>
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
                                상품코드
                            </Text>
                        </Col>
                        <Col span={6}>
                            <Input
                                name='assortId'
                                placeholder='상품코드'
                                className='fullWidth'
                                value={getData.assortId != '' ? getData.assortId : undefined}
                                onInput={handlechangeInput}
                            />
                        </Col>
                        <Col span={6}>
                            <Input
                                name='assortNm'
                                placeholder='상품명'
                                className='fullWidth'
                                value={getData.assortNm != '' ? getData.assortNm : undefined}
                                onInput={handlechangeInput}
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
                                name='selectVendor'
                                onChange={handleChangeOption}
                                value={getData.purchaseVendorId}>
                                <Option key='00'>선택</Option>
                                {purchaseVendorList.map(item => (
                                    <Option key={item.value}>{item.label}</Option>
                                ))}
                            </Select>
                        </Col>
                    </Row>
                </Col>
            </Row>
            </div>
            <Row className='marginTop-10'>
                <div className='ag-theme-alpine' style={{ height: props.height, width: '100%' }}>
                    <AgGridReact defaultColDef={defaultColDef} multiSortKey={'ctrl'}
                        enableCellTextSelection={true}
                        suppressDragLeaveHidesColumns={true}
                        rowData={state.rowData}
                        // rowSelection={'multiple'}
                        onFirstDataRendered={onFirstDataRendered}
                        columnDefs={columnDefs()}
                        onRowClicked={goDetail}
                        onGridReady={onGridReady}></AgGridReact>
                </div>
            </Row>
            </div>
        </>
    )
}

export default withRouter(DepositGoods)
