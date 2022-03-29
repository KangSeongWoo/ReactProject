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
import axios from 'axios'

import '/src/style/custom.css'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-alpine.css'

const { Text } = Typography
const { Option } = Select
const { TextArea } = Input;

let invengb = {}
for (let i = 0; i < Constans.INVENGB.length; i++) {
    invengb[Constans.INVENGB[i].value] = Constans.INVENGB[i].label
}

const DepositGoodsList = props => {
    const { userId } = props

    const [gridApi, setGridApi] = useState(null)
    const [gridColumnApi, setGridColumnApi] = useState(null)
    const [storageList, setStorageList] = useState([])
    const [storageCate, setStorageCate] = useState([])
    const [isModalVisible, setIsModalVisible] = useState(false);

    //화면에 노출되는 state
    const [state, setState] = useState({
        startDt: moment().subtract(7, 'd'),
        endDt : moment(),
        depositGb : '11',
        storageId: '',
        depositNo: '',
        assortId: '',
        assortNm : '',
        rowData: [],
        userId: userId
    })

    const columnDefs = () => {
        return [
            { field: 'depositDt', headerName: '입고일자', editable: false, suppressMenu: true },
            { field: 'depositKey', headerName: '입고번호', editable: false, suppressMenu: true },
            {
                field: 'storageId',
                headerName: '입고창고',
                editable: false,
                suppressMenu: true,
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
            {
                field: 'depositGb', headerName: '기타입고구분', editable: false, suppressMenu: true,
                valueFormatter: function(params) {
                    return Helpers.lookupValue(invengb, params.value)
                },
            },
            { field:'channelGoodsNo', headerName : '고도몰상품코드', editable: false, suppressMenu: true },
            { field: 'goodsKey', headerName: '상품번호', editable: false, suppressMenu: true },
            { field: 'assortNm', headerName: '상품명', editable: false, suppressMenu: true },
            { field: 'optionNm1', headerName: '옵션1', editable: false, suppressMenu: true },
            { field: 'optionNm2', headerName: '옵션2', editable: false, suppressMenu: true },
            { field: 'optionNm3', headerName: '옵션3', editable: false, suppressMenu: true },
            { field: 'extraUnitcost', headerName: '원가', editable: false, suppressMenu: true },
            { field: 'depositQty', headerName: '수량', editable: false, suppressMenu: true },
            { field: 'rackNo', headerName: '입고렉', editable: false, suppressMenu: true }
        ]
    }
    
    const hotkeyFunction = useCallback(event => {
        if (event.key == 'F8') {
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

    // 체크박스 또는 클릭으로 선택시
    const onSelectionChanged = () => {
        var selectedRows = gridApi.getSelectedRows()
        setState({
            ...state,
            rowData: [...selectedRows]
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
    
    // 입고시작일자 변경
    const handleChangeStartDate = e => {
        setState({
            ...state,
            startDt: e
        })
    }
    
    // 입고종료일자 변경
    const handleChangeEndDate = e => {
        setState({
            ...state,
            endDt: e
        })
    }
    
    // 조회
    const checkTheValue = async () => {
        let params = {};
        
        params.startDt      = Common.trim(state.startDt.format('YYYY-MM-DD'));
        params.endDt        = Common.trim(state.endDt.format('YYYY-MM-DD'));
        params.depositNo    = Common.trim(state.depositNo);
        params.depositGb    = Common.trim(state.depositGb);
        params.assortNm     = Common.trim(state.assortNm);
        params.userId       = Common.trim(state.userId);
        
        props.setSpin(true)
        const config = { headers: { 'Content-Type': 'application/json' } }

        console.log(JSON.stringify(params))

        return await Https.getDepositListEtc(params, config)
            .then(response => {
                props.setSpin(false)
                console.log(response)
                
                setState({
                    ...state,
                    rowData : response.data.data.items
                })
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
    
    //상세 이동
    const goDetail = e => {
        e.data.displayKd = 'POP'
        //window.location.href = '/#/DepositImport/depositOne?' + queryStirng.stringify(e.data)
        window
            .open(
                '/#/InventoryManagement/depositOne?' + queryStirng.stringify(e.data),
                '상세' + new Date(),
                'toolbar=no,location=no,directories=no,status=no,scrollbars=yes,resizable=no,width=1610,height=1402,top=, left= '
            )
            .focus()
    }

    const defaultColDef = useMemo(() => {
        return {
          sortable: true,
          flex: 1, minWidth: 100, resizable: true 
        };
    }, []);

    return (
        <>
            <CustomBreadcrumb style={{ marginBottom: '0px' }} arr={['기타입출고', '기타입고리스트']}></CustomBreadcrumb>
            <div className='notice-wrapper'>
                <div className='notice-condition'>
            <Row gutter={[16, 8]}>
                <Col span={24}>
                    <Row type='flex' justify='end' gutter={[16, 16]}>
                        <Col span={2}>
                            <Button type='primary' style={{ width: '100%' }} onClick={checkTheValue}>
                                조회
                            </Button>
                        </Col>
                    </Row>
                    <Row gutter={[16, 8]} className='onVerticalCenter marginTop-10'>
                        <Col span={4}>
                            <Text className='font-15 NanumGothic-Regular' strong>
                                입고일자
                            </Text>
                        </Col>
                        <Col span={6}>
                            <DatePicker
                                name='startDt'
                                className='fullWidth'
                                value={state.startDt}
                                onChange={handleChangeStartDate}
                            />
                        </Col>
                        <Col span={6}>
                            <DatePicker
                                name='endDt'
                                className='fullWidth'
                                value={state.endDt}
                                onChange={handleChangeEndDate}
                            />
                        </Col>
                    </Row>
                    <Row gutter={[16, 8]} className='onVerticalCenter marginTop-10'>
                        <Col span={4}>
                            <Text className='font-15 NanumGothic-Regular' strong>
                                입고번호
                            </Text>
                        </Col>
                        <Col span={6}>
                            <Input className='fullWidth' defaultValue={state.depositNo != '' ? state.depositNo : ''}/>
                        </Col>
                    </Row>
                    <Row gutter={[16, 8]} className='onVerticalCenter marginTop-10'>
                        <Col span={4}>
                            <Text className='font-15 NanumGothic-Regular' strong>
                                상품명
                            </Text>
                        </Col>
                        <Col span={6}>
                            <Input
                                name='assortNm'
                                placeholder='상품명'
                                className='fullWidth'
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
                        <Col span={6}>
                            <Select
                                name='storageId'
                                className='fullWidth'
                                placeholder="입고센터를 선택해주세요"
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
                                입고구분
                            </Text>
                        </Col>
                        <Col span={6}>
                            <Select
                                name='depositGb'
                                className='fullWidth'
                                defaultValue={state.depositGb != '' ? state.depositGb : undefined}
                                disabled
                            >
                                {Constans.INVENGB.map(item => (
                                    <Option key={item.value}>{item.label}</Option>
                                ))}
                            </Select>
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
                        onSelectionChanged={onSelectionChanged}
                        suppressRowClickSelection={true}
                        onFirstDataRendered={onFirstDataRendered}
                        onRowClicked={goDetail}
                        columnDefs={columnDefs()}
                        onGridReady={onGridReady}></AgGridReact>
                </div>
            </Row>
            </div>
        </>
    )
}

export default withRouter(DepositGoodsList)
