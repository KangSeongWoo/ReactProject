import React, { useState, useLayoutEffect, useEffect } from 'react'
import CustomBreadcrumb from '/src/utils/CustomBreadcrumb'
import queryStirng from 'query-string'
import { withRouter } from 'react-router-dom'
import moment from 'moment'
import { Row, Col, Input, Typography, Spin, Divider, Button } from 'antd'
import { AgGridReact } from 'ag-grid-react'
import Https from '../../../api/http'
import * as GridKeyValue from '../../../utils/GridKeyValue'
import * as Helpers from '../../../utils/Helpers'

import '/src/style/custom.css'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-alpine.css'
import * as Common from '../../../utils/Common.js'

const { Text } = Typography

const Detail = props => {
    let params = queryStirng.parse(props.params)

    console.log('params : ' + JSON.stringify(params))

    const [orderStatusGridKey, setOrderStatusGridKey] = useState([])
    const [gridApi, setGridApi] = useState(null)
    const [gridColumnApi, setGridColumnApi] = useState(null)

    // 리스트 화면에서 넘어온 data
    const [getData, setGetData] = useState({
        orderId: params.orderId
    })

    const columnDefs = () => {
        return [
            { field: 'channelOrderNo', headerName: '체널주문번호', editable: false, suppressMenu: true },
            { field: 'orderKey', headerName: '상품주문번호', editable: false, suppressMenu: true },
            { field: 'goodsKey', headerName: '상품번호', editable: false, suppressMenu: true },
            {
                field: 'listImageData',
                headerName: '이미지',
                cellRenderer: param => {
                    let imgRend = ''
                    if (param.value != null) {
                        imgRend += '<div style="width:40px; text-align:center"><img style="max-width:100%" src="'
                        imgRend += param.value
                        imgRend += '"></div>'
                    }

                    return imgRend
                }
            },
            { field: 'goodsNm', headerName: '주문상품', editable: false, suppressMenu: true },
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
            { field: 'qty', headerName: '수량', editable: false, suppressMenu: true },
            {
                field: 'salePrice',
                headerName: '금액',
                editable: false,
                suppressMenu: true,
                valueFormatter: function(params) {
                    return Common.fommatMoney(params.value)
                }
            },
            {
                field: 'deliPrice',
                headerName: '배송비',
                editable: false,
                suppressMenu: true,
                valueFormatter: function(params) {
                    return Common.fommatMoney(params.value)
                }
            },
            {
                field: 'deliMethod',
                headerName: '배송방법',
                editable: false,
                suppressMenu: true,
                cellEditor: 'select',
                cellEditorParams: {
                    values: Helpers.extractValues(GridKeyValue.SHIPMENT)
                },
                valueFormatter: function(params) {
                    return Helpers.lookupValue(GridKeyValue.SHIPMENT, params.value)
                },
                valueParser: function(params) {
                    return Helpers.lookupKey(GridKeyValue.SHIPMENT, params.newValue)
                }
            },
            { field: 'deliveryInfo', headerName: '배송구분', editable: false, suppressMenu: true },
            { field: 'scmType', headerName: '공급사구분', editable: false, suppressMenu: true }
        ]
    }

    // 화면 그려지기 전에 호출
    useLayoutEffect(() => {
        getOrderStatusList()
    }, [])

    const getOrderStatusList = async () => {
        props.setSpin(true)
        try {
            let res = await Https.getOrderStatusList({ cdMajor: '0001' })

            console.log('---------------------------------------------------')
            console.log(JSON.stringify(res))

            setOrderStatusGridKey(res.data.data.OrderStatusGridKey)
        } catch (error) {
            console.error(error)
            props.setSpin(false)
        } finally {
            setView()
        }
    }

    const setView = async () => {
        try {
            let res = await Https.getOrderOne(getData)

            console.log('---------------------------------------------------')
            console.log(JSON.stringify(res))

            setGetData({
                ...res.data.data
            })
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

    // 컬럼 리사이즈
    const onFirstDataRendered = params => {
        var allColumnIds = []
        params.columnApi.getAllColumns().forEach(function(column) {
            allColumnIds.push(column.colId)
        })

        params.columnApi.autoSizeColumns(allColumnIds, false)
    }

    // 이미지 Cell 클릭시
    const onCellClicked = e => {
        if (e.colDef.field != 'listImageData') {
            return false
        }
        let data = e.data.listImageData
        if (data != null) {
            window
                .open(
                    data,
                    '이미지 미리보기' + new Date(),
                    'toolbar=no,location=no,directories=no,status=no,scrollbars=yes,resizable=no,width=710,height=1502,top=, left= '
                )
                .focus()
        }
    }

    // 고도몰로 이동
    const goToGodomall = () => {
        window.open('https://gdadmin.trdst.com/order/order_view.php?orderNo=' + getData.channelOrderNo).focus()
    }

    return (
        <div className='notice-wrapper'>
            <CustomBreadcrumb style={{ marginBottom: '0px' }} arr={['주문', '주문내역']}></CustomBreadcrumb>
            <Row type='flex' justify='end' gutter={[16, 8]}>
                <Col style={{ width: '180px' }}>
                    <Button type='primary' className='fullWidth' onClick={goToGodomall} ghost>
                        고도몰 어드민 이동
                    </Button>
                </Col>
            </Row>
            <Divider style={{ margin: '10px 0' }} />
            <Row gutter={[16, 8]}>
                <Col span={24}>
                    <Row gutter={[16, 8]} className='onVerticalCenter marginTop-10'>
                        <Col span={2}>
                            <Text className='font-15 NanumGothic-Regular' strong>
                                주문번호
                            </Text>
                        </Col>
                        <Col span={6}>
                            <Input
                                name='orderId'
                                className='fullWidth'
                                value={getData.orderId != '' ? getData.orderId : ''}
                                readOnly
                            />
                        </Col>
                    </Row>
                </Col>
                <Col span={24}>
                    <Row gutter={[16, 8]} className='onVerticalCenter marginTop-10'>
                        <Col span={2}>
                            <Text className='font-15 NanumGothic-Regular' strong>
                                주문일자
                            </Text>
                        </Col>
                        <Col span={6}>
                            <Input
                                name='orderDate'
                                className='fullWidth'
                                value={
                                    getData.orderDate != undefined
                                        ? moment(getData.orderDate).format('YYYY-MM-DD HH:mm:ss')
                                        : undefined
                                }
                                readOnly
                            />
                        </Col>
                    </Row>
                </Col>
                <Col span={24}>
                    <Row gutter={[16, 8]} className='onVerticalCenter marginTop-10'>
                        <Col span={2}>
                            <Text className='font-15 NanumGothic-Regular' strong>
                                주문자
                            </Text>
                        </Col>
                        <Col span={4}>
                            <Input
                                name='custNm'
                                className='fullWidth'
                                value={getData.custNm != '' ? getData.custNm : ''}
                                readOnly
                            />
                        </Col>
                        <Col span={2}>
                            <Text className='font-15 NanumGothic-Regular' strong>
                                전화번호
                            </Text>
                        </Col>
                        <Col span={4}>
                            <Input
                                name='custTel'
                                className='fullWidth'
                                value={getData.custTel != '' ? getData.custTel : ''}
                                readOnly
                            />
                        </Col>
                        <Col span={3}>
                            <Text className='font-15 NanumGothic-Regular' strong>
                                휴대폰번호
                            </Text>
                        </Col>
                        <Col span={4}>
                            <Input
                                name='custHp'
                                className='fullWidth'
                                value={getData.custHp != '' ? getData.custHp : ''}
                                readOnly
                            />
                        </Col>
                    </Row>
                </Col>
                <Col span={24}>
                    <Row gutter={[16, 8]} className='onVerticalCenter marginTop-10'>
                        <Col span={2}>
                            <Text className='font-15 NanumGothic-Regular' strong>
                                주소
                            </Text>
                        </Col>
                        <Col span={2}>
                            <Input
                                name='custZipcode'
                                className='fullWidth'
                                value={getData.custZipcode != '' ? getData.custZipcode : ''}
                                readOnly
                            />
                        </Col>
                        <Col span={6}>
                            <Input
                                name='custAddr1'
                                className='fullWidth'
                                value={getData.custAddr1 != '' ? getData.custAddr1 : ''}
                                readOnly
                            />
                        </Col>
                        <Col span={6}>
                            <Input
                                name='custAddr2'
                                className='fullWidth'
                                value={getData.custAddr2 != '' ? getData.custAddr2 : ''}
                                readOnly
                            />
                        </Col>
                    </Row>
                </Col>
            </Row>
            <Row>
                <div className='ag-theme-alpine' style={{ height: 300, width: '100%' }}>
                    <AgGridReact
                        enableCellTextSelection={true}
                        rowData={getData.orders}
                        suppressDragLeaveHidesColumns={true}
                        defaultColDef={{ flex: 1, minWidth: 100, resizable: true }}
                        // rowSelection={'multiple'}
                        columnDefs={columnDefs()}
                        onFirstDataRendered={onFirstDataRendered}
                        // colResizeDefault={'shift'}
                        onGridReady={onGridReady}
                        onCellClicked={onCellClicked}></AgGridReact>
                </div>
            </Row>
            <Divider orientation='left' className='DoHyeon-Regular' style={{ margin: '10px 0' }}>
                수령자
            </Divider>
            <Row gutter={[16, 8]}>
                <Col span={24}>
                    <Row gutter={[16, 8]} className='onVerticalCenter marginTop-10'>
                        <Col span={2}>
                            <Text className='font-15 NanumGothic-Regular' strong>
                                수령자
                            </Text>
                        </Col>
                        <Col span={4}>
                            <Input
                                name='deliNm'
                                className='fullWidth'
                                value={getData.deliNm != undefined ? getData.deliNm : undefined}
                                readOnly
                            />
                        </Col>
                        <Col span={2}>
                            <Text className='font-15 NanumGothic-Regular' strong>
                                전화번호
                            </Text>
                        </Col>
                        <Col span={4}>
                            <Input
                                name='deliTel'
                                className='fullWidth'
                                value={getData.deliTel != undefined ? getData.deliTel : undefined}
                                readOnly
                            />
                        </Col>
                        <Col span={3}>
                            <Text className='font-15 NanumGothic-Regular' strong>
                                휴대폰번호
                            </Text>
                        </Col>
                        <Col span={4}>
                            <Input
                                name='deliHp'
                                className='fullWidth'
                                value={getData.deliHp != undefined ? getData.deliHp : undefined}
                                readOnly
                            />
                        </Col>
                    </Row>
                </Col>
                <Col span={24}>
                    <Row gutter={[16, 8]} className='onVerticalCenter marginTop-10'>
                        <Col span={2}>
                            <Text className='font-15 NanumGothic-Regular' strong>
                                주소
                            </Text>
                        </Col>
                        <Col span={2}>
                            <Input
                                name='deliZipcode'
                                className='fullWidth'
                                value={getData.deliZipcode != undefined ? getData.deliZipcode : undefined}
                                readOnly
                            />
                        </Col>
                        <Col span={6}>
                            <Input
                                name='deliAddr1'
                                className='fullWidth'
                                value={getData.deliAddr1 != undefined ? getData.deliAddr1 : undefined}
                                readOnly
                            />
                        </Col>
                        <Col span={6}>
                            <Input
                                name='deliAddr2'
                                className='fullWidth'
                                value={getData.deliAddr2 != undefined ? getData.deliAddr2 : undefined}
                                readOnly
                            />
                        </Col>
                    </Row>
                </Col>
            </Row>
            <Divider orientation='left' className='DoHyeon-Regular' style={{ margin: '10px 0' }}>
                결제정보
            </Divider>
            <Row gutter={[16, 8]}>
                <Col span={24}>
                    <Row gutter={[16, 8]} className='onVerticalCenter marginTop-10'>
                        <Col span={2}>
                            <Text className='font-15 NanumGothic-Regular' strong>
                                결제방법
                            </Text>
                        </Col>
                        <Col span={4}>
                            <Input
                                name='payGb'
                                className='fullWidth'
                                value={getData.payGb != undefined ? getData.payGb : undefined}
                                readOnly
                            />
                        </Col>
                        <Col span={2}>
                            <Text className='font-15 NanumGothic-Regular' strong>
                                결제금액
                            </Text>
                        </Col>
                        <Col span={4}>
                            <Input
                                name='orderAmt'
                                className='fullWidth'
                                value={getData.orderAmt != undefined ? Common.fommatMoney(getData.orderAmt) : undefined}
                                readOnly
                            />
                        </Col>
                    </Row>
                </Col>
                <Col span={24}>
                    <Row gutter={[16, 8]} className='onVerticalCenter marginTop-10'>
                        <Col span={2}>
                            <Text className='font-15 NanumGothic-Regular' strong>
                                총 상품가
                            </Text>
                        </Col>
                        <Col span={3}>
                            <Input
                                name='totalGoodsPrice'
                                className='fullWidth'
                                value={
                                    getData.totalGoodsPrice != undefined
                                        ? Common.fommatMoney(getData.totalGoodsPrice)
                                        : undefined
                                }
                                readOnly
                            />
                        </Col>
                        <Col span={2}>
                            <Text className='font-15 NanumGothic-Regular' strong>
                                총배송비
                            </Text>
                        </Col>
                        <Col span={3}>
                            <Input
                                name='totalDeliveryCharge'
                                className='fullWidth'
                                value={
                                    getData.totalDeliveryCharge != undefined
                                        ? Common.fommatMoney(getData.totalDeliveryCharge)
                                        : undefined
                                }
                                readOnly
                            />
                        </Col>
                        <Col span={3}>
                            <Text className='font-15 NanumGothic-Regular' strong>
                                총할인금액
                            </Text>
                        </Col>
                        <Col span={3}>
                            <Input
                                name='totalDiscountPrice'
                                className='fullWidth'
                                value={
                                    getData.totalDiscountPrice != undefined
                                        ? Common.fommatMoney(getData.totalDiscountPrice)
                                        : undefined
                                }
                                readOnly
                            />
                        </Col>
                        <Col span={3}>
                            <Text className='font-15 NanumGothic-Regular' strong>
                                총부가결제금액
                            </Text>
                        </Col>
                        <Col span={3}>
                            <Input
                                name='totalUseMileage'
                                className='fullWidth'
                                value={
                                    getData.totalUseMileage != undefined
                                        ? Common.fommatMoney(getData.totalUseMileage)
                                        : undefined
                                }
                                readOnly
                            />
                        </Col>
                    </Row>
                </Col>
            </Row>
        </div>
    )
}

//export default Create
export default withRouter(Detail)
