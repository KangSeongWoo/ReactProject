import React, { useLayoutEffect, useState, useCallback , useMemo ,useEffect} from 'react'
import CustomBreadcrumb from '/src/utils/CustomBreadcrumb'
import { Row, Col, DatePicker, Button, Typography, Divider } from 'antd'
import '/src/style/custom.css'
import { withRouter } from 'react-router-dom'
import Https from '../../../api/http'
import '/src/style/table.css'
import * as moment from 'moment'
import * as Helpers from '../../../utils/Helpers'
import * as Constans from '../../../utils/Constans'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-alpine.css'
import * as Common from '../../../utils/Common.js'

const { RangePicker } = DatePicker
const { Text } = Typography

// 체널구분 JSON
let newChannelGb = {}
for (let i = 0; i < Constans.CHANNELGB.length; i++) {
    newChannelGb[Constans.CHANNELGB[i].value] = Constans.CHANNELGB[i].label
}

const ListBySelective = props => {
    const [orderStatusList, setOrderStatusList] = useState([])
    const [orderStatusGridKey, setOrderStatusGridKey] = useState([])
    const [gridApi, setGridApi] = useState(null)
    const [gridColumnApi, setGridColumnApi] = useState(null)
    const [state, setState] = useState({
        startDt: moment().subtract(1, 'Y'),
        endDt: moment(),
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
            { headerName: '채널주문번호', field: 'channelOrderNo' },
            { headerName: '채널주문순번', field: 'channelOrderSeq' },
            { headerName: '주문번호', field: 'orderId' },
            { headerName: '주문순번', field: 'orderSeq' },
            {
                field: 'orderStatus',
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
            { headerName: '품목코드', field: 'assortId' },
            { headerName: '상품코드', field: 'itemId' },
            {
                field: 'listImageData',
                headerName: '이미지',
                cellRenderer: param => {
                    let imgRend = ''
                    imgRend += '<div style="width:40px; text-align:center"><img style="max-width:100%" src="'
                    imgRend += param.value
                    imgRend += '"></div>'

                    return imgRend
                }
            },
            { headerName: '주문상품', field: 'goodsNm' },
            { headerName: '옵션1', field: 'optionNm1' },
            { headerName: '옵션2', field: 'optionNm2' },
            { headerName: '옵션3', field: 'optionNm3' },
            { headerName: '고도몰옵션정보', field: 'optionInfo' },
            { headerName: '수량', field: 'qty' },
            {
                headerName: '판매가',
                field: 'salePrice',
                valueFormatter: function (params) {
                    if (params.value == '' || params.value == undefined || params.value == null ) {
                        return 0
                    } else {
                        return Math.floor(params.value)
                        .toString()
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                    }
                }
            },
            {
                headerName: '배송비',
                field: 'deliPrice',
                valueFormatter: function(params) {
                   if (params.value == '' || params.value == undefined || params.value == null ) {
                        return 0
                    } else {
                        return Math.floor(params.value)
                        .toString()
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                    }
                }
            },
            {
                headerName: '할인액',
                field: 'dcSumPrice',
                valueFormatter: function(params) {
                    if (params.value == '' || params.value == undefined || params.value == null ) {
                        return 0
                    } else {
                        return Math.floor(params.value)
                        .toString()
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                    }
                }
            },
            {
                headerName: '합계',
                field: 'totalPrice',
                valueFormatter: function(params) {
                    if (params.value == '' || params.value == undefined || params.value == null ) {
                        return 0
                    } else {
                        return Math.floor(params.value)
                        .toString()
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                    }
                }
            }
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
    const getOrderListByProducts = async () => {
        let param = {}

        param.startDt = Common.trim(state.startDt.format('YYYY-MM-DD'))
        param.endDt = Common.trim(state.endDt.format('YYYY-MM-DD'))

        console.log('param : ' + JSON.stringify(param))

        props.setSpin(true)
        return await Https.getSelectiveList(param)
            .then(response => {
                console.log(response)

                setState({
                    ...state,
                    orders: response.data.data
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

    const defaultColDef = useMemo(() => {
        return {
          sortable: true,
          flex: 1, minWidth: 100, resizable: true 
        };
    }, []);

    return (
        <div className='notice-wrapper'>
            <CustomBreadcrumb style={{ marginBottom: '0px' }} arr={['주문', '관리상품주문리스트']}></CustomBreadcrumb>
            <div className='notice-condition'>
            <Row type='flex' justify='end' gutter={16}>
                <Col style={{ width: '150px' }}>
                    <Button type='primary' className='fullWidth search' onClick={getOrderListByProducts}>
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
</div>
            <Row className=' marginTop-10'>
                <div
                    className='ag-theme-alpine marginTop-10'
                    style={{ width: '100%', height: props.height }}>
                    <AgGridReact defaultColDef={defaultColDef} multiSortKey={'ctrl'}
                        enableCellTextSelection={true}
                        suppressDragLeaveHidesColumns={true}
                        rowData={state.orders}
                        onBodyScroll={onFirstDataRendered}
                        onFirstDataRendered={onFirstDataRendered}
                        columnDefs={columnDefs()}
                        onGridReady={onGridReady}></AgGridReact>
                </div>
            </Row>
        </div>
    )
}

export default withRouter(ListBySelective)
