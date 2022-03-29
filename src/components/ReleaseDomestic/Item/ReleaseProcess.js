import React, { useState, useLayoutEffect, useCallback , useMemo,useEffect } from 'react'
import CustomBreadcrumb from '/src/utils/CustomBreadcrumb'
import { withRouter } from 'react-router-dom'
import moment from 'moment'
import { Row, Col, Button, Input, DatePicker, Select, Typography, Divider, Spin } from 'antd'
import { AgGridReact } from 'ag-grid-react'
import Https from '../../../api/http'
import * as Common from '../../../utils/Common.js'
import * as XLSX from 'xlsx'

import '/src/style/custom.css'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-alpine.css'

const { Text } = Typography
const { Option } = Select

const ReleaseProcess = props => {
    const { userId } = props.userId
    const [gridApi, setGridApi] = useState(null)
    const [gridColumnApi, setGridColumnApi] = useState(null)
    const [purchaseVendorList, setPurchaseVendorList] = useState([])
    const [selectedRows, setSelectedRows] = useState(0);

    // API 호출 get state
    const [getData, setGetData] = useState({
        startDt: moment().subtract(7, 'day'),
        endDt: moment(),
        vendorId: '00',
        assortId: '',
        assortNm: '',
        storageId: '000001',
        orderId: '',
        shipId: '',
        userId : userId
    })

    // 화면 노출 상태 state
    const [state, setState] = useState({
        rowData: [],
        columnDefs: [
            {
                field: 'shipIndDt',
                headerName: '출고지시일자',
                editable: false,
                suppressMenu: true,
                headerCheckboxSelection: true,
                headerCheckboxSelectionFilteredOnly: true,
                checkboxSelection: true
            },
            //{ field: 'shipKey', headerName: '출고지시번호', editable: false, suppressMenu: true },
            { field: 'channelOrderNo', headerName: '고도몰주문번호', editable: false, suppressMenu: true },
            { field: 'channelGoodsNo', headerName: '고도몰상품코드', editable: false, suppressMenu: true },
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
            { field: 'receiverNm', headerName: '수령인', editable: false, suppressMenu: true },
            //{ field: 'orderKey', headerName: '주문번호', editable: false, suppressMenu: true },
            //{ field: 'assortId', headerName: '품목코드', editable: false, suppressMenu: true },
            //{ field: 'itemId', headerName: '상품코드', editable: false, suppressMenu: true },
            { field: 'assortNm', headerName: '상품명', editable: false, suppressMenu: true },
            { field: 'optionNm1', headerName: '옵션1', editable: false, suppressMenu: true },
            { field: 'optionNm2', headerName: '옵션2', editable: false, suppressMenu: true },
            { field: 'optionNm3', headerName: '옵션3', editable: false, suppressMenu: true },
            { field: 'qty', headerName: '출고지시수량', editable: false, suppressMenu: true },
            { field: 'receiverAddr1', headerName: '수취인기본주소', editable: false, suppressMenu: true },
            { field: 'receiverAddr2', headerName: '수취인상세주소', editable: false, suppressMenu: true },
            { field: 'receiverHp', headerName: '수취인연락처', editable: false, suppressMenu: true },
        ]
    })

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
            let res = await Https.getVendorList()
            console.log('---------------------------------------------------')
            console.log(res)
            setPurchaseVendorList(res.data.data.PurchaseVendors) // 구매처 State
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

        setGetData({
            ...getData,
            ships: selectedRows
        })
        
        setSelectedRows(selectedRows.length);
    }

    // 출고 시작 날짜 선택
    const handleChangeStartDate = e => {
        setGetData({
            ...getData,
            startDt: e
        })
    }

    // 출고 종료 날짜 선택
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
            vendorId: e
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

    // 컬럼 리사이즈
    const onFirstDataRendered = params => {
        var allColumnIds = []
        //debugger;
        params.columnApi.getAllColumns().forEach(function(column) {
            allColumnIds.push(column.colId)
        })

        params.columnApi.autoSizeColumns(allColumnIds, true)
    }

    // 조건에 맞는 리스트 찾기
    const getSearchList = () => {
        props.setSpin(true)
        const { startDt, endDt, vendorId, assortId, assortNm, shipId, storageId, orderId } = getData

        let params = {}

        params.startDt = Common.trim(startDt.format('YYYY-MM-DD'))
        params.endDt = Common.trim(endDt.format('YYYY-MM-DD'))
        params.vendorId = vendorId != '00' ? Common.trim(vendorId) : ''
        params.assortId = Common.trim(assortId)
        params.assortNm = Common.trim(assortNm)
        params.shipId = Common.trim(shipId)
        params.storageId = Common.trim(storageId)
        params.orderId = Common.trim(orderId)

        console.log('Params : ' + JSON.stringify(params))

        const p = new URLSearchParams(params)

        return Https.getReleaseProcess(p)
            .then(response => {
                console.log(JSON.stringify(response))

                let target = response.data.data
                setState({
                    ...state,
                    rowData: target.ships, // 화면에 보여줄 리스트
                    purchaseNo: target.purchaseNo, // 발주번호
                    depositStoreId: target.depositStoreId, // 창고아이디
                    vendorId: target.purchaseVendorId // 구매처
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

    // 출고 처리하기
    const orderProcess = e => {
        props.setSpin(true)
        console.log('getData : ' + JSON.stringify(getData))

        if (getData.ships.length == 0) {
            alert('출고처리할 내역을 선택해 주세요')
            return false
        }

        const config = { headers: { 'Content-Type': 'application/json' } }

        console.log(JSON.stringify(getData))

        return Https.postOrderProcess(getData, config)
            .then(response => {
                setGetData({
                    ...getData,
                    ships: []
                })

                console.log(response)
                getSearchList()
                props.setSpin(false)
            })
            .catch(error => {
                console.error(error)
                Common.commonNotification({
                    kind: 'error',
                    message: '에러 발생',
                    description: '잠시후 다시 시도해 주세요'
                })
                setGetData({
                    ...getData,
                    ships: []
                })
                props.setSpin(false)
            }) // ERROR
    }

    const defaultColDef = useMemo(() => {
        return {
          sortable: true,
          flex: 1, minWidth: 100, resizable: true
        };
    }, []);

    const exportExcel = () => {
        props.setSpin(true)
        var wb = XLSX.utils.book_new()

        let l = []

        gridApi.selectAllFiltered()

        if (gridApi.getSelectedRows().length == 0) {
            alert('출력할 데이터가 없습니다.')
            props.setSpin(false)
            return false
        }

        for (let i = 0; i < gridApi.getSelectedRows().length; i++) {
            let tempData = gridApi.getSelectedRows()[i]
            let o = {
                출고지시일자 : tempData.shipIndDt,
                고도몰주문번호 : tempData.channelOrderNo,
                고도몰상품코드 : tempData.channelGoodsNo,
                렉번호 : tempData.rackNo,
                상품명 : tempData.assortNm,
                옵션1 : tempData.optionNm1,
                옵션2 : tempData.optionNm2,
                옵션3 : tempData.optionNm3,
                출고지시수량 : tempData.qty,
                주문자 : tempData.receiverNm,
                수취인기본주소 : tempData.receiverAddr1,
                수취인상세주소 : tempData.receiverAddr2,
                수취인연락처 : tempData.receiverHp
            }
            console.log(o)
            l.push(o)
        }
        var wscols = [
            { wch: 20 },
            { wch: 20 },
            { wch: 15 },
            { wch: 10 },
            { wch: 80 },
            { wch: 20 },
            { wch: 10 },
            { wch: 10 },
            { wch: 10 },
            { wch: 10 },
            { wch: 70 },
            { wch: 20 },
            { wch: 20 },
        ]
        let fname = moment().format('YYYYMMDDHHmmss') + '.xlsx'
        let ws = XLSX.utils.json_to_sheet(l)
        ws['!cols'] = wscols
        XLSX.utils.book_append_sheet(wb, ws, 'sheet1')
        XLSX.writeFile(wb, fname)
        gridApi.deselectAll()
        props.setSpin(false)
    }

    return (
        <>
            <CustomBreadcrumb style={{ marginBottom: '0px' }} arr={['국내출고', '국내출고처리']}></CustomBreadcrumb>
            <div className='notice-wrapper'>
                <div className='notice-condition' style={{ marginTop: '6px' }}>
            <Row type='flex' justify='end' gutter={[16, 8]}>
                <Col style={{ width: '150px' }}>
                    <Button type='primary' className='fullWidth' onClick={exportExcel}>
                        인쇄
                    </Button>
                </Col>
                <Col style={{ width: '150px' }}>
                    <Button type='primary' className='fullWidth search' onClick={getSearchList} ghost>
                        조회
                    </Button>
                </Col>
                <Col style={{ width: '150px' }}>
                    <Button type='primary' className='fullWidth' onClick={orderProcess}>
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
                                출고지시일자
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
                                출고지시번호
                            </Text>
                        </Col>
                        <Col span={6}>
                            <Input
                                name='shipId'
                                placeholder='출고지시번호'
                                className='fullWidth'
                                value={getData.shipId != '' ? getData.shipId : undefined}
                                onInput={handlechangeInput}
                            />
                        </Col>
                    </Row>
                    <Row gutter={[16, 8]} className='onVerticalCenter marginTop-10'>
                        <Col span={4}>
                            <Text className='font-15 NanumGothic-Regular' strong>
                                주문번호
                            </Text>
                        </Col>
                        <Col span={6}>
                            <Input
                                name='orderId'
                                placeholder='주문번호'
                                className='fullWidth'
                                value={getData.orderId != '' ? getData.orderId : undefined}
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
                                defaultValue={getData.vendorId != '' ? getData.vendorId : ''}
                                name='selectVendor'
                                onChange={handleChangeOption}>
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
                <Text className='font-15 NanumGothic-Regular'>총 선택 : {selectedRows}개</Text>
                <div className='ag-theme-alpine marginTop-10' style={{ height: props.height, width: '100%' }}>
                    <AgGridReact
                        defaultColDef={defaultColDef}
                        multiSortKey={'ctrl'}
                        enableCellTextSelection={true}
                        rowData={state.rowData}
                        suppressDragLeaveHidesColumns={true}
                        rowSelection={'multiple'}
                        onFirstDataRendered={onFirstDataRendered}
                        onBodyScroll={onFirstDataRendered}
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
export default withRouter(ReleaseProcess)
