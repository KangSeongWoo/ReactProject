import React, { useLayoutEffect, useState, useCallback , useMemo ,useEffect} from 'react'
import CustomBreadcrumb from '/src/utils/CustomBreadcrumb'
import { Row, Col, DatePicker, Button, Typography, Select, Divider } from 'antd'
import '/src/style/custom.css'
import Https from '../../../api/http'
import '/src/style/table.css'
import * as moment from 'moment'
import * as Helpers from '../../../utils/Helpers'
import * as Constans from '../../../utils/Constans'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-alpine.css'
import * as Common from '../../../utils/Common.js'
import { withRouter } from 'react-router-dom'

const { Option } = Select
const { RangePicker } = DatePicker
const { Text } = Typography

// 체널구분 JSON
let newChannelGb = {}
for (let i = 0; i < Constans.CHANNELGB.length; i++) {
    newChannelGb[Constans.CHANNELGB[i].value] = Constans.CHANNELGB[i].label
}

// 처리상태 JSON
let processStatue = {}
for (let i = 0; i < Constans.PROCESSSTATUS.length; i++) {
    processStatue[Constans.PROCESSSTATUS[i].value] = Constans.PROCESSSTATUS[i].label
}

const ListForCancel = props => {
    const [orderStatusList, setOrderStatusList] = useState([])
    const [orderStatusGridKey, setOrderStatusGridKey] = useState([])
    const [gridApi, setGridApi] = useState(null)
    const [selectedRows, setSelectedRows] = useState(0);
    const [gridColumnApi, setGridColumnApi] = useState(null)
    const [state, setState] = useState({
        startDt: moment().subtract(1, 'Y'),
        endDt: moment(),
        ifStatus: '01',
        orders: []
    })


    const hotkeyFunction = useCallback(event => {
        if (event.key == 'F8') {
            document.querySelector('.search').click()
        }
    }, [])

    useLayoutEffect(() => {
        window.addEventListener('resize', () => props.setHeight());
        props.setHeight();
        document.addEventListener('keyup', hotkeyFunction)
        setView()
    }, [])

    const setView = async () => {
        props.setSpin(true)
        try {
            let res = await Https.getOrderStatusList({ cdMajor: '0001' })

            console.log('---------------------------------------------------')
            console.log(JSON.stringify(res))

            setOrderStatusList(res.data.data.OrderStatus)
            setOrderStatusGridKey(res.data.data.OrderStatusGridKey)
        } catch (error) {
            console.error(error)
        } finally {
            props.setSpin(false)
        }
    }

    // 리스트 컬럼
    const columnDefs = () => {
        return [
            {
                headerName: '순번',
                field: 'seq',
                suppressMenu: true,
                headerCheckboxSelection: true,
                headerCheckboxSelectionFilteredOnly: true,
                checkboxSelection: true
            },
            { headerName: '주문자명', field: 'orderName' },
            { headerName: '연동일자', field: 'ifDt' },
            {
                headerName: '체널구분',
                field: 'channelGb',
                cellEditor: 'select',
                cellEditorParams: {
                    values: Helpers.extractValues(newChannelGb)
                },
                valueFormatter: function(params) {
                    return Helpers.lookupValue(newChannelGb, params.value)
                },
                valueParser: function(params) {
                    return Helpers.lookupKey(newChannelGb, params.newValue)
                }
            },
            { headerName: '주문번호', field: 'orderId' },
            { headerName: '주문순번', field: 'orderSeq' },
            {
                field: 'statusCd',
                headerName: '주문상태',
                editable: false,
                suppressMenu: true,
                cellEditor: 'select',
                cellEditorParams: {
                    values: Helpers.extractValues(orderStatusGridKey)
                },
                valueFormatter: function(params) {
                    return Helpers.lookupValue(orderStatusGridKey, params.value)
                },
                valueParser: function(params) {
                    return Helpers.lookupKey(orderStatusGridKey, params.newValue)
                }
            },
            { headerName: '체널주문번호', field: 'channelOrderNo' },
            { headerName: '체널주문순번', field: 'channelOrderSeq' },
            { headerName: '품목코드', field: 'assortId' },
            { headerName: '상품코드', field: 'itemId' },
            { headerName: '품목명', field: 'goodsNm' },
            { headerName: '옵션1', field: 'optiosnNm1' },
            { headerName: '옵션2', field: 'optiosnNm2' },
            { headerName: '옵션3', field: 'optiosnNm3' },
            {
                field: 'ifStatus',
                headerName: '처리상태',
                editable: false,
                suppressMenu: true,
                cellEditor: 'select',
                cellEditorParams: {
                    values: Helpers.extractValues(processStatue)
                },
                valueFormatter: function(params) {
                    return Helpers.lookupValue(processStatue, params.value)
                },
                valueParser: function(params) {
                    return Helpers.lookupKey(processStatue, params.newValue)
                }
            },
            { headerName: '연동메세지', field: 'ifMsg' }
        ]
    }

    const onGridReady = params => {
        setGridApi(params.api)
        setGridColumnApi(params.columnApi)
    }

    // 리스트 불러오기
    const getOrderList = async () => {
        let param = {}

        if (state.ifStatus == '') {
            alert('처리상태를 확인해 주세요.')
        }

        param.ifStatus = Common.trim(state.ifStatus)
        param.startDt = Common.trim(state.startDt.format('YYYY-MM-DD'))
        param.endDt = Common.trim(state.endDt.format('YYYY-MM-DD'))

        console.log('param : ' + JSON.stringify(param))

        props.setSpin(true)
        return await Https.getOrderCancelList(param)
            .then(response => {
                console.log(response)

                setState({
                    ...state,
                    orders: response.data.data.items
                })
                props.setSpin(false)
            })
            .catch(response => {
                Common.commonNotification({
                    kind: 'error',
                    message: '에러 발생',
                    description: '잠시후 다시 시도해 주세요'
                })
                props.setSpin(false)
            }) // ERROR
    }

    // 주문일자 범위변경
    const handleChangeRangeDate = e => {
        setState({
            ...state,
            startDt: e[0],
            endDt: e[1]
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

    const onDateChange = value => {
        setState({
            ...state,
            startDt: value
        })
    }

    const handleChangeStatus = e => {
        setState({
            ...state,
            ifStatus: e
        })
    }

    const cancelOrder = async () => {
        if (gridApi.getSelectedRows().length == 0) {
            alert('입고할 내역을 선택해 주세요')
            return false
        }

        let sendData = {}
        sendData.userId = props.userId
        sendData.items = []

        gridApi.getSelectedRows().forEach(row => {
            sendData.items.push({
                seq: row.seq,
                channelGb: row.channelGb,
                orderId: row.orderId,
                orderSeq: row.orderSeq,
                cancelGb: '99',
                cancelMsg: 'cancel message'
            })
        })

        props.setSpin(true)
        const config = { headers: { 'Content-Type': 'application/json' } }

        console.log(JSON.stringify(sendData))

        return await Https.postCancelOrder(sendData, config)
            .then(response => {
                props.setSpin(false)
                console.log(response)

                let tempList = state.orders

                gridApi.getSelectedRows().forEach(row => {
                    tempList = tempList.filter(
                        item =>
                            !(item.channelOrderNo == row.channelOrderNo && item.channelOrderSeq == row.channelOrderSeq)
                    )
                })

                setState({
                    ...state,
                    orders: tempList
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
        <div className='notice-wrapper'>
            <CustomBreadcrumb style={{ marginBottom: '0px' }} arr={['주문', '주문취소']}></CustomBreadcrumb>
            <div className='notice-condition'>
            <Row type='flex' justify='end' gutter={16}>
                <Col style={{ width: '150px' }}>
                    <Button type='primary' className='fullWidth search' onClick={getOrderList}>
                        조회
                    </Button>
                </Col>
                <Col style={{ width: '150px' }}>
                    <Button type='primary' className='fullWidth' onClick={cancelOrder} ghost>
                        주문취소
                    </Button>
                </Col>
            </Row>
            <Divider style={{ margin: '10px 0' }} />
            <Row gutter={16}>
                <Col span={12}>
                    <Row gutter={16} className='onVerticalCenter marginTop-10'>
                        <Col span={8}>
                            <Text className='font-15 NanumGothic-Regular' strong>
                                주문일자
                            </Text>
                        </Col>
                        <Col span={16}>
                            <RangePicker
                                className='fullWidth'
                                value={[state.startDt, state.endDt]}
                                onChange={handleChangeRangeDate}
                            />
                        </Col>
                    </Row>
                </Col>
                <Col span={12}>
                    <Row gutter={16} type='flex' className='onVerticalCenter marginTop-10'>
                        <Button
                            type='primary'
                            style={{ marginRight: '3px' }}
                            size='small'
                            onClick={() => onDateChange(moment())}>
                            오늘
                        </Button>
                        <Button
                            type='primary'
                            style={{ marginRight: '3px' }}
                            size='small'
                            onClick={() => onDateChange(moment().subtract(7, 'd'))}>
                            7일
                        </Button>
                        <Button
                            type='primary'
                            style={{ marginRight: '3px' }}
                            size='small'
                            onClick={() => onDateChange(moment().subtract(15, 'd'))}>
                            15일
                        </Button>
                        <Button
                            type='primary'
                            style={{ marginRight: '3px' }}
                            size='small'
                            onClick={() => onDateChange(moment().subtract(1, 'M'))}>
                            1개월
                        </Button>
                        <Button
                            type='primary'
                            style={{ marginRight: '3px' }}
                            size='small'
                            onClick={() => onDateChange(moment().subtract(3, 'M'))}>
                            3개월
                        </Button>
                        <Button
                            type='primary'
                            style={{ marginRight: '3px' }}
                            size='small'
                            onClick={() => onDateChange(moment().subtract(1, 'Y'))}>
                            1년
                        </Button>
                    </Row>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col span={12}>
                    <Row gutter={16} className='onVerticalCenter marginTop-10'>
                        <Col span={8}>
                            <Text className='font-15 NanumGothic-Regular' strong>
                                처리상태
                            </Text>
                        </Col>
                        <Col span={16}>
                            <Select
                                placeholder='처리상태'
                                className='fullWidth'
                                value={state.ifStatus}
                                onChange={handleChangeStatus}>
                                {Constans.PROCESSSTATUS.map(item => (
                                    <Option key={item.value}>{item.label}</Option>
                                ))}
                            </Select>
                        </Col>
                    </Row>
                </Col>
            </Row>

            <div className='clearfix'></div>
            <p></p>
            <Text className='font-15 NanumGothic-Regular'>총 선택 : {selectedRows}개</Text>
            </div>
            <div className='notice-list'>
                <div className='ag-theme-alpine marginTop-10' style={{ width: '100%', height: props.height }}>
                    <AgGridReact defaultColDef={defaultColDef} multiSortKey={'ctrl'}
                        enableCellTextSelection={true}
                        suppressDragLeaveHidesColumns={true}
                        rowSelection={'multiple'}
                        rowData={state.orders}
                        onSelectionChanged={onSelectionChanged}
                        onFirstDataRendered={onFirstDataRendered}
                        columnDefs={columnDefs()}
                        onGridReady={onGridReady}></AgGridReact>
                </div>
            </div>
        </div>
    )
}

export default withRouter(ListForCancel)
