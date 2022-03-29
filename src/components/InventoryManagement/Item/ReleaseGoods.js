import React, { useState, useEffect, useLayoutEffect, useCallback , useMemo } from 'react'
import CustomBreadcrumb from '/src/utils/CustomBreadcrumb'
import queryStirng from 'query-string'
import { withRouter } from 'react-router-dom'
import moment from 'moment'
import { Row, Col, Input, Typography, DatePicker, Select, Spin, Button } from 'antd'
import * as ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import { AgGridReact } from 'ag-grid-react'
import Https from '../../../api/http'
import * as GridKeyValue from '../../../utils/GridKeyValue'
import * as Helpers from '../../../utils/Helpers'
import * as Constans from '../../../utils/Constans'
import * as Common from '../../../utils/Common.js'
import * as SignatureImage from '../../../img/signature.png'
import ReleaseEtcModal from '../Modal/ReleaseEtcModal'
import axios from 'axios'

import '/src/style/custom.css'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-alpine.css'

const { Text } = Typography
const { Option } = Select
const { TextArea } = Input;

const ReleaseGoods = props => {
    const { userId } = props

    const [gridApi, setGridApi] = useState(null)
    const [gridColumnApi, setGridColumnApi] = useState(null)
    const [storageList, setStorageList] = useState([])
    const [isModalVisible, setIsModalVisible] = useState(false);

    //화면에 노출되는 state
    const [state, setState] = useState({
        shipDt: moment(),
        depositGb : '21',
        storageId: '',
        memo : '',
        rowData: [],
        userId: userId
    })

    const columnDefs = () => {
        return [
            {
                field: 'goodsKey', headerName: '상품코드', editable: false, suppressMenu: true,
                editable: false,
                suppressMenu: true,
                headerCheckboxSelection: true,
                headerCheckboxSelectionFilteredOnly: true,
                checkboxSelection: true
            },
            { field: 'assortNm', headerName: '상품명', editable: false, suppressMenu: true },
            { field: 'optionNm1', headerName: '옵션1', editable: false, suppressMenu: true },
            { field: 'optionNm2', headerName: '옵션2', editable: false, suppressMenu: true },
            { field: 'optionNm3', headerName: '옵션3', editable: false, suppressMenu: true },
            {
                field: 'itemGrade', headerName: '상품등급', editable: false, suppressMenu: true,
                valueFormatter: function (params) {
                    if (params.value == '11') {
                        return '정상품'
                    } else if (params.value == '22') {
                        return '중품'
                    } else if (params.value == '33') {
                        return '하품'
                    } else {
                        return '정상품'
                    }
                    
                }
            },
            { field: 'extraUnitcost', headerName: '원가', editable: false, suppressMenu: true },
            { field: 'qty', headerName: '재고', editable: false, suppressMenu: true },
            { field: 'availableQty', headerName: '출고가능수량', editable: false, suppressMenu: true},
            { field: 'shipQty', headerName: '출고수량', editable: true, suppressMenu: true ,cellStyle: { backgroundColor: '#DAF7A6' }},
            { field: 'rackNo', headerName: '입고렉', editable: false, suppressMenu: true}
        ]
    }
    
    const hotkeyFunction = useCallback(event => {
        if (event.key == 'F2') {
            refresh()
        }
    }, [])

    // 화면 그려지기 전에 호출
    useLayoutEffect(() => {
        window.addEventListener('resize', () => props.setHeight());
        props.setHeight();
        document.addEventListener('keyup', hotkeyFunction)
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
            props.setSpin(false)
        } finally {
            
        }
    }

    // agGrid API 호출
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
    
    // 입고일자 변경
    const handleChangeDate = e => {
        setState({
            ...state,
            shipDt: e
        })
    }
    
    // 상품추가
    const addData = () => {
        if (state.storageId == '') {
            alert("출고센터를 선택해 주세요.");
            return false
        }
        setIsModalVisible(true)
    }
    
    // 상품삭제
    const removeData = () => {
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
    
    // 재고입고
    const saveData = async () => {
        if (gridApi.getSelectedRows().length == 0) {
            alert('입고할 내역을 선택해 주세요')
            return false
        }
        
        if (state.storageId == '') {
            alert('입고창고를 선택해 주세요')
            return false
        }
        
        let flag = false
        
        gridApi.getSelectedRows().forEach(element => {
            if (element.shipQty == 0 || element.shipQty == ''|| element.shipQty == undefined|| element.shipQty == null) {
                flag = true
                return false
            }else {
                element.shipQty = Number(element.shipQty);
            }
            
            if(element.shipQty > element.availableQty || element.shipQty <= 0){
                flag = true
                return false
            }
        })
        
        if (flag) {
            alert('입력 값을 확인하세요.')
            return false
        }
        
        let params = {};
        
        params.shipDt       = Common.trim(state.shipDt.format('YYYY-MM-DD HH:mm:ss'));
        params.storageId    = Common.trim(state.storageId);
        params.vendorId     = 'AAAAAA';
        params.depositGb    = Common.trim(state.depositGb);
        params.memo         = Common.trim(state.memo);
        params.userId       = Common.trim(state.userId);
        params.items        = gridApi.getSelectedRows();
        
        props.setSpin(true)
        const config = { headers: { 'Content-Type': 'application/json' } }

        console.log(JSON.stringify(params))

        return await Https.postOrderReleaseEtc(params, config)
            .then(response => {
                props.setSpin(false)
                console.log(response)
                
                let params = {}
                params.depositNo = response.data.data

                window.location.href = '/#/InventoryManagement/releaseOne?' + queryStirng.stringify(params)
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
    
    // 화면 초기화
    const refresh = () => {
        setState({
            shipDt: moment(),
            depositGb : '',
            storageId: '',
            memo : '',
            rowData: [],
            userId: userId
        })
    }
    
    const handleChangeStorage = (e) => {
        setState({
            ...state,
            storageId: e
        })
    }
    
    // 발주번호 입력
    const handlechangeInput = e => {
        setState({
            ...state,
            [e.target.name]: e.target.value
        })
    }

    const defaultColDef = useMemo(() => {
        return {
          sortable: true,
          flex: 1, minWidth: 100, resizable: true
        };
    }, []);

    return (
        <>
            <CustomBreadcrumb style={{ marginBottom: '0px' }} arr={['기타입출고', '기타출고']}></CustomBreadcrumb>
            <div className='notice-wrapper'>
                <div className='notice-condition'>
            <Row gutter={[16, 8]}>
                <Col span={24}>
                    <Row type='flex' justify='end' gutter={[16, 16]}>
                        <Col span={2}>
                            <Button type='primary' ghost style={{ width: '100%' }} onClick={addData}>
                                상품추가
                            </Button>
                        </Col>
                        <Col span={2}>
                            <Button type='primary' style={{ width: '100%' }} onClick={removeData}>
                                상품삭제
                            </Button>
                        </Col>
                        <Col span={2}>
                            <Button type='primary' ghost style={{ width: '100%' }} onClick={saveData}>
                                저장
                            </Button>
                        </Col>
                        <Col span={2}>
                            <Button type='primary' style={{ width: '100%' }} onClick={refresh}>
                                초기화
                            </Button>
                        </Col>
                    </Row>
                    <Row gutter={[16, 8]} className='onVerticalCenter marginTop-10'>
                        <Col span={4}>
                            <Text className='font-15 NanumGothic-Regular' strong>
                                출고일자
                            </Text>
                        </Col>
                        <Col span={6}>
                            <DatePicker
                                name='shipDt'
                                className='fullWidth'
                                value={state.shipDt}
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
                        <Col span={6}>
                            <Select
                                name='storageId'
                                className='fullWidth'
                                placeholder='출고센터를 선택하세요'
                                onChange={handleChangeStorage}
                                defaultValue={state.storageId != '' ? state.storageId : undefined}>
                                {storageList.map(item => (
                                    <Option key={item.value}>{item.label}</Option>
                                ))}
                            </Select>
                        </Col>
                    </Row>
                    <Row gutter={[16, 8]} className='onVerticalCenter marginTop-10'>
                        <Col span={4}>
                            <Text className='font-15 NanumGothic-Regular' strong>
                                출고구분
                            </Text>
                        </Col>
                        <Col span={6}>
                            <Select
                                name='depositGb'
                                className='fullWidth'
                                defaultValue={state.depositGb != '' ? state.depositGb : ''}
                                disabled
                            >
                                {Constans.INVENGB.map(item => (
                                    <Option key={item.value}>{item.label}</Option>
                                ))}
                            </Select>
                        </Col>
                    </Row>
                    <Row gutter={[16, 8]} className='onVerticalCenter marginTop-10'>
                        <Col span={4}>
                            <Text className='font-15 NanumGothic-Regular' strong>
                                메모
                            </Text>
                        </Col>
                        <Col span={6}>
                            <TextArea name='memo' onInput={handlechangeInput}/>
                        </Col>
                    </Row>
                </Col>
            </Row>
</div>
            <Row className='marginTop-10'>
                <div className='ag-theme-alpine' style={{ height: props.height, width: '100%' }}>
                    <AgGridReact defaultColDef={defaultColDef} multiSortKey={'ctrl'}
                        enableCellTextSelection={true}
                        rowData={state.rowData}
                        suppressDragLeaveHidesColumns={true}
                        suppressRowClickSelection={true}
                        onFirstDataRendered={onFirstDataRendered}
                        rowSelection={'multiple'}
                        columnDefs={columnDefs()}
                        onGridReady={onGridReady}></AgGridReact>
                </div>
            </Row>
            <div>
                <ReleaseEtcModal
                    rowSelection={'multiple'}
                    isModalVisible={isModalVisible}
                    setIsModalVisible={setIsModalVisible}
                    backData={state}
                    setSpin={props.setSpin}
                    setBackData={setState} 
                    height={props.height}
                    setHeight={props.setHeight}
                />
            </div>
            </div>
        </>
    )
}

export default withRouter(ReleaseGoods)
