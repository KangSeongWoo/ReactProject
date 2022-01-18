import React, { useState, useLayoutEffect, useEffect, useCallback } from 'react'
import CustomBreadcrumb from '/src/utils/CustomBreadcrumb'
import { withRouter } from 'react-router-dom'
import { Row, Col, Button, Input, Typography, Select, Divider, Spin } from 'antd'
import { AgGridReact } from 'ag-grid-react'
import Https from '../../../api/http'
import * as Common from '../../../utils/Common.js'
import GoodsSearchList from '../../Common/Purchase/GoodsSearchList'
import '/src/style/custom.css'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-alpine.css'

const { Text } = Typography
const { Option } = Select

const StockList = props => {
    const [gridApi, setGridApi] = useState(null)
    const [gridColumnApi, setGridColumnApi] = useState(null)
    const [storageList, setStorageList] = useState([])

    const [isModalVisible, setIsModalVisible] = useState(false)

    //화면 노출 관련 state
    const [state, setState] = useState({
        page: 'stockList',
        assortId: '',
        assortNm: '',
        storageId: '',
        rowData: []
    })

    const columnDefs = () => {
        return [
            { field: 'assortId', headerName: '품목코드', editable: false, suppressMenu: true },
            { field: 'itemId', headerName: '상품코드', editable: false, suppressMenu: true },
            { field: 'assortNm', headerName: '상품명', editable: false, suppressMenu: true },
            { field: 'optionNm1', headerName: '옵션1', editable: false, suppressMenu: true },
            { field: 'optionNm2', headerName: '옵션1', editable: false, suppressMenu: true },
            { field: 'shipIndicateQty', headerName: '출고예정재고', editable: false, suppressMenu: true },
            { field: 'qty', headerName: '재고', editable: false, suppressMenu: true }
        ]
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

    useLayoutEffect(() => {
        setInit()
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

        setState({
            ...state,
            ships: selectedRows
        })
    }

    // 조건에 따라 입고처리 가능 내역 조회
    const checkTheValue = () => {
        const { assortId, assortNm, storageId } = state

        let params = {}

        params.assortId = Common.trim(assortId)
        params.assortNm = Common.trim(assortNm)
        params.storageId = Common.trim(storageId)

        console.log('Params : ' + JSON.stringify(params))

        const p = new URLSearchParams(params)
        props.setSpin(true)
        return Https.getStockList(p)
            .then(response => {
                console.log(JSON.stringify(response))

                let target = response.data.data
                setState({
                    ...state,
                    rowData: target // 화면에 보여줄 리스트
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
                props.setSpin(false)
            }) // ERROR
    }

    // 입고센터 선택
    const handleChangeOption = e => {
        setState({
            ...state,
            storageId: e
        })
    }

    // Input 입력
    const handlechangeInput = e => {
        let temp = e.target.value
        if (e.target.name == 'assortId') {
            temp = e.target.value.replace(/[^0-9]/g, '')
        }

        setState({
            ...state,
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

    const refresh = () => {
        setState({
            ...state,
            assortId: '',
            assortNm: '',
            storageId: '',
            rowData: []
        })
    }

    const showSearchList = () => {
        setIsModalVisible(true)
    }

    return (
        <>
            <div className='notice-header'>
                <CustomBreadcrumb arr={['상품', '재고리스트']}></CustomBreadcrumb>
            </div>

            <Row type='flex' justify='end' gutter={[16, 8]}>
                <Col style={{ width: '150px' }}>
                    <Button type='primary' className='fullWidth' onClick={refresh} ghost>
                        초기화
                    </Button>
                </Col>
                <Col style={{ width: '150px' }}>
                    <Button type='primary' className='fullWidth search' onClick={checkTheValue}>
                        조회
                    </Button>
                </Col>
            </Row>
            <Divider style={{ margin: '10px 0' }} />
            <Row gutter={[16, 8]}>
                <Col span={20}>
                    <Row gutter={[16, 8]} className='onVerticalCenter marginTop-10'>
                        <Col span={4}>
                            <Text className='font-15 NanumGothic-Regular' strong>
                                상품코드
                            </Text>
                        </Col>
                        <Col span={2}>
                            <Button type='primary' className='fullWidth' onClick={showSearchList}>
                                조회
                            </Button>
                        </Col>
                        <Col span={5}>
                            <Input
                                name='assortId'
                                className='fullWidth'
                                placeholder='상품코드'
                                value={state.assortId != '' ? state.assortId : undefined}
                                onInput={handlechangeInput}
                            />
                        </Col>
                        <Col span={5}>
                            <Input
                                name='assortNm'
                                className='fullWidth'
                                placeholder='상품명'
                                value={state.assortNm != '' ? state.assortNm : undefined}
                                onInput={handlechangeInput}
                            />
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
                                className='fullWidth'
                                placeholder='입고센터를 선택하세요'
                                value={state.storageId != '' ? state.storageId : undefined}
                                onChange={handleChangeOption}>
                                {storageList.map(item => (
                                    <Option key={item.value}>{item.label}</Option>
                                ))}
                            </Select>
                        </Col>
                    </Row>
                </Col>
            </Row>

            <Row className=' marginTop-10'>
                <div className='ag-theme-alpine' style={{ height: 700, width: '100%' }}>
                    <AgGridReact
                        enableCellTextSelection={true}
                        rowData={state.rowData}
                        defaultColDef={{ flex: 1, minWidth: 100, resizable: true }}
                        rowSelection={'multiple'}
                        onSelectionChanged={onSelectionChanged}
                        columnDefs={columnDefs()}
                        suppressDragLeaveHidesColumns={true}
                        onFirstDataRendered={onFirstDataRendered}
                        onGridReady={onGridReady}></AgGridReact>
                </div>
            </Row>
            <div>
                <GoodsSearchList
                    isModalVisible={isModalVisible}
                    setIsModalVisible={setIsModalVisible}
                    backState={state}
                    setSpin={props.setSpin}
                    setBackState={setState}></GoodsSearchList>
            </div>
        </>
    )
}

export default withRouter(StockList)
