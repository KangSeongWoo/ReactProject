import React, { useState, useLayoutEffect, useCallback, useEffect , useMemo } from 'react'
import { withRouter } from 'react-router-dom'
import moment from 'moment'
import { Row, Col, Button, Typography, DatePicker, Modal, Select, Divider, Input } from 'antd'
import { AgGridReact } from 'ag-grid-react'
import Https from '/src/api/http'
import * as Helpers from '/src/utils/Helpers'
import * as Constans from '/src/utils/Constans'
import * as Common from '/src/utils/Common.js'

import '/src/style/custom.css'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-alpine.css'

import { useHotkeys } from 'react-hotkeys-hook'

const { Text } = Typography
const { Option } = Select

// 발주구분 JSON
let newDealtypecd = {}
for (let i = 0; i < Constans.DEALTYPECD.length; i++) {
    newDealtypecd[Constans.DEALTYPECD[i].value] = Constans.DEALTYPECD[i].label
}

//발주 상태 JSON
let newPurchasestatus = {}
for (let i = 0; i < Constans.PURCHASESTATUS.length; i++) {
    newPurchasestatus[Constans.PURCHASESTATUS[i].value] = Constans.PURCHASESTATUS[i].label
}

const PurchaseSearchM = props => {
    const { isModalVisible, setIsModalVisible, backData, setBackData } = props

    const [gridApi, setGridApi] = useState(null)
    const [gridColumnApi, setGridColumnApi] = useState(null)
    const [purchaseVendorList, setPurchaseVendorList] = useState([])
    const [purchaseVendorGridKey, setPurchaseVendorGridKey] = useState({})

    // API 호출 시 사용하는 state
    const [getData, setGetData] = useState({
        startDt: moment().subtract(7, 'day'),
        endDt: moment(),
        blNo: '',
        storageId: '000001',
        vendorId: '00'
    })

    // 화면 상태에 관련 한 state
    const [state, setState] = useState({
        loading: false,
        height:400,
        rowData: []
    })

    const columnDefs = () => {
        return [
            {
                field: 'purchaseNo',
                headerName: '발주번호',
                editable: false,
                suppressMenu: true,
                headerCheckboxSelection: false,
                headerCheckboxSelectionFilteredOnly: true,
                checkboxSelection: true
            },
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
            { field: 'purchaseDt', headerName: '발주일자', editable: false, suppressMenu: true },
            {
                field: 'vendorId',
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
            {
                field: 'purchaseStatus',
                headerName: '발주상태',
                editable: false,
                suppressMenu: true,
                cellEditor: 'select',
                cellEditorParams: {
                    values: Helpers.extractValues(newPurchasestatus)
                },
                valueFormatter: function(params) {
                    return Helpers.lookupValue(newPurchasestatus, params.value)
                },
                valueParser: function(params) {
                    return Helpers.lookupKey(newPurchasestatus, params.newValue)
                }
            },
            { field: 'siteOrderNo', headerName: '해외주문번호', editable: false, suppressMenu: true }

            // { field: 'orderSeq', headerName: '해외트래킹번호', editable: false, suppressMenu: true } //JB님 문의
        ]
    }

    const handleOk = () => {
        setIsModalVisible(false)
    }

    const handleCancel = () => {
        setState({
            loading: false,
            rowData: []
        })

        setGetData({
            startDt: moment().subtract(7, 'day'),
            endDt: moment(),
            storageId: '000001',
            vendorId: '00'
        })

        setIsModalVisible(false)
    }

    const hotkeyFunction = useCallback(event => {
        if (event.key == 'F8') {
            document.querySelector('.searchPop').click()
        }
    }, [])

    useEffect(() => {
        if (isModalVisible) {
            document.addEventListener('keyup', hotkeyFunction)
        } else {
            document.removeEventListener('keyup', hotkeyFunction)
        }
    }, [isModalVisible])

    useLayoutEffect(() => {
        window.addEventListener('resize', () => props.setHeight());
        props.setHeight();
        setInit()
    }, [])

    // 화면초기화
    const setInit = async () => {
        try {
            setState({
                ...state,
                loading: true
            })

            let res = await Https.getVendorList()
            console.log('---------------------------------------------------')
            console.log(res)
            setPurchaseVendorList(res.data.data.PurchaseVendors) // 구매처 State
            setPurchaseVendorGridKey(res.data.data.purchaseVendorsGridKey)
        } catch (error) {
            console.error(error)
        } finally {
            setState({
                ...state,
                loading: false
            })
        }
    }

    // agGrid API 호출
    const onGridReady = params => {
        setGridApi(params.api)
        setGridColumnApi(params.columnApi)
    }

    // 조건에 따라 입고처리 가능 내역 조회
    const checkTheValue = () => {
        const { vendorId, startDt, endDt, storageId, blNo } = getData

        if (vendorId == '') {
            alert('구매처를 입력하세요.')
            return false
        }

        if (startDt == '') {
            alert('시작날짜를 입력하세요.')
            return false
        }

        if (endDt == '') {
            alert('종료날짜를 입력하세요.')
            return false
        }

        let params = {}

        params.vendorId = vendorId != '00' ? Common.trim(vendorId) : ''
        params.startDt = Common.trim(startDt.format('YYYY-MM-DD'))
        params.endDt = Common.trim(endDt.format('YYYY-MM-DD'))
        params.storageId = Common.trim(storageId)
        params.blNo = Common.trim(blNo)

        console.log(JSON.stringify(params))

        const p = new URLSearchParams(params)

        return Https.getPurchaseListByDeposit(p)
            .then(response => {
                console.log(JSON.stringify(response))

                setState({
                    ...state,
                    rowData: response.data.data.purchases
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
            }) // ERROR
    }

    // 시작일 변경
    const handleChangeStartDt = e => {
        if (e != null) {
            setGetData({
                ...getData,
                startDt: e
            })
        }
    }

    // 종료일 변경
    const handleChangeEndDt = e => {
        if (e != null) {
            setGetData({
                ...getData,
                endDt: e
            })
        }
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
        setGetData({
            ...getData,
            [e.target.name]: e.target.value
        })
    }

    // 선택완료
    const selectThisValue = () => {
        var selectedRows = gridApi.getSelectedRows()

        if (selectedRows.length == 0) {
            alert('발주건을 선택해 주세요.')
            return false
        }

        setBackData({
            ...backData,
            purchaseNo: selectedRows[0].purchaseNo
        })

        setState({
            loading: false,
            rowData: []
        })

        setGetData({
            ...getData,
            startDt: moment().subtract(7, 'day'),
            endDt: moment(),
            storageId: '000001',
            vendorId: '00'
        })
        handleCancel()
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

    const defaultColDef = useMemo(() => {
        return {
          sortable: true,
          flex: 1, minWidth: 100, resizable: true
        };
    }, []);

    return (
        <>
            <Modal
                title='발주조회'
                visible={isModalVisible}
                className='purchaseSearchM'
                onOk={handleOk}
                onCancel={handleCancel}
                width={'70%'}
                footer={[<></>]}>
                <div className='notice-wrapper'>
                <div className='notice-condition'>
                <Row type='flex' justify='end' gutter={[16, 8]}>
                    <Col style={{ width: '150px' }}>
                        <Button type='primary' className='fullWidth searchPop' onClick={checkTheValue} ghost>
                            조회
                        </Button>
                    </Col>
                    <Col style={{ width: '150px' }}>
                        <Button type='primary' className='fullWidth' onClick={selectThisValue}>
                            선택완료
                        </Button>
                    </Col>
                </Row>
                <Divider style={{ margin: '10px 0' }} />
                <Row gutter={[16, 8]} className='onVerticalCenter marginTop-10'>
                    <Col span={4}>
                        <Text className='font-15 NanumGothic-Regular' strong>
                            발주일
                        </Text>
                    </Col>
                    <Col span={5}>
                        <DatePicker
                            name='startDt'
                            className='fullWidth'
                            onChange={handleChangeStartDt}
                            value={getData.startDt}
                        />
                    </Col>
                    <Col span={5}>
                        <DatePicker
                            name='endDt'
                            className='fullWidth'
                            onChange={handleChangeEndDt}
                            value={getData.endDt}
                        />
                    </Col>
                </Row>
                <Row gutter={[16, 8]} className='onVerticalCenter marginTop-10'>
                    <Col span={4}>
                        <Text className='font-15 NanumGothic-Regular' strong>
                            구매처
                        </Text>
                    </Col>
                    <Col span={10}>
                        <Select
                            defaultValue='구매처선택'
                            className='fullWidth'
                            onChange={handleChangeOption}
                            value={getData.vendorId}>
                            <Option key='00'>선택</Option>
                            {purchaseVendorList.map(item => (
                                <Option key={item.value}>{item.label}</Option>
                            ))}
                        </Select>
                    </Col>
                </Row>
                <Row gutter={[16, 8]} className='onVerticalCenter marginTop-10'>
                    <Col span={4}>
                        <Text className='font-15 NanumGothic-Regular' strong>
                            BI 번호
                        </Text>
                    </Col>
                    <Col span={10}>
                        <Input
                            name='blNo'
                            placeholder='PI 번호를 입력하세요'
                            className='width-80'
                            value={getData.blNo != '' ? getData.blNo : ''}
                            onInput={handlechangeInput}
                            autoComplete='off'
                        />
                    </Col>
                </Row>
                </div>
                    <Row className='marginTop-10'>
                        <div className='ag-theme-alpine' style={{ height: props.height, width: '100%' }}>
                            <AgGridReact defaultColDef={defaultColDef} multiSortKey={'ctrl'}
                                enableCellTextSelection={true}
                                suppressDragLeaveHidesColumns={true}
                                rowData={state.rowData}
                                suppressRowClickSelection={true}
                                columnDefs={columnDefs()}
                                rowSelection={'single'}
                                onFirstDataRendered={onFirstDataRendered}
                                onGridReady={onGridReady}></AgGridReact>
                        </div>
                    </Row>
                </div>
            </Modal>
        </>
    )
}

export default withRouter(PurchaseSearchM)
