import React, { useState, useLayoutEffect, useEffect, useCallback,useMemo } from 'react'
import { withRouter } from 'react-router-dom'
import CustomBreadcrumb from '/src/utils/CustomBreadcrumb'
import moment from 'moment'
import { Row, Col, Button, Typography, DatePicker, Select, Divider, Spin } from 'antd'
import { AgGridReact } from 'ag-grid-react'
import Https from '../../../api/http'
import * as GridKeyValue from '../../../utils/GridKeyValue'
import * as Helpers from '../../../utils/Helpers'
import ProductChooseM from '../Modal/ProductChooseM'
import * as Common from '../../../utils/Common.js'
import '/src/style/custom.css'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-alpine.css'

const { Text } = Typography
const { Option } = Select

let shipmentList = []
let keys = Object.keys(GridKeyValue.SHIPMENT)
let values = Object.values(GridKeyValue.SHIPMENT)

for (let i = 0; i < keys.length; i++) {
    let tempJson = {}
    tempJson.label = values[i]
    tempJson.value = keys[i]
    shipmentList.push(tempJson)
}

const ProductItemMoveOrder = props => {
    const { userId } = props

    console.log('유저 ID : ' + userId)

    const [gridApi, setGridApi] = useState(null)
    const [gridColumnApi, setGridColumnApi] = useState(null)
    const [storageList, setStorageList] = useState([])
    const [isModalVisible, setIsModalVisible] = useState(false)
    const [storageCate, setStorageCate] = useState([])
    const [selectedRows, setSelectedRows] = useState(0);

    // API 호출 get state
    const [getData, setGetData] = useState({
        moveIndDt: moment(),
        storageId: '',
        oStorageId: '',
        deliMethod: '',
        assortId: '',
        assortNm: '',
        purchaseVendorId: '00',
        goods: [],
        userId: userId
    })

    const columnDefs = () => {
        return [
            {
                field: 'storageId',
                headerName: '출고센터',
                editable: false,
                suppressMenu: true,
                headerCheckboxSelection: true,
                headerCheckboxSelectionFilteredOnly: true,
                checkboxSelection: true,
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
            { field: 'assortId', headerName: '품목코드', editable: false, suppressMenu: true },
            { field: 'itemId', headerName: '상품코드', editable: false, suppressMenu: true },
            { field: 'depositDt', headerName: '입고일자', editable: false, suppressMenu: true },
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
            { field: 'availableQty', headerName: '이동가능수량', editable: false, suppressMenu: true },
            { field: 'orderQty', headerName: '해외입고완료주문수량', editable: false, suppressMenu: true },
            {
                field: 'moveQty',
                headerName: '이동수량',
                editable: true,
                suppressMenu: true,
                cellStyle: { backgroundColor: '#B5E0F7' }
            }
        ]
    }

    const showModal = () => {
        if (getData.storageId == '') {
            alert('출고센터를 선택해 주세요')
            return false
        }
        setIsModalVisible(true)
    }

    const hotkeyFunction = useCallback(event => {
        if (event.key == 'F2') {
            refresh()
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
        window.addEventListener('resize', () => props.setHeight());
        props.setHeight();
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

    // 조회 리스트 & 조건 초기화
    const refresh = () => {
        setState({
            ...state,
            rowData: [] // 화면에 보여줄 리스트
        })

        setGetData({
            moveIndDt: moment(),
            storageId: '',
            oStorageId: '',
            deliMethod: '',
            assortId: '',
            assortNm: '',
            purchaseVendorId: '',
            userId: userId
        })
    }

    // 이동지시일자 변경
    const handleChangeDate = e => {
        setGetData({
            ...getData,
            moveIndDt: e
        })
    }

    // 입고수량 저장하기
    const saveProductItemMove = e => {
        props.setSpin(true)
        var selectedRows = gridApi.getSelectedRows()

        if (selectedRows.length == 0) {
            alert('입고할 내역을 선택해 주세요')
            return false
        }

        const config = { headers: { 'Content-Type': 'application/json' } }

        let params = {}

        params.storageId = Common.trim(getData.storageId)
        params.moveIndDt = Common.trim(getData.moveIndDt.format('YYYY-MM-DD'))
        params.oStorageId = Common.trim(getData.oStorageId)
        params.deliMethod = Common.trim(getData.deliMethod)
        params.userId = Common.trim(getData.userId)
        params.goods = selectedRows

        console.log(JSON.stringify(params))

        return Https.postProductItemMoveOrder(params, config)
            .then(response => {
                //message.success('저장 성공')
                console.log(response)
                props.setSpin(false)
                removeProduct()
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

    // 이동방법 선택
    const handleChangeDelivery = e => {
        setGetData({
            ...getData,
            deliMethod: e
        })
    }

    // 출고센터 선택
    const handleChangeReleaseStorage = e => {
        setGetData({
            ...getData,
            storageId: e
        })
    }

    // 입고센터 선택
    const handleChangeDepositStorage = e => {
        setGetData({
            ...getData,
            oStorageId: e
        })
    }

    // 선택된 상품 삭제 하기
    const removeProduct = () => {
        var selectedRows = gridApi.getSelectedRows()
        if (selectedRows.length != 0) {
            let temp = getData.goods

            for (let i = 0; i < selectedRows.length; i++) {
                temp = temp.filter(element => {
                    return !(
                        element.goodsKey == selectedRows[i].goodsKey && element.depositDt == selectedRows[i].depositDt
                    )
                })
            }

            setGetData({
                ...getData,
                goods: [...temp]
            })
        } else {
            alert('삭제할 데이터가 선택되지 않았습니다.')
            return false
        }
    }
    
    const onSelectionChanged = () => {
        var selectedRows = gridApi.getSelectedRows()

        setSelectedRows(selectedRows.length);
    }

    const defaultColDef = useMemo(() => {
        return {
          sortable: true,
          flex: 1, minWidth: 100, resizable: true
        };
    }, []);

    return (
        <>
            <CustomBreadcrumb style={{ marginBottom: '0px' }} arr={['이동', '상품이동지시']}></CustomBreadcrumb>
            <div className='notice-wrapper'>
                <div className='notice-condition'>
            <Row type='flex' justify='end' gutter={[16, 8]}>
                <Col style={{ width: '150px' }}>
                    <Button type='primary' className='fullWidth' onClick={refresh} ghost>
                        초기화
                    </Button>
                </Col>
                <Col style={{ width: '150px' }}>
                    <Button type='primary' className='fullWidth' onClick={saveProductItemMove}>
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
                                이동지시일자
                            </Text>
                        </Col>
                        <Col span={12}>
                            <DatePicker
                                name='moveOrderDt'
                                className='fullWidth'
                                defaultValue={getData.moveIndDt}
                                onChange={handleChangeDate}
                            />
                        </Col>
                    </Row>
                    <Row gutter={[16, 8]} className='onVerticalCenter marginTop-10'>
                        <Col span={4}>
                            <Text className='font-15 NanumGothic-Regular' strong>
                                출고센터
                            </Text>
                        </Col>
                        <Col span={12}>
                            <Select
                                placeholder='출고창고선택'
                                className='fullWidth'
                                value={getData.storageId != '' ? getData.storageId : undefined}
                                onChange={handleChangeReleaseStorage}>
                                {storageList.map(item => (
                                    <Option key={item.value}>{item.label}</Option>
                                ))}
                            </Select>
                        </Col>
                    </Row>
                    <Row gutter={[16, 8]} className='onVerticalCenter marginTop-10'>
                        <Col span={4}>
                            <Text className='font-15 NanumGothic-Regular' strong>
                                입고센터
                            </Text>
                        </Col>
                        <Col span={12}>
                            <Select
                                placeholder='입고창고선택'
                                className='fullWidth'
                                value={getData.oStorageId != '' ? getData.oStorageId : undefined}
                                onChange={handleChangeDepositStorage}>
                                {storageList.map(item => (
                                    <Option key={item.value}>{item.label}</Option>
                                ))}
                            </Select>
                        </Col>
                    </Row>
                </Col>
            </Row>
            <Row gutter={[16, 8]}>
                <Col span={20}>
                    <Row gutter={[16, 8]} className='onVerticalCenter marginTop-10'>
                        <Col span={4}>
                            <Text className='font-15 NanumGothic-Regular' strong>
                                이동방법
                            </Text>
                        </Col>
                        <Col span={12}>
                            <Select
                                placeholder='이동방법을 선택해 주세요'
                                className='fullWidth'
                                value={getData.deliMethod != '' ? getData.deliMethod : undefined}
                                onChange={handleChangeDelivery}>
                                {shipmentList.map(item => (
                                    <Option key={item.value}>{item.label}</Option>
                                ))}
                            </Select>
                        </Col>
                    </Row>
                </Col>
                <Col span={4}>
                    <Row className='marginTop-10' gutter={[16, 8]}>
                        <Col span={12}>
                            <Button type='primary' className='fullWidth' onClick={showModal} ghost>
                                상품추가
                            </Button>
                        </Col>
                        <Col span={12}>
                            <Button type='primary' className='fullWidth' onClick={removeProduct}>
                                상품삭제
                            </Button>
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
                        rowData={getData.goods}
                        suppressDragLeaveHidesColumns={true}
                        suppressRowClickSelection={false}
                        onFirstDataRendered={onFirstDataRendered}
                        onSelectionChanged={onSelectionChanged}
                        rowSelection={'multiple'}
                        columnDefs={columnDefs()}
                        onGridReady={onGridReady}></AgGridReact>
                </div>
            </Row>
            <ProductChooseM
                isModalVisible={isModalVisible}
                setIsModalVisible={setIsModalVisible}
                backData={getData}
                setSpin={props.setSpin}
                setBackData={setGetData}
                height={props.height}
                setHeight={props.setHeight}
            />
            </div>
        </>
    )
}

export default withRouter(ProductItemMoveOrder)
