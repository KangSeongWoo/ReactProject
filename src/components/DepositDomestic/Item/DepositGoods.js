import React, { useState, useLayoutEffect, useEffect, useCallback , useMemo } from 'react'
import CustomBreadcrumb from '/src/utils/CustomBreadcrumb'
import { withRouter } from 'react-router-dom'
import queryStirng from 'query-string'
import moment from 'moment'
import { Row, Col, Button, Input, Typography, DatePicker, Select, Divider, Spin } from 'antd'
import { AgGridReact } from 'ag-grid-react'
import Https from '/src/api/http'
import * as Helpers from '/src/utils/Helpers'
import * as Constans from '/src/utils/Constans'
import PurchaseSearchM from '../Modal/PurchaseSearchM'
import * as Common from '/src/utils/Common.js'
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

// 세부발주구분 JSON
let newPurchaseGb = {}
for (let i = 0; i < Constans.PURCHASEGB.length; i++) {
    newPurchaseGb[Constans.PURCHASEGB[i].value] = Constans.PURCHASEGB[i].label
}

const DepositGoods = props => {
    const { userId } = props

    console.log('유저 ID : ' + userId)
    const [gridApi, setGridApi] = useState(null)
    const [gridColumnApi, setGridColumnApi] = useState(null)
    const [ownerList, setOwnerList] = useState([])
    const [storageList, setStorageList] = useState([])
    const [isModalVisible, setIsModalVisible] = useState(false)
    const [selectedRows, setSelectedRows] = useState(0);

    // API 호출 get state
    const [getData, setGetData] = useState({
        purchaseNo: '',
        storageId: '00',
        vendorId: '00',
        depositDt: moment().format('YYYY-MM-DD HH:mm:ss'),
        deposits: [],
        userId: userId
    })

    //화면에 노출되는 state
    const [state, setState] = useState({
        rowData: [],
        columnDefs: [
            {
                field: 'depositPlanId',
                headerName: '입고예정번호',
                editable: false,
                suppressMenu: true,
                headerCheckboxSelection: true,
                headerCheckboxSelectionFilteredOnly: true,
                checkboxSelection: true
            },
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
            {
                field: 'purchaseGb',
                headerName: '세부발주구분',
                editable: false,
                suppressMenu: true,
                cellEditor: 'select',
                cellEditorParams: {
                    values: Helpers.extractValues(newPurchaseGb)
                },
                valueFormatter: function(params) {
                    return Helpers.lookupValue(newPurchaseGb, params.value)
                },
                valueParser: function(params) {
                    return Helpers.lookupKey(newPurchaseGb, params.newValue)
                }
            },
            { field: 'assortId', headerName: '품목코드', editable: false, suppressMenu: true },
            { field: 'itemId', headerName: '상품코드', editable: false, suppressMenu: true },
            { field: 'itemNm', headerName: '상품명', editable: false, suppressMenu: true },
            { field: 'optionNm1', headerName: '옵션1', editable: false, suppressMenu: true },
            { field: 'optionNm2', headerName: '옵션2', editable: false, suppressMenu: true },
            { field: 'optionNm3', headerName: '옵션3', editable: false, suppressMenu: true },
            {
                field: 'rackNo',
                headerName: '렉번호',
                editable: true,
                suppressMenu: true,
                cellStyle: { backgroundColor: '#DAF7A6' },
                valueParser: function(params) {
                    if (params.newValue.length > 6) {
                        alert('렉 번호는 6자리 입니다.')
                    }
                    return params.newValue.substr(0, 6)
                }
            },
            {
                field: 'availableQty',
                headerName: '입고가능수량',
                editable: true,
                suppressMenu: true,
                cellStyle: { backgroundColor: '#B5E0F7' }
            },
            {
                field: 'depositQty',
                headerName: '입고수량',
                editable: true,
                suppressMenu: true,
                cellStyle: { backgroundColor: '#B5E0F7' }
            }
        ]
    })

    const showModal = () => {
        setIsModalVisible(true)
    }

    const hotkeyFunction = useCallback(event => {
        if (event.key == 'F2') {
            refresh()
        }

        if (event.key == 'F8') {
            document.querySelector('.search').click()
        }
    }, [])

    useEffect(() => {
        if (!isModalVisible) {
            document.addEventListener('keyup', hotkeyFunction)
        } else {
            document.removeEventListener('keyup', hotkeyFunction)
        }
    }, [isModalVisible])

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
            setOwnerList(res.data.data.PurchaseVendors) // 구매처 State
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
        
        setSelectedRows(selectedRows.length);
    }

    // 조건에 따라 입고처리 가능 내역 조회
    const checkTheValue = async () => {
        const { purchaseNo } = getData

        if (purchaseNo == '') {
            alert('발주번호를 입력하세요.')
            return false
        }
        props.setSpin(true)

        let params = {
            purchaseNo: Common.trim(purchaseNo)
        }

        return await Https.getPurchaseOneByPurchaseNo(params)
            .then(response => {
                console.log(response)

                let target = response.data.data

                target.purchaseList.forEach(element => {
                    if (element.dealtypeCd == '01') {
                        element.depositQty = element.availableQty
                    }
                })

                setState({
                    ...state,
                    rowData: target.purchaseList // 화면에 보여줄 리스트
                })

                setGetData({
                    ...getData,
                    purchaseNo: target.purchaseNo, // 발주번호
                    storageId: target.depositStoreId, // 창고아이디
                    vendorId: target.vendorId // 구매처
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

    // 조회 리스트 & 조건 초기화
    const refresh = () => {
        setState({
            ...state,
            rowData: [] // 화면에 보여줄 리스트
        })

        setGetData({
            ...getData,
            purchaseNo: '', // 발주번호
            storageId: '00', // 창고아이디
            ownerId: '00', // 구매처
            deposits: []
        })
    }

    // Input 입력
    const handlechangeInput = e => {
        setGetData({
            ...getData,
            [e.target.name]: e.target.value
        })
    }

    // 입고일자 변경
    const handleChangeDate = e => {
        setGetData({
            ...getData,
            depositDt: e.format('YYYY-MM-DD HH:mm:ss')
        })
    }

    // 입고수량 저장하기
    const saveDeposit = async e => {
        if (getData.deposits.length == 0) {
            alert('입고할 내역을 선택해 주세요')
            return false
        }

        let flag = false

        getData.deposits.forEach(element => {
            if (element.depositQty == 0) {
                flag = true
                return false
            }

            if (element.dealtypeCd == '01' && element.availableQty !== element.depositQty) {
                flag = true
                return false
            }

            if (element.rackNo == null || element.rackNo == undefined || element.rackNo == '') {
                element.rackNo = '999999' // 렉을 선택하지 않은 경우 (즉시 출고 등등...)
            }
        })

        // 입고 수량 존재 유무
        if (flag) {
            alert('입고 수량을 확인해 주세요.')
            return false
        }
        props.setSpin(true)
        const config = { headers: { 'Content-Type': 'application/json' } }

        console.log(JSON.stringify(getData))

        return await Https.postSaveDeposit(getData, config)
            .then(response => {
                props.setSpin(false)
                console.log(response)

                let params = {}
                params.depositNo = response.data.data

                window.location.href = '/#/DepositDomestic/depositOne?' + queryStirng.stringify(params)
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

    const defaultColDef = useMemo(() => {
        return {
            sortable: true,flex: 1, minWidth: 100, resizable: true 
        };
    }, []);

    return (
        <>
            <CustomBreadcrumb style={{ marginBottom: '0px' }} arr={['국내입고', '국내입고처리']}></CustomBreadcrumb>
            <div className='notice-wrapper'>
                <div className='notice-condition'>
                    <Row type='flex' justify='end' gutter={[16, 8]}>
                        <Col style={{ width: '150px' }}>
                            <Button type='primary' className='fullWidth' onClick={refresh} ghost>
                                초기화
                            </Button>
                        </Col>
                        <Col style={{ width: '150px' }}>
                            <Button className='fullWidth search' onClick={checkTheValue}>
                                조회
                            </Button>
                        </Col>
                        <Col style={{ width: '150px' }}>
                            <Button type='primary' className='fullWidth' onClick={saveDeposit}>
                                저장
                            </Button>
                        </Col>
                    </Row>
                    <Divider style={{ margin: '10px 0' }} />
                    <Row gutter={[16, 8]}>
                        <Col span={8}>
                            <Row gutter={[16, 8]} className='onVerticalCenter marginTop-10'>
                                <Col span={8}>
                                    <Text className='font-15 NanumGothic-Regular' strong>
                                        발주번호
                                    </Text>
                                </Col>
                                <Col span={16}>
                                    <Button className='fullWidth' onClick={showModal}>
                                        발주조회
                                    </Button>
                                </Col>
                            </Row>
                            <Row gutter={[16, 8]} className='onVerticalCenter marginTop-10'>
                                <Col span={8}>
                                    <Text className='font-15 NanumGothic-Regular' strong>
                                        구매처
                                    </Text>
                                </Col>
                                <Col span={16}>
                                    <Select
                                        name='ownerId'
                                        className='fullWidth margin-10'
                                        value={getData.vendorId != '' ? getData.vendorId : ''}
                                        disabled>
                                        <Option key='00'>구매처 선택</Option>
                                        {ownerList.map(item => (
                                            <Option key={item.value}>{item.label}</Option>
                                        ))}
                                    </Select>
                                </Col>
                            </Row>
                            <Row gutter={[16, 8]} className='onVerticalCenter marginTop-10'>
                                <Col span={8}>
                                    <Text className='font-15 NanumGothic-Regular' strong>
                                        입고일자
                                    </Text>
                                </Col>
                                <Col span={16}>
                                    <DatePicker
                                        name='depositDt'
                                        className='fullWidth'
                                        defaultValue={moment()}
                                        onChange={handleChangeDate}
                                    />
                                </Col>
                            </Row>
                            <Row gutter={[16, 8]} className='onVerticalCenter marginTop-10'>
                                <Col span={8}>
                                    <Text className='font-15 NanumGothic-Regular' strong>
                                        입고창고
                                    </Text>
                                </Col>
                                <Col span={16}>
                                    <Select
                                        name='storageId'
                                        className='fullWidth'
                                        value={getData.storageId != '' ? getData.storageId : ''}
                                        disabled>
                                        <Option key='00'>입고창고선택</Option>
                                        {storageList.map(item => (
                                            <Option key={item.value}>{item.label}</Option>
                                        ))}
                                    </Select>
                                </Col>
                            </Row>
                        </Col>
                        <Col span={8}>
                            <Row gutter={[16, 8]} className='onVerticalCenter marginTop-10'>
                                <Col span={16}>
                                    <Input
                                        name='purchaseNo'
                                        placeholder='발주번호를 입력하세요'
                                        className='width-80'
                                        value={getData.purchaseNo != '' ? getData.purchaseNo : ''}
                                        onInput={handlechangeInput}
                                        autoComplete='off'
                                    />
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </div>
                <Row className=' marginTop-10'>
                    <Text className='font-15 NanumGothic-Regular'>총 선택 : {selectedRows}개</Text>
                    <div className='ag-theme-alpine marginTop-10' style={{ height: props.height, width: '100%' }}>
                        <AgGridReact defaultColDef={defaultColDef} multiSortKey={'ctrl'}
                            enableCellTextSelection={true}
                            suppressDragLeaveHidesColumns={true}
                            rowData={state.rowData}
                            onSelectionChanged={onSelectionChanged}
                            suppressRowClickSelection={true}
                            onFirstDataRendered={onFirstDataRendered}
                            rowSelection={'multiple'}
                            columnDefs={state.columnDefs}
                            onGridReady={onGridReady}></AgGridReact>
                    </div>
                </Row>
                <PurchaseSearchM
                    isModalVisible={isModalVisible}
                    setIsModalVisible={setIsModalVisible}
                    backData={getData}
                    setBackData={setGetData}
                    height={props.height}
                    setHeight={props.setHeight}
                />
            </div>
        </>
    )
}

export default withRouter(DepositGoods)
