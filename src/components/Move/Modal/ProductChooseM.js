import React, { useState, useCallback, useLayoutEffect, useEffect } from 'react'
import { withRouter } from 'react-router-dom'
import { Row, Col, Button, Typography, Divider, Modal, Select, Input, Spin } from 'antd'
import { AgGridReact } from 'ag-grid-react'
import Https from '../../../api/http'

import '/src/style/custom.css'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-alpine.css'
import * as Common from '../../../utils/Common.js'

const { Text } = Typography
const { Option } = Select

const ProductChooseM = props => {
    const { isModalVisible, setIsModalVisible, backData, setBackData } = props

    const [gridApi, setGridApi] = useState(null)
    const [gridColumnApi, setGridColumnApi] = useState(null)
    const [storageList, setStorageList] = useState([])
    const [purchaseVendorList, setPurchaseVendorList] = useState([])

    // 화면 상태에 관련 한 state
    const [state, setState] = useState({
        rowData: []
    })

    const columnDefs = () => {
        return [
            {
                field: 'assortId',
                headerName: '품목코드',
                editable: false,
                suppressMenu: true,
                headerCheckboxSelection: true,
                headerCheckboxSelectionFilteredOnly: true,
                checkboxSelection: true
            },
            { field: 'itemId', headerName: '상품코드', editable: false, suppressMenu: true },
            { field: 'depositDt', headerName: '입고일자', editable: false, suppressMenu: true },
            { field: 'assortNm', headerName: '상품명', editable: false, suppressMenu: true },
            { field: 'brandNm', headerName: '브랜드', editable: false, suppressMenu: true },
            { field: 'optionNm1', headerName: '옵션1', editable: false, suppressMenu: true },
            { field: 'optionNm2', headerName: '옵션2', editable: false, suppressMenu: true },
            { field: 'qty', headerName: '재고', editable: false, suppressMenu: true },
            { field: 'availableQty', headerName: '이동가능수량', editable: false, suppressMenu: true },
            { field: 'cost', headerName: '가격', editable: false, suppressMenu: true }

            // { field: 'orderSeq', headerName: '해외트래킹번호', editable: false, suppressMenu: true } //JB님 문의
        ]
    }

    const handleOk = () => {
        setIsModalVisible(false)
    }

    const handleCancel = () => {
        setIsModalVisible(false)
        refresh()
    }

    // 화면 그려지기 전에 호출
    useLayoutEffect(() => {
        setInit()
    }, [])

    const hotkeyFunction = useCallback(event => {
        if (event.key == 'F2') {
            refresh()
        }
    }, [])

    useEffect(() => {
        if (isModalVisible) {
            document.addEventListener('keyup', hotkeyFunction)
        } else {
            document.removeEventListener('keyup', hotkeyFunction)
        }
    }, [isModalVisible])

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
            props.setSpin(false)
        }
    }

    // agGrid API 호출
    const onGridReady = params => {
        setGridApi(params.api)
        setGridColumnApi(params.columnApi)
    }

    // 조건에 따라 내역 조회
    const checkTheValue = () => {
        const { purchaseVendorId, assortId, assortNm, storageId } = backData

        console.log('backData : ' + JSON.stringify(backData))

        let params = {}

        params.vendorId = purchaseVendorId != '00' ? Common.trim(purchaseVendorId) : ''
        params.assortId = Common.trim(assortId)
        params.assortNm = Common.trim(assortNm)
        params.storageId = Common.trim(storageId)

        console.log(JSON.stringify(params))

        const p = new URLSearchParams(params)

        props.setSpin(true)

        return Https.getProductItemMoveOrder(p)
            .then(response => {
                console.log(JSON.stringify(response))

                setState({
                    ...state,
                    rowData: response.data.data.goods
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

    // 구매처 선택
    const handleChangeOption = e => {
        setBackData({
            ...backData,
            purchaseVendorId: e
        })
    }

    // Input 입력
    const handlechangeInput = e => {
        let temp = e.target.value
        if (e.target.name == 'assortId') {
            temp = e.target.value.replace(/[^0-9]/g, '')
        }

        setBackData({
            ...backData,
            [e.target.name]: temp
        })
    }

    // 선택완료
    const selectThisValue = () => {
        var selectedRows = gridApi.getSelectedRows()
        setBackData({
            ...backData,
            goods: selectedRows
        })
        handleCancel()
    }

    // 컬럼 리사이즈
    const onFirstDataRendered = params => {
        var allColumnIds = []
        params.columnApi.getAllColumns().forEach(function(column) {
            allColumnIds.push(column.colId)
        })

        params.columnApi.autoSizeColumns(allColumnIds, true)
    }

    const onRowDataChanged = params => {
        if (gridApi != null && state.rowData.length != 0) {
            gridApi.forEachLeafNode(node => {
                console.log('node : ' + node)

                console.log(backData.goods)

                backData.goods.forEach(data => {
                    if (node.data.assortId === data.assortId) {
                        node.setSelected(true)
                    }
                })
            })
        }
    }

    // 초기화하기
    const refresh = () => {
        setState({
            ...state,
            rowData: []
        })
    }

    return (
        <>
            <Modal
                title='상품조회'
                visible={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                width={'70%'}
                footer={[<></>]}>
                <Row type='flex' justify='end' gutter={[16, 8]}>
                    <Col style={{ width: '150px' }}>
                        <Button type='primary' className='fullWidth' onClick={refresh} ghost>
                            초기화
                        </Button>
                    </Col>
                    <Col style={{ width: '150px' }}>
                        <Button type='primary' className='fullWidth' onClick={checkTheValue}>
                            검색
                        </Button>
                    </Col>
                    <Col style={{ width: '150px' }}>
                        <Button className='fullWidth' onClick={selectThisValue}>
                            확인
                        </Button>
                    </Col>
                </Row>
                <Divider style={{ margin: '10px 0' }} />
                <Row gutter={[16, 8]}>
                    <Col span={18}>
                        <Row gutter={[16, 8]} className='onVerticalCenter marginTop-10'>
                            <Col span={4}>
                                <Text className='font-15 NanumGothic-Regular' strong>
                                    물류센터
                                </Text>
                            </Col>
                            <Col span={12}>
                                <Select
                                    placeholder='물류센터선택'
                                    className='fullWidth'
                                    value={backData.storageId != '' ? backData.storageId : undefined}>
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
                            <Col span={12}>
                                <Select
                                    placeholder='구매처선택'
                                    className='fullWidth'
                                    value={backData.purchaseVendorId != '' ? backData.purchaseVendorId : undefined}
                                    onChange={handleChangeOption}>
                                    <Option key='00'>전체</Option>
                                    {purchaseVendorList.map(item => (
                                        <Option key={item.value}>{item.label}</Option>
                                    ))}
                                </Select>
                            </Col>
                        </Row>
                        <Row gutter={[16, 8]} className='onVerticalCenter marginTop-10'>
                            <Col span={4}>
                                <Text className='font-15 NanumGothic-Regular' strong>
                                    상품
                                </Text>
                            </Col>
                            <Col span={6}>
                                <Input
                                    name='assortId'
                                    placeholder='상품코드를 입력하세요'
                                    className='width-80'
                                    value={backData.assortId != '' ? backData.assortId : undefined}
                                    onInput={handlechangeInput}
                                />
                            </Col>
                            <Col span={6}>
                                <Input
                                    name='assortNm'
                                    placeholder='상품명을 입력하세요'
                                    className='width-80'
                                    value={backData.assortNm != '' ? backData.assortNm : undefined}
                                    onInput={handlechangeInput}
                                />
                            </Col>
                        </Row>
                    </Col>
                </Row>

                <Row className='marginTop-10'>
                    <div className='ag-theme-alpine' style={{ height: 400, width: '100%' }}>
                        <AgGridReact
                            enableCellTextSelection={true}
                            rowData={state.rowData}
                            suppressDragLeaveHidesColumns={true}
                            defaultColDef={{ flex: 1, minWidth: 100, resizable: true }}
                            suppressRowClickSelection={true}
                            rowSelection={'multiple'}
                            onRowDataChanged={onRowDataChanged}
                            columnDefs={columnDefs()}
                            onFirstDataRendered={onFirstDataRendered}
                            onGridReady={onGridReady}></AgGridReact>
                    </div>
                </Row>
            </Modal>
        </>
    )
}

export default withRouter(ProductChooseM)
