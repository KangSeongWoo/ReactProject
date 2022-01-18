import React, { useLayoutEffect, useState, useCallback } from 'react'
import CustomBreadcrumb from '/src/utils/CustomBreadcrumb'
import { Input, Row, Col, DatePicker, Button, Typography, Select, Divider } from 'antd'
import '/src/style/custom.css'
import Https from '../../../api/http'
import '/src/style/table.css'
import queryStirng from 'query-string'
import * as moment from 'moment'
import * as Helpers from '../../../utils/Helpers'
import * as Constans from '../../../utils/Constans'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-alpine.css'
import * as Common from '../../../utils/Common.js'
import * as XLSX from 'xlsx'

const { Option } = Select
const { RangePicker } = DatePicker
const { Text } = Typography
const InputGroup = Input.Group

// 체널구분 JSON
let newChannelGb = {}
for (let i = 0; i < Constans.CHANNELGB.length; i++) {
    newChannelGb[Constans.CHANNELGB[i].value] = Constans.CHANNELGB[i].label
}

const List = props => {
    const [orderStatusList, setOrderStatusList] = useState([])
    const [orderStatusGridKey, setOrderStatusGridKey] = useState([])
    const [gridApi, setGridApi] = useState(null)
    const [gridColumnApi, setGridColumnApi] = useState(null)
    const [state, setState] = useState({
        startDt: moment().subtract(1, 'Y'),
        endDt: moment(),
        statusCd: '',
        channelGb: '01',
        orderId: '',
        channelOrderNo: '',
        detailSearchKd: 'channelOrderNo',
        orders: []
    })

    const hotkeyFunction = useCallback(event => {
        if (event.key == 'F2') {
            refresh()
        }

        if (event.key == 'F8') {
            document.querySelector('.search').click()
        }
    }, [])

    useLayoutEffect(() => {
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
                headerName: '판매체널',
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
            { headerName: '주문일시', field: 'orderDate' },
            { headerName: '체널주문번호', field: 'channelOrderNo' },
            { headerName: '주문번호', field: 'orderId' },
            { headerName: '주문자', field: 'custNm' },
            { headerName: '주문상품', field: 'goodsNm' },
            {
                headerName: '총상품금액',
                field: 'totalGoodsPrice',
                valueFormatter: function(params) {
                    return Math.floor(params.value)
                        .toString()
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                }
            },
            {
                headerName: '총배송비',
                field: 'totalDeliveryCharge',
                valueFormatter: function(params) {
                    return Math.floor(params.value)
                        .toString()
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                }
            },
            {
                headerName: '총주문금액',
                field: 'totalPrice',
                valueFormatter: function(params) {
                    return Math.floor(params.value)
                        .toString()
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                }
            },
            { headerName: '결제상태', field: 'payStatus' },
            { headerName: '결제방법', field: 'payGb' }
        ]
    }

    const onGridReady = params => {
        setGridApi(params.api)
        setGridColumnApi(params.columnApi)
    }

    // 리스트 불러오기
    const getOrderList = async () => {
        props.setSpin(true)
        let param = {}

        param.orderId = Common.trim(state.orderId)
        param.statusCd = Common.trim(state.statusCd)
        param.channelGb = Common.trim(state.channelGb)
        param.startDt = Common.trim(state.startDt.format('YYYY-MM-DD'))
        param.endDt = Common.trim(state.endDt.format('YYYY-MM-DD'))
        param.channelOrderNo = Common.trim(state.channelOrderNo)

        console.log('param : ' + JSON.stringify(param))

        return await Https.getOrderList(param)
            .then(response => {
                console.log(response)

                setState({
                    ...state,
                    orders: response.data.data
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

    // 리스트 초기화
    const refresh = () => {
        setState({
            ...state,
            orders: []
        })
    }

    // Input 입력
    const handlechangeInput = e => {
        setState({
            ...state,
            [e.target.name]: e.target.value
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

    //상세 이동
    const goDetail = e => {
        e.data.displayKd = 'POP'
        //window.location.href = '/#/order/orderList/detail?' + queryStirng.stringify(e.data)
        window
            .open(
                '/#/order/orderList/detail?' + queryStirng.stringify(e.data),
                '상세' + new Date(),
                'toolbar=no,location=no,directories=no,status=no,scrollbars=yes,resizable=no,width=1610,height=1402,top=, left= '
            )
            .focus()
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
            statusCd: e
        })
    }

    const handleChange = e => {
        setState({
            ...state,
            detailSearchKd: e
        })
    }

    const exportExcel = () => {
        props.setSpin(true)
        var wb = XLSX.utils.book_new()

        let l = []

        gridApi.selectAllFiltered()

        if (gridApi.getSelectedRows().length == 0) {
            alert('출력할 데이터가 없습니다.')
            props.setSpin(false)
            return false
        }

        gridApi.getSelectedRows().map(item => {
            let o = {
                주문번호: item.orderId,
                주문순번: item.orderSeq,
                주문일자: item.orderDate,
                주문자: item.custNm,
                전화번호: item.custTel,
                휴대전화번호: item.custHp,
                주소: item.custAddr,
                체널주문번호: item.channelOrderNo,
                상품번호: item.goodsKey,
                주문상품명: item.goodsNm,
                옵션1: item.optionNm1,
                옵션2: item.optionNm2,
                주문상태: item.orderStatus,
                수량: item.qty,
                금액: item.totalGoodsPrice,
                배송비: item.totalDeliveryCharge,
                배송방법: item.deliMethod,
                배송구분: item.deliveryInfo,
                공급사: item.scmNo,
                수령자: item.deliNm,
                수령자전화번호: item.deliTel,
                수령자휴대전화번호: item.deliHp,
                수령자주소: item.deliAddr,
                결제방법: item.payGb,
                결제금액: item.totalPrice,
                총상품가: item.totalGoodsPrice,
                총배송비: item.totalDeliveryCharge,
                총할인금액: '',
                총부가결제금액: ''
            }
            console.log(o)
            l.push(o)
        })

        for (let i = 0; i < gridApi.getSelectedRows().length; i++) {
            let tempData = gridApi.getSelectedRows()[i]
            let o = {
                주문번호: tempData.orderId,
                주문순번: tempData.orderSeq,
                주문일자: tempData.orderDate,
                주문자: tempData.custNm,
                전화번호: tempData.custTel,
                휴대전화번호: tempData.custHp,
                주소: tempData.custAddr,
                체널주문번호: tempData.channelOrderNo,
                상품번호: tempData.goodsKey,
                주문상품명: tempData.goodsNm,
                옵션1: tempData.optionNm1,
                옵션2: tempData.optionNm2,
                주문상태: tempData.orderStatus,
                수량: tempData.qty,
                금액: tempData.totalGoodsPrice,
                배송비: tempData.totalDeliveryCharge,
                배송방법: tempData.deliMethod,
                배송구분: tempData.deliveryInfo,
                공급사: tempData.scmNo,
                수령자: tempData.deliNm,
                수령자전화번호: tempData.deliTel,
                수령자휴대전화번호: tempData.deliHp,
                수령자주소: tempData.deliAddr,
                결제방법: tempData.payGb,
                결제금액: tempData.totalPrice,
                총상품가: tempData.totalGoodsPrice,
                총배송비: tempData.totalDeliveryCharge,
                총할인금액: '',
                총부가결제금액: ''
            }
            console.log(o)
            l.push(o)
        }
        var wscols = [
            { wch: 10 },
            { wch: 10 },
            { wch: 10 },
            { wch: 10 },
            { wch: 10 },
            { wch: 10 },
            { wch: 10 },
            { wch: 10 },
            { wch: 10 },
            { wch: 10 },
            { wch: 10 },
            { wch: 10 },
            { wch: 10 },
            { wch: 10 },
            { wch: 10 },
            { wch: 10 },
            { wch: 10 }
        ]

        let fname = moment().format('YYYYMMDDHHmmss') + '.xlsx'
        let ws = XLSX.utils.json_to_sheet(l)
        ws['!cols'] = wscols
        XLSX.utils.book_append_sheet(wb, ws, 'sheet1')
        XLSX.writeFile(wb, fname)
        gridApi.deselectAll()
        props.setSpin(false)
    }

    return (
        <div className='notice-wrapper'>
            <CustomBreadcrumb style={{ marginBottom: '0px' }} arr={['주문', '주문별주문리스트']}></CustomBreadcrumb>
            <Row type='flex' justify='end' gutter={16}>
                <Col style={{ width: '150px' }}>
                    <Button type='primary' className='fullWidth' onClick={exportExcel} ghost>
                        인쇄
                    </Button>
                </Col>
                <Col style={{ width: '150px' }}>
                    <Button type='primary' className='fullWidth' onClick={refresh} ghost>
                        초기화
                    </Button>
                </Col>
                <Col style={{ width: '150px' }}>
                    <Button type='primary' className='fullWidth search' onClick={getOrderList}>
                        조회
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
                                주문상태
                            </Text>
                        </Col>
                        <Col span={16}>
                            <Select placeholder='주문상태선택' className='fullWidth' onChange={handleChangeStatus}>
                                {orderStatusList.map(item => (
                                    <Option key={item.value}>{item.label}</Option>
                                ))}
                            </Select>
                        </Col>
                    </Row>
                </Col>
            </Row>
            <Row gutter={16}>
                <Col span={12}>
                    <Row gutter={16} className='onVerticalCenter marginTop-10'>
                        <Col span={8}>
                            <Text className='font-15 NanumGothic-Regular' strong>
                                주문번호
                            </Text>
                        </Col>
                        <Col span={16}>
                            <Input name='orderId' onChange={handlechangeInput} placeholder='주문번호를 입력하세요' />
                        </Col>
                    </Row>
                </Col>
            </Row>
            <Row gutter={16}>
                <Col span={12}>
                    <Row gutter={16} className='onVerticalCenter marginTop-10'>
                        <Col span={8}>
                            <Text className='font-15 NanumGothic-Regular' strong>
                                세부검색조건
                            </Text>
                        </Col>
                        <Col span={16}>
                            <InputGroup compact style={{ display: 'flex' }}>
                                <Select defaultValue='channelOrderNo' onChange={handleChange}>
                                    <Option value='channelOrderNo'>체널주문번호</Option>
                                    <Option value='custNm'>주문자명</Option>
                                    <Option value='custHp'>주문자휴대전화번호</Option>
                                    <Option value='custTel'>주문자전화번호</Option>
                                    <Option value='deliNm'>수령자명</Option>
                                    <Option value='deliHp'>수령자휴대번호</Option>
                                    <Option value='deliTel'>수령자전화번호</Option>
                                </Select>
                                <Input
                                    name={state.detailSearchKd}
                                    style={{ width: '77.5%' }}
                                    onChange={handlechangeInput}
                                />
                            </InputGroup>
                        </Col>
                    </Row>
                </Col>
            </Row>

            <div className='clearfix'></div>
            <p></p>
            <div className='notice-list'>
                <div className='ag-theme-alpine' style={{ width: '100%', height: 600 }}>
                    <AgGridReact
                        enableCellTextSelection={true}
                        onRowDoubleClicked={goDetail}
                        suppressDragLeaveHidesColumns={true}
                        defaultColDef={{ flex: 1, minWidth: 100, resizable: true }}
                        rowData={state.orders}
                        onFirstDataRendered={onFirstDataRendered}
                        columnDefs={columnDefs()}
                        onGridReady={onGridReady}></AgGridReact>
                </div>
            </div>
        </div>
    )
}

export default List
