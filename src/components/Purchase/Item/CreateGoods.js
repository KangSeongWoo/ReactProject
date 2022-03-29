import React, { useState, useLayoutEffect, useEffect, useCallback , useMemo } from 'react'
import { withRouter } from 'react-router-dom'
import CustomBreadcrumb from '/src/utils/CustomBreadcrumb'
import { Layout, Input, Select, Row, Col, Button, DatePicker, Spin, message, Typography, Divider } from 'antd'
import * as moment from 'moment'
import { AgGridReact } from 'ag-grid-react'
import Https from '../../../api/http'
import GoodsSearchList from '../../Common/Purchase/GoodsSearchList'
import * as Common from '../../../utils/Common.js'

import '/src/style/custom.css'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-alpine.css'

const { Option } = Select
const { TextArea } = Input
const { Text } = Typography

const CreateGoods = props => {
    const { userId } = props

    const [gridApi, setGridApi] = useState(null)
    const [gridColumnApi, setGridColumnApi] = useState(null)
    const [ownerList, setOwnerList] = useState([])
    const [storageList, setStorageList] = useState([])
    const [isModalVisible, setIsModalVisible] = useState(false)
    const [selectedRows, setSelectedRows] = useState(0);
    const [state, setState] = useState({
        purchaseDt: moment(),
        vendorId: '',
        purchaseVendorNm: '',
        storageId: '',
        terms: '',
        delivery: '',
        payment: '',
        carrier: '',
        siteOrderNo: '',
        assortId: '',
        assortNm: '',
        rowData: [],
        singleClickEdit: true,
        userId: userId
    })

    const columnDefs = () => {
        return [
            {
                headerName: '번호',
                field: 'index',
                headerCheckboxSelection: true,
                headerCheckboxSelectionFilteredOnly: true,
                checkboxSelection: true,
                cellRenderer: param => {
                    let tempHtml = ''

                    tempHtml += '<div>'
                    tempHtml += param.rowIndex + 1
                    tempHtml += '</div>'

                    return tempHtml
                }
            },
            { headerName: '상품코드', field: 'assortId' },
            {
                field: 'imagePath',
                headerName: '이미지',
                cellRenderer: param => {
                    let imgRend = ''
                    imgRend += '<div style="width:40px; text-align:center"><img style="max-width:100%" src="'
                    imgRend += param.value
                    imgRend += '"></div>'

                    return imgRend
                }
            },
            { headerName: '모델번호', field: 'modelNo' },
            { headerName: '상품명', field: 'assortNm' },
            { headerName: '옵션1', field: 'optionNm1' },
            { headerName: '옵션2', field: 'optionNm2' },
            { headerName: '옵션3', field: 'optionNm3' },
            { headerName: '원산지', field: 'origin' },
            { headerName: '카테고리', field: 'categoryNm' },
            { headerName: '재질', field: 'material' },
            { headerName: 'RRP', field: 'rrp' },
            { headerName: '할인율', field: 'discountRate' },
            {
                headerName: '발주수량',
                field: 'purchaseQty',
                editable: true,
                suppressMenu: true,
                cellStyle: { backgroundColor: '#DAF7A6' }
            },
            {
                headerName: '발주가',
                field: 'purchasePrice',
                key: 'purchasePrice',
                editable: true,
                suppressMenu: true,
                cellStyle: { backgroundColor: '#DAF7A6' }
            }
        ]
    }

    // 화면 진입시 랜더링 하기 전에
    useLayoutEffect(() => {
        window.addEventListener('resize', () => props.setHeight());
        props.setHeight();
        setInit()
    }, [])

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

    // 화면 초기화
    const setInit = async () => {
        try {
            props.setSpin(true)

            let res = await Https.getStorageList() // 창고 데이터 호출
            console.log('---------------------------------------------------')
            console.log(res)

            let storageList = res.data.data.Storages
            storageList = storageList.filter(element => element.value != '000001')

            setStorageList(storageList) // 창고 관련 State
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

    // 상품 추가 Modal 열기
    const showGoodsSearchList = () => {
        setIsModalVisible(true)
    }

    const onValueChange = (field, value) => {
        setState({
            ...state,
            [field]: value
        })
    }

    // 선택된 데이터 Row 삭제
    const deleteRowData = () => {
        const { rowData } = state
        let rows = gridApi.getSelectedRows()

        let tempList = rowData
        for (var row of rows) {
            tempList = tempList.filter(item => !(item.assortId == row.assortId && item.itemId == row.itemId))
        }

        setState({
            ...state,
            rowData: tempList
        })
    }

    // agGrid API 호출
    const onGridReady = params => {
        setGridApi(params.api)
        setGridColumnApi(params.columnApi)
    }

    // 선택된 사항 저장하기
    const saveData = () => {
        const { vendorId, purchaseDt, storageId, terms, delivery, payment, carrier, siteOrderNo, userId } = state

        if (vendorId == '') {
            alert('구매처를 선택하세요.')
            return false
        }

        if (purchaseDt == '') {
            alert('발주일자를 선택하세요.')
            return false
        }

        if (storageId == '') {
            alert('입고창고를 선택하세요.')
            return false
        }

        let purchaseData = {}

        props.setSpin(true)

        let rowCnt = gridApi.getDisplayedRowCount()

        let items = []
        let validCheck = true
        let errorMessage = ''

        if (rowCnt == 0) {
            errorMessage = '저장할 데이타가 없습니다.'
            validCheck = false
        } else {
            gridApi.forEachNode((node, idx) => {
                console.log(node)

                if (!(parseInt(node.data.purchaseQty) > 0)) {
                    validCheck = false
                    errorMessage = '수량을 확인해 주세요'
                    return false
                }

                if (!(parseFloat(node.data.purchasePrice) > 0)) {
                    validCheck = false
                    errorMessage = '금액을 확인해 주세요'
                    return false
                }

                let item = {
                    assortId: Common.trim(node.data.assortId),
                    itemId: Common.trim(node.data.itemId),
                    purchaseQty: parseInt(Common.trim(node.data.purchaseQty)),
                    purchaseUnitAmt: parseFloat(Common.trim(node.data.purchasePrice)),
                    itemGrade: '11',
                    purchaseStatus: '01'
                }
                items.push(item)
            })

            purchaseData = {
                purchaseDt: Common.trim(purchaseDt.format('YYYY-MM-DD HH:mm:ss')),
                siteOrderNo: Common.trim(siteOrderNo),
                purchaseGb: '01',
                vendorId: Common.trim(vendorId),
                storageId: Common.trim(storageId),
                dealtypeCd: '02',
                purchaseStatus: '01',
                items: items,
                userId: Common.trim(userId)
            }
        }

        if (validCheck == false) {
            alert(errorMessage)
            props.setSpin(false)
            return false
        }

        const config = { headers: { 'Content-Type': 'application/json' } }

        console.log(purchaseData)

        Https.postAddPurchase(purchaseData, config)
            .then(response => {
                props.setSpin(false)
                message.success('저장 성공')
                console.log(response)
                window.location.href = '/#/purchase/' + response.data.data
            }) // SUCCESS
            .catch(error => {
                props.setSpin(false)
                Common.commonNotification({
                    kind: 'error',
                    message: '에러 발생',
                    description: '잠시후 다시 시도해 주세요'
                })
                console.error(error)
            }) // ERROR
    }

    const refresh = () => {
        setState({
            ...state,
            purchaseDt: moment(),
            vendorId: '',
            purchaseVendorNm: '',
            storageId: '',
            terms: '',
            delivery: '',
            payment: '',
            carrier: '',
            siteOrderNo: '',
            assortId: '',
            assortNm: '',
            rowData: []
        })
    }

    // 컬럼 리사이즈
    const onFirstDataRendered = params => {
        var allColumnIds = []
        params.columnApi.getAllColumns().forEach(function(column) {
            allColumnIds.push(column.colId)
        })

        params.columnApi.autoSizeColumns(allColumnIds, false)
    }

    // 구매처 변경
    const handleVendorSelectChange = e => {
        setState({
            ...state,
            vendorId: e
        })
    }

    // 창고 변경
    const handleStorageSelectChange = e => {
        setState({
            ...state,
            storageId: e
        })
    }

    // 발주일자 변경
    const handleDateChange = e => {
        setState({
            ...state,
            purchaseDt: e
        })
    }

    // 이미지 Cell 클릭시
    const onCellClicked = e => {
        if (e.colDef.field != 'imagePath') {
            return false
        }
        let data = e.data.listImageData
        window
            .open(
                data,
                '이미지 미리보기' + new Date(),
                'toolbar=no,location=no,directories=no,status=no,scrollbars=yes,resizable=no,width=710,height=1502,top=, left= '
            )
            .focus()
    }
    
    const onSelectionChanged = () => {
        var selectedRows = gridApi.getSelectedRows()

        setSelectedRows(selectedRows.length);
    }

    const defaultColDef = useMemo(() => {
        return {
          sortable: true,
          editable: false, flex: 1, minWidth: 100, resizable: true 
        };
    }, []);

    return (
        <Layout>
            <div className='notice-header'>
                <CustomBreadcrumb arr={['발주', '발주등록(상품)']}></CustomBreadcrumb>
            </div>
            <div className='notice-wrapper'>
                <div className='notice-condition' style={{ marginTop: '6px' }}>
                    <Row type='flex' justify='end' gutter={[16, 16]} align='bottom'>
                        <Col style={{ width: '150px' }}>
                            <Button type='dashed' className='fullWidth' onClick={showGoodsSearchList}>
                                상품추가
                            </Button>
                        </Col>
                        <Col style={{ width: '150px' }}>
                            <Button type='danger' className='fullWidth' onClick={deleteRowData}>
                                상품삭제
                            </Button>
                        </Col>
                        <Col style={{ width: '150px' }}>
                            <Button type='primary' className='fullWidth' onClick={refresh} ghost>
                                초기화
                            </Button>
                        </Col>
                        <Col style={{ width: '150px' }}>
                            <Button type='primary' className='fullWidth' onClick={saveData}>
                                저장
                            </Button>
                        </Col>
                    </Row>
                    <Divider style={{ margin: '10px 0' }} />
                    <Row gutter={[16, 16]} className='onVerticalCenter marginTop-10'>
                        <Col span={4}>
                            <Text className='font-15 NanumGothic-Regular' strong>
                                구매처*
                            </Text>
                        </Col>
                        <Col span={8}>
                            <Select
                                placeholder='구매처를 선택하세요'
                                className='fullWidth'
                                showSearch
                                showArrow
                                onChange={handleVendorSelectChange}
                                optionFilterProp='children'
                                filterOption={(input, option) =>
                                    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                }
                                value={state.vendorId != '' ? state.vendorId : undefined}>
                                {ownerList.map(item => (
                                    <Option key={item.value}>{item.label}</Option>
                                ))}
                            </Select>
                        </Col>
                        <Col span={4}>
                            <Text className='font-15 NanumGothic-Regular' strong>
                                발주일자*
                            </Text>
                        </Col>
                        <Col span={8}>
                            <DatePicker
                                className='fullWidth'
                                showTime
                                format='YYYY-MM-DD HH:mm:ss'
                                value={state.purchaseDt}
                                placeholder='Start'
                                onChange={handleDateChange}
                            />
                        </Col>
                    </Row>
                    <Row gutter={[16, 16]} className='onVerticalCenter marginTop-10'>
                        <Col span={4}>
                            <Text className='font-15 NanumGothic-Regular' strong>
                                입고창고*
                            </Text>
                        </Col>
                        <Col span={8}>
                            <Select
                                placeholder='입고창고를 선택하세요'
                                className='fullWidth'
                                showSearch
                                showArrow
                                onChange={handleStorageSelectChange}
                                optionFilterProp='children'
                                filterOption={(input, option) =>
                                    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                }
                                value={state.storageId != '' ? state.storageId : undefined}>
                                {storageList.map(item => (
                                    <Option key={item.value}>{item.label}</Option>
                                ))}
                            </Select>
                        </Col>
                        <Col span={4}>
                            <Text className='font-15 NanumGothic-Regular' strong>
                                해외주문번호
                            </Text>
                        </Col>
                        <Col span={8}>
                            <Input
                                className='fullWidth'
                                value={state.siteOrderNo}
                                onChange={e => onValueChange('siteOrderNo', e.target.value)}
                            />
                        </Col>
                    </Row>
                    <div style={{ marginTop: '14px' }}>
                        <Text className='font-15 NanumGothic-Regular'>총 선택 : {selectedRows}개</Text>
                        <div className='ag-theme-alpine marginTop-10' style={{ height: props.height, width: '100%' }}>
                            <AgGridReact defaultColDef={defaultColDef} multiSortKey={'ctrl'}
                                columnDefs={columnDefs()}
                                suppressDragLeaveHidesColumns={true}
                                onCellClicked={onCellClicked}
                                rowData={state.rowData}
                                ensureDomOrder={true}
                                singleClickEdit={true}
                                suppressRowClickSelection={true}
                                onSelectionChanged={onSelectionChanged}
                                onFirstDataRendered={onFirstDataRendered}
                                enableCellTextSelection={true}
                                rowSelection={'multiple'}
                                onGridReady={onGridReady}></AgGridReact>
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <GoodsSearchList
                    rowSelection={'multiple'}
                    isModalVisible={isModalVisible}
                    setIsModalVisible={setIsModalVisible}
                    backState={state}
                    setSpin={props.setSpin}
                    setBackState={setState}></GoodsSearchList>
            </div>
        </Layout>
    )
}

//export default Create
export default withRouter(CreateGoods)
