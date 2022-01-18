import React, { useState, useLayoutEffect, useCallback, useEffect } from 'react'
import CustomBreadcrumb from '/src/utils/CustomBreadcrumb'
import { withRouter } from 'react-router-dom'
import queryStirng from 'query-string'
import moment from 'moment'
import { Row, Col, Button, Input, Typography, DatePicker, Select, Divider, Checkbox } from 'antd'
import { AgGridReact } from 'ag-grid-react'
import Https from '/src/api/http'
import * as Helpers from '/src/utils/Helpers'
import * as Constans from '/src/utils/Constans'
import PurchaseSearchM from '../Modal/PurchaseSearchM'
import * as Common from '/src/utils/Common.js'
import '/src/style/custom.css'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-alpine.css'

import axios from 'axios'
import { saveAs } from 'file-saver'
import * as ExcelJS from 'exceljs'

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
            { field: 'custNm', headerName: '주문자명', editable: false, suppressMenu: true },
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
            {
                field: 'purchaseQty',
                headerName: '발주수량',
                editable: false,
                suppressMenu: true,
                valueFormatter: function(params) {
                    console.log('asdfasdf')
                    if (params.value == null || params.value == undefined || params.value == '') {
                        return 0
                    }
                }
            },
            {
                field: 'availableQty',
                headerName: '입고가능수량',
                editable: false,
                suppressMenu: true
            },
            {
                field: 'depositQty',
                headerName: '입고수량',
                editable: true,
                suppressMenu: true,
                cellStyle: { backgroundColor: '#DAF7A6' }
            },
            {
                field: 'faultYn',
                headerName: '하자유무',
                cellRenderer: 'LinkCellRenderer'
            }
        ]
    })

    const LinkCellRenderer = param => {
        return <input type='checkbox' onChange={e => checkFaultYn(e, param)} />
    }
    const checkFaultYn = (event, param) => {
        console.log(event.target.checked)
        console.log(param.data)

        param.data.defectYn = event.target.checked == true ? '01' : '02'

        return param
    }

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

    // 화면 그려지기 전에 호출
    useLayoutEffect(() => {
        setInit()
    }, [])

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

                window.location.href = '/#/DepositImport/depositOne?' + queryStirng.stringify(params)
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

    const testButton = async () => {
        // 엑셀에 입력되야 하는 내역
        let excelJson = [{ cellNm: 'A1', value: '사진' }]

        const workbook = new ExcelJS.Workbook()

        const worksheet = workbook.addWorksheet('검수리스트')

        // 각각의 컬럼 너비 조절
        worksheet.getColumn(1).width = 21

        let depositList = []
        let response = null
        let signImage = null

        for (let index = 0; index < 1; index++) {
            let data = {
                url: 'https://trdst.hgodo.com/product_data/goods/21/06/24/1000049931/1000049931_list_07.jpg',
                responseType: 'arraybuffer'
            }

            response = await axios.post('http://localhost:3002/image', data, { responseType: 'arraybuffer' })

            signImage = workbook.addImage({
                buffer: response.data,
                extension: 'jpeg'
            })
            worksheet.addImage(signImage, 'A' + (index + 2) + ':A' + (index + 2))
        }

        excelJson = excelJson.concat(depositList)
        Common.setJsonValues(worksheet, excelJson)

        const mimeType = {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }

        const buffer = await workbook.xlsx.writeBuffer()
        const blob = new Blob([buffer], mimeType)
        saveAs(blob, '검수리스트.xlsx')
        gridApi.deselectAll()
        props.setSpin(false)
    }

    return (
        <>
            <div id='barcodeArea' style={{ display: 'block' }}></div>
            <CustomBreadcrumb style={{ marginBottom: '0px' }} arr={['해외입고', '해외입고처리']}></CustomBreadcrumb>
            <Row type='flex' justify='end' gutter={[16, 8]}>
                {/* <Col style={{ width: '150px' }}>
                    <Button type='primary' className='fullWidth' onClick={testButton} ghost>
                        테스트
                    </Button>
                </Col> */}
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

            <Row className=' marginTop-10'>
                <div className='ag-theme-alpine' style={{ height: 550, width: '100%' }}>
                    <AgGridReact
                        enableCellTextSelection={true}
                        suppressDragLeaveHidesColumns={true}
                        rowData={state.rowData}
                        defaultColDef={{ flex: 1, minWidth: 100, resizable: true }}
                        onSelectionChanged={onSelectionChanged}
                        suppressRowClickSelection={true}
                        frameworkComponents={{ LinkCellRenderer: LinkCellRenderer }}
                        onFirstDataRendered={onFirstDataRendered}
                        rowSelection={'multiple'}
                        columnDefs={state.columnDefs}
                        onGridReady={onGridReady}></AgGridReact>
                </div>
            </Row>
            <PurchaseSearchM
                isModalVisible={isModalVisible}
                setIsModalVisible={setIsModalVisible}
                setSpin={props.setSpin}
                backData={getData}
                setBackData={setGetData}
            />
        </>
    )
}

export default withRouter(DepositGoods)
