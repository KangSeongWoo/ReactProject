import React, { useLayoutEffect, useState, useCallback,useMemo,useEffect} from 'react'
import CustomBreadcrumb from '/src/utils/CustomBreadcrumb'
import { Input, Row, Col, Select, DatePicker, Button, Typography, Divider } from 'antd'
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
import { withRouter } from 'react-router-dom'

const { Option } = Select
const { RangePicker } = DatePicker
const { Text } = Typography
const InputGroup = Input.Group

// 체널구분 JSON
let newChannelGb = {}
for (let i = 0; i < Constans.CHANNELGB.length; i++) {
    newChannelGb[Constans.CHANNELGB[i].value] = Constans.CHANNELGB[i].label
}

const ListBeforeOrder = props => {
    const [orderStatusList, setOrderStatusList] = useState([])
    const [orderStatusGridKey, setOrderStatusGridKey] = useState([])
    const [gridApi, setGridApi] = useState(null)
    const [gridColumnApi, setGridColumnApi] = useState(null)
    const [state, setState] = useState({
        statusCd: 'B02',
        waitCnt: '40',
        assortGb:'01',
        orders: []
    })

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
            { headerName: '채널주문번호', field: 'channelOrderKey' },
            { headerName: '주문번호', field: 'orderKey' },
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
            { headerName: '주문자', field: 'custNm' },
            { headerName: '주문자주소', field: 'custAddr' },
            { headerName: '주문자휴대폰', field: 'custHp' },
            { headerName: '주문자전화', field: 'custTel' },
            { headerName: '수취인명', field: 'deliNm' },
            { headerName: '수취인주소', field: 'deliAddr' },
            { headerName: '수취인휴대폰', field: 'deliHp' },
            { headerName: '수취인전화', field: 'deliTel' },
            { headerName: '품목코드', field: 'assortId' },
            { headerName: '주문상품', field: 'assortNm' },
            { headerName: '옵션1', field: 'optionNm1' },
            { headerName: '옵션2', field: 'optionNm2' },
            { headerName: '옵션3', field: 'optionNm3' },
            { headerName: '고도몰옵션정보', field: 'optionInfo' },
            { headerName: '수량', field: 'qty' },
            {
                headerName: '판매가',
                field: 'salePrice',
                valueFormatter: function(params) {
                    return Math.floor(params.value)
                        .toString()
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                }
            },
            {
                headerName: '배송비',
                field: 'deliPrice',
                valueFormatter: function(params) {
                    return Math.floor(params.value)
                        .toString()
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                }
            },
            { headerName: '결제일자', field: 'payDt' },
        ]
    }

    useLayoutEffect(() => {
        window.addEventListener('resize', () => props.setHeight());
        props.setHeight();
        document.addEventListener('keyup', hotkeyFunction)
        setView()
    }, [])

    const hotkeyFunction = useCallback(event => {
        if (event.key == 'F2') {
            refresh()
        }

        if (event.key == 'F8') {
            document.querySelector('.search').click()
        }
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

    const onGridReady = params => {
        setGridApi(params.api)
        setGridColumnApi(params.columnApi)
    }

    // 리스트 불러오기
    const getListBeforeOrder = async () => {
        let param = {}

        param.waitCnt = Number(Common.trim(state.waitCnt))
        param.statusCd = Common.trim(state.statusCd)
        param.assortGb = Common.trim(state.assortGb)

        console.log('param : ' + JSON.stringify(param))

        props.setSpin(true)
        return await Https.getListBeforeOrder(param)
            .then(response => {
                console.log(response)

                setState({
                    ...state,
                    orders: response.data.data.items
                })
            })
            .catch(response => {
                Common.commonNotification({
                    kind: 'error',
                    message: '에러 발생',
                    description: '잠시후 다시 시도해 주세요'
                })
            })
            .finally(() => {
                props.setSpin(false)
            }) // ERROR
    }

    const handleChangeStatus = (e,key) => {
        setState({
            ...state,
            [key]: e
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

        for (let i = 0; i < gridApi.getSelectedRows().length; i++) {
            let tempData = gridApi.getSelectedRows()[i]
            let o = {
                판매체널 : Helpers.lookupValue(newChannelGb, tempData.channelGb), 
                주문일시 : tempData.orderDate,
                채널주문번호 : tempData.channelOrderKey,
                주문번호 : tempData.orderKey,
                주문상태 : Helpers.lookupValue(orderStatusGridKey, tempData.statusCd),
                주문자 : tempData.custNm,
                품목코드 : tempData.assortId,
                주문상품 : tempData.assortNm,
                옵션1 : tempData.optionNm1,
                옵션2 : tempData.optionNm2,
                옵션3 :tempData.optionNm3,
                고도몰옵션정보 : tempData.optionInfo,
                수량 : tempData.qty,
                판매가 : Math.floor(tempData.salePrice).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','),
                배송비 : Math.floor(tempData.deliPrice).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','),
                결제일자 : tempData.payDt
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

    const defaultColDef = useMemo(() => {
        return {
          sortable: true,
          flex: 1, minWidth: 100, resizable: true
        };
    }, []);

    return (
        <>
            <CustomBreadcrumb style={{ marginBottom: '0px' }} arr={['주문', '미입고내역조회']}></CustomBreadcrumb>
            <div className='notice-wrapper'>
                <div className='notice-condition'>
            <Row type='flex' justify='end' gutter={16}>
                <Col style={{ width: '150px' }}>
                    <Button type='primary' className='fullWidth' onClick={refresh} ghost>
                        초기화
                    </Button>
                </Col>
                <Col style={{ width: '150px' }}>
                    <Button type='primary' className='fullWidth' onClick={exportExcel} ghost>
                        인쇄
                    </Button>
                </Col>
                <Col style={{ width: '150px' }}>
                    <Button type='primary' className='fullWidth search' onClick={getListBeforeOrder}>
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
                                주문상태
                            </Text>
                        </Col>
                        <Col span={16}>
                            <Select
                                name='statusCd'
                                placeholder='주문상태선택'
                                className='fullWidth'
                                onChange={(e) => handleChangeStatus(e,'statusCd')}
                                value={state.statusCd != '' ? state.statusCd : undefined}
                            >
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
                                상품구분
                            </Text>
                        </Col>
                        <Col span={16}>
                            <Select
                                name='assortGb'
                                placeholder='상품구분선택'
                                className='fullWidth'
                                onChange={(e) => handleChangeStatus(e,'assortGb')}
                                value={state.assortGb != '' ? state.assortGb : undefined}
                            >
                                {Constans.ASSORTGB.map(item => (
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
                                대기일수
                            </Text>
                        </Col>
                        <Col span={16}>
                            <Input
                                name='waitCnt'
                                onChange={handlechangeInput}
                                placeholder='대기일수를 입력하세요'
                                value={ state.waitCnt != '' ? state.waitCnt : undefined}
                            />
                        </Col>
                    </Row>
                </Col>
            </Row>
</div>
            <Row className=' marginTop-10'>
                <div
                    className='ag-theme-alpine marginTop-10'
                    style={{ width: '100%', height: props.height }}>
                    <AgGridReact 
                        enableCellTextSelection={true}
                        suppressDragLeaveHidesColumns={true}
                        rowData={state.orders}
                        onBodyScroll={onFirstDataRendered}
                        onFirstDataRendered={onFirstDataRendered}
                        columnDefs={columnDefs()}
                        defaultColDef={defaultColDef}
                        multiSortKey={'ctrl'}
                        onGridReady={onGridReady}></AgGridReact>
                </div>
            </Row>
            </div>
        </>
    )
}

export default withRouter(ListBeforeOrder)


