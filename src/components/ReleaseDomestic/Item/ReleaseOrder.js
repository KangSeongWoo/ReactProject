import React, { useState, useLayoutEffect, useEffect, useCallback , useMemo } from 'react'
import CustomBreadcrumb from '/src/utils/CustomBreadcrumb'
import { withRouter } from 'react-router-dom'
import moment from 'moment'
import { Row, Col, Button, Input, Typography, DatePicker, Select, Divider } from 'antd'
import { AgGridReact } from 'ag-grid-react'
import Https from '../../../api/http'
import * as GridKeyValue from '../../../utils/GridKeyValue'
import * as Helpers from '../../../utils/Helpers'
import * as Constans from '../../../utils/Constans'
import * as Common from '../../../utils/Common.js'

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

const ReleaseOrder = props => {
    const { userId } = props;
    const [gridApi, setGridApi] = useState(null)
    const [gridColumnApi, setGridColumnApi] = useState(null)
    const [purchaseVendorList, setPurchaseVendorList] = useState([])
    const [storageList, setStorageList] = useState([])
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
        ships: [],
        userId : userId
    })

    //화면 노출 관련 state
    const [state, setState] = useState({
        loading: false,
        rowData: []
    })

    const columnDefs = () => {
        return [
            {
                field: 'orderDt',
                headerName: '주문일자',
                editable: false,
                suppressMenu: true,
                headerCheckboxSelection: true,
                headerCheckboxSelectionFilteredOnly: true,
                checkboxSelection: true
            },
            //{ field: 'orderKey', headerName: '주문번호', editable: false, suppressMenu: true },
            { field: 'channelOrderNo', headerName: '고도몰주문번호', editable: false, suppressMenu: true },
            { field: 'channelGoodsNo', headerName: '고도몰상품코드', editable: false, suppressMenu: true },
            { field: 'receiverNm', headerName: '수령인', editable: false, suppressMenu: true },
            // {
            //     field: 'assortGb ',
            //     headerName: '상품구분',
            //     editable: false,
            //     suppressMenu: true,
            //     cellEditor: 'select',
            //     cellEditorParams: {
            //         values: Helpers.extractValues(newAssortgb)
            //     },
            //     valueFormatter: function(params) {
            //         return Helpers.lookupValue(newAssortgb, params.value)
            //     },
            //     valueParser: function(params) {
            //         return Helpers.lookupKey(newAssortgb, params.newValue)
            //     }
            // },
            // {
            //     field: 'deliMethod',
            //     headerName: '배송방법',
            //     editable: false,
            //     suppressMenu: true,
            //     cellEditor: 'select',
            //     cellEditorParams: {
            //         values: Helpers.extractValues(GridKeyValue.SHIPMENT)
            //     },
            //     valueFormatter: function(params) {
            //         return Helpers.lookupValue(GridKeyValue.SHIPMENT, params.value)
            //     },
            //     valueParser: function(params) {
            //         return Helpers.lookupKey(GridKeyValue.SHIPMENT, params.newValue)
            //     }
            // },
            // { field: 'assortId', headerName: '품목코드', editable: false, suppressMenu: true },
            // { field: 'itemId', headerName: '상품코드', editable: false, suppressMenu: true },
            { field: 'assortNm', headerName: '상품명', editable: false, suppressMenu: true },
            { field: 'optionNm1', headerName: '옵션1', editable: false, suppressMenu: true },
            { field: 'optionNm2', headerName: '옵션2', editable: false, suppressMenu: true },
            { field: 'optionNm3', headerName: '옵션3', editable: false, suppressMenu: true },
            // {
            //     field: 'rackNo',
            //     headerName: '렉번호',
            //     editable: false,
            //     suppressMenu: true,
            //     valueFormatter: function(params) {
            //         if (params.value == null || params.value == undefined || params.value == '') {
            //             return '999999'
            //         }
            //     }
            // },
            { field: 'availableQty', headerName: '출고지시수량', editable: false, suppressMenu: true }
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
            ships: selectedRows
        })
        
        setSelectedRows(selectedRows.length);
    }

    // 조건에 따라 입고처리 가능 내역 조회
    const checkTheValue = () => {
        const { startDt, endDt, vendorId, assortId, assortNm, storageId, orderId } = getData

        let params = {}

        params.startDt = Common.trim(startDt.format('YYYY-MM-DD'))
        params.endDt = Common.trim(endDt.format('YYYY-MM-DD'))
        params.vendorId = vendorId != '00' ? Common.trim(vendorId) : ''
        params.assortId = Common.trim(assortId)
        params.assortNm = Common.trim(assortNm)
        params.storageId = Common.trim(storageId)
        params.orderId = Common.trim(orderId)

        console.log('Params : ' + JSON.stringify(params))

        const p = new URLSearchParams(params)
        props.setSpin(true)
        return Https.getReleaseOrder(p)
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
            })
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

    // 출고 지시 요청
    const orderRelease = e => {
        console.log('getData : ' + JSON.stringify(getData))

        if (getData.ships.length == 0) {
            alert('출고지시할 내역을 선택해 주세요')
            return false
        }

        const config = { headers: { 'Content-Type': 'application/json' } }

        console.log(JSON.stringify(getData))
        props.setSpin(true)
        return Https.postOrderRelease(getData, config)
            .then(response => {
                props.setSpin(false)

                setGetData({
                    ...getData,
                    ships: []
                })

                //message.success('저장 성공')
                console.log(response)
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

                setGetData({
                    ...getData,
                    ships: []
                })
            }) // ERROR
    }

    const defaultColDef = useMemo(() => {
        return {
          sortable: true,
          flex: 1, minWidth: 100, resizable: true
        };
    }, []);

    return (
        <>
            <div className='notice-header'>
                <CustomBreadcrumb arr={['국내출고', '국내출고지시']}></CustomBreadcrumb>
            </div>
            <div className='notice-wrapper'>
                <div className='notice-condition' style={{ marginTop: '6px' }}>
            <Row type='flex' justify='end' gutter={[16, 8]}>
                <Col style={{ width: '150px' }}>
                    <Button type='primary' className='fullWidth search' onClick={checkTheValue} ghost>
                        조회
                    </Button>
                </Col>
                <Col style={{ width: '150px' }}>
                    <Button type='primary' className='fullWidth' onClick={orderRelease}>
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
                                주문일자
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
                                className='fullWidth'
                                placeholder='상품코드'
                                value={getData.assortId != '' ? getData.assortId : undefined}
                                onInput={handlechangeInput}
                            />
                        </Col>
                        <Col span={6}>
                            <Input
                                name='assortNm'
                                className='fullWidth'
                                placeholder='상품명'
                                value={getData.assortNm != '' ? getData.assortNm : undefined}
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
                        <Col span={12}>
                            <Input
                                name='orderId'
                                className='fullWidth'
                                placeholder='주문번호'
                                value={getData.orderId != '' ? getData.orderId : undefined}
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
                        <Col span={12}>
                            <Select
                                className='fullWidth'
                                value={getData.vendorId != '' ? getData.vendorId : ''}
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
                    <AgGridReact defaultColDef={defaultColDef} multiSortKey={'ctrl'}
                        enableCellTextSelection={true}
                        rowData={state.rowData}
                        rowSelection={'multiple'}
                        suppressDragLeaveHidesColumns={true}
                        onSelectionChanged={onSelectionChanged}
                        columnDefs={columnDefs()}
                        onFirstDataRendered={onFirstDataRendered}
                        onBodyScroll={onFirstDataRendered}
                        onGridReady={onGridReady}></AgGridReact>
                </div>
            </Row>
            {/* <PurchaseSearchM isModalVisible={isModalVisible} setIsModalVisible={setIsModalVisible} /> */}
            </div>
        </>
    )
}

export default withRouter(ReleaseOrder)
