import React, { useState, useLayoutEffect, useCallback , useMemo,useEffect } from 'react'
import CustomBreadcrumb from '/src/utils/CustomBreadcrumb'
import queryStirng from 'query-string'
import { withRouter } from 'react-router-dom'
import moment from 'moment'
import { Row, Col, Button, Input, DatePicker, Select, Typography, Divider, Spin } from 'antd'
import { AgGridReact } from 'ag-grid-react'
import Https from '../../../api/http'
import * as GridKeyValue from '../../../utils/GridKeyValue'
import * as Helpers from '../../../utils/Helpers'
import * as Constans from '../../../utils/Constans'
import * as Common from '../../../utils/Common.js'
import * as XLSX from 'xlsx'

import '/src/style/custom.css'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-alpine.css'

const { Text } = Typography
const { Option } = Select

// 상품구분 JSON
let newAssortgb = {}
for (let i = 0; i < Constans.ASSORTGB.length; i++) {
    newAssortgb[Constans.ASSORTGB[i].value] = Constans.ASSORTGB[i].label
}

const ReleaseProcess = props => {
    const [gridApi, setGridApi] = useState(null)
    const [gridColumnApi, setGridColumnApi] = useState(null)
    const [purchaseVendorList, setPurchaseVendorList] = useState([])

    // API 호출 get state
    const [getData, setGetData] = useState({
        startDt: moment().subtract(7, 'day'),
        endDt: moment(),
        channelId: '00',
        assortId: '',
        assortNm: '',
        storageId: '000001',
        shipId: ''
    })

    // 화면 노출 상태 state
    const [state, setState] = useState({
        rowData: [],
        columnDefs: [
            { field: 'orderDt', headerName: '주문일자', editable: false, suppressMenu: true },
            { field: 'shipIndDt', headerName: '출고지시일자', editable: false, suppressMenu: true },
            { field: 'shipDt', headerName: '출고일자', editable: false, suppressMenu: true },
            { field: 'channelOrderNo', headerName: '고도몰주문번호', editable: false, suppressMenu: true },
            { field: 'channelGoodsNo', headerName: '고도몰상품코드', editable: false, suppressMenu: true },
            {
                field: 'rackNo',
                headerName: '렉번호',
                editable: false,
                suppressMenu: true,
                valueFormatter: function(params) {
                    if (params.value == null || params.value == undefined || params.value == '') {
                        return '999999'
                    }
                }
            },
            { field: 'receiverNm', headerName: '수취인명', editable: false, suppressMenu: true },
            { field: 'assortNm', headerName: '상품명', editable: false, suppressMenu: true },
            { field: 'optionNm1', headerName: '옵션1', editable: false, suppressMenu: true },
            { field: 'optionNm2', headerName: '옵션2', editable: false, suppressMenu: true },
            { field: 'optionNm3', headerName: '옵션3', editable: false, suppressMenu: true },
            { field: 'purchaseQty', headerName: '출고지시수량', editable: false, suppressMenu: true },
            // { field: 'orderId', headerName: '주문번호', editable: false, suppressMenu: true },
            // { field: 'custNm', headerName: '주문자명', editable: false, suppressMenu: true },
            {
                field: 'receiverAddr',
                headerName: '주소',
                editable: false,
                suppressMenu: true,
                render: record => {
                    return (
                        <p>
                            {record.receiverAddr1} + {record.receiverAddr2}
                        </p>
                    )
                }
            },
            { field: 'receiverTel', headerName: '수취인전화번호', editable: false, suppressMenu: true },
            { field: 'receiverHp', headerName: '수취인휴대폰번호', editable: false, suppressMenu: true },
            //{ field: 'receiverZonecode', headerName: '수취인우편번호', editable: false, suppressMenu: true },
            // { field: 'orderMemo', headerName: '주문요청사항', editable: false, suppressMenu: true },
            // {
            //     title: '이미지',
            //     dataIndex: 'imagePath',
            //     key: 'imagePath',
            //     render: record => {
            //         return (
            //             <div style={{ width: '40px', textAlign: 'center' }}>
            //                 <img
            //                     style={{ maxWidth: '100%' }}
            //                     src={record.imagePath}
            //                     onClick={() => showImages(record.imagePath)}
            //                 />
            //             </div>
            //         )
            //     }
            // },
            //{ field: 'itemId', headerName: '상품코드', editable: false, suppressMenu: true },
        ]
    })

    // 화면 그려지기 전에 호출
    useLayoutEffect(() => {
        window.addEventListener('resize', () => props.setHeight());
        props.setHeight();
        document.addEventListener('keyup', hotkeyFunction)
        setInit()
    }, [])

    const hotkeyFunction = useCallback(event => {
        if (event.key == 'F8') {
            document.querySelector('.search').click()
        }
    }, [])

    // 화면초기화
    const setInit = async () => {
        props.setSpin(true)
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

    const onGridReady = params => {
        setGridApi(params.api)
        setGridColumnApi(params.columnApi)
    }

    // 출고 시작 날짜 선택
    const handleChangeStartDate = e => {
        setGetData({
            ...getData,
            startDt: e
        })
    }

    // 출고 종료 날짜 선택
    const handleChangeEndDate = e => {
        setGetData({
            ...getData,
            endDt: e
        })
    }

    // 구매처 선택
    const handleChangeOption = e => {
        setGetData({
            ...getData,
            channelId: e
        })
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

    // 조건에 맞는 리스트 찾기
    const getSearchList = () => {
        props.setSpin(true)
        const { startDt, endDt, channelId, assortId, assortNm, shipId, storageId } = getData

        let params = {}

        params.startDt = Common.trim(startDt.format('YYYY-MM-DD'))
        params.endDt = Common.trim(endDt.format('YYYY-MM-DD'))
        params.channelId = channelId != '00' ? Common.trim(channelId) : ''
        params.assortId = Common.trim(assortId)
        params.assortNm = Common.trim(assortNm)
        params.shipId = Common.trim(shipId)
        params.storageId = Common.trim(storageId)

        console.log('Params : ' + JSON.stringify(params))

        const p = new URLSearchParams(params)

        return Https.getReleaseProcessList(p)
            .then(response => {
                console.log(JSON.stringify(response))

                let target = response.data.data
                setState({
                    ...state,
                    rowData: target.ships // 화면에 보여줄 리스트
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

    //상세 이동
    const goDetail = e => {
        e.data.displayKd = 'POP'
        //window.location.href = '/#/ReleaseDomestic/releaseProcessOne?' + queryStirng.stringify(e.data)
        window
            .open(
                '/#/ReleaseDomestic/releaseProcessOne?' + queryStirng.stringify(e.data),
                '상세' + new Date(),
                'toolbar=no,location=no,directories=no,status=no,scrollbars=yes,resizable=no,width=1610,height=1402,top=, left= '
            )
            .focus()
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

    const defaultColDef = useMemo(() => {
        return {
          sortable: true,
          flex: 1, minWidth: 100, resizable: true 
        };
    }, []);
    
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
                주문일자 : tempData.orderDt,
                출고지시일자 : tempData.shipIndDt,
                출고일자 : tempData.shipDt,
                고도몰주문번호 : tempData.channelOrderNo,
                고도몰상품코드 : tempData.channelGoodsNo,
                렉번호 : tempData.rackNo,
                수취인명 : tempData.receiverNm,
                상품명 : tempData.assortNm,
                옵션1 : tempData.optionNm1,
                옵션2 : tempData.optionNm2,
                옵션3 : tempData.optionNm3,
                출고지시수량 : tempData.purchaseQty,
                주소 : tempData.receiverAddr1 + ' ' + tempData.receiverAddr2,
                수취인전화번호 : tempData.receiverTel,
                수취인휴대폰번호 : tempData.receiverHp,
            }
            console.log(o)
            l.push(o)
        }
        
        var wscols = [
            { wch: 20 },
            { wch: 20 },
            { wch: 20 },
            { wch: 15 },
            { wch: 20 },
            { wch: 10 },
            { wch: 10 },
            { wch: 80 },
            { wch: 10 },
            { wch: 10 },
            { wch: 10 },
            { wch: 5 },
            { wch: 100 },
            { wch: 20 },
            { wch: 20 },
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
        <>
            <CustomBreadcrumb style={{ marginBottom: '0px' }} arr={['국내출고', '국내출고리스트']}></CustomBreadcrumb>
            <div className='notice-wrapper'>
                <div className='notice-condition'>
                    <Row type='flex' justify='end' gutter={[16, 8]}>
                        <Col style={{ width: '150px' }}>
                            <Button type='primary' className='fullWidth' ghost onClick={exportExcel}>
                                출력
                            </Button>
                        </Col>
                        <Col style={{ width: '150px' }}>
                            <Button type='primary' className='fullWidth search' onClick={getSearchList}>
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
                                        출고지시일자
                                    </Text>
                                </Col>
                                <Col span={6}>
                                    <DatePicker
                                        name='startDt'
                                        className='fullWidth'
                                        defaultValue={getData.startDt}
                                        onChange={handleChangeStartDate}
                                    />
                                </Col>
                                <Col span={6}>
                                    <DatePicker
                                        name='endDt'
                                        className='fullWidth'
                                        defaultValue={getData.endDt}
                                        onChange={handleChangeEndDate}
                                    />
                                </Col>
                            </Row>
                            <Row gutter={[16, 8]} className='onVerticalCenter marginTop-10'>
                                <Col span={4}>
                                    <Text className='font-15 NanumGothic-Regular' strong>
                                        출고지시번호
                                    </Text>
                                </Col>
                                <Col span={6}>
                                    <Input
                                        name='shipId'
                                        placeholder='출고지시번호'
                                        className='fullWidth'
                                        value={getData.shipId != '' ? getData.shipId : undefined}
                                        onInput={handlechangeInput}
                                    />
                                </Col>
                            </Row>
                            <Row gutter={[16, 8]} className='onVerticalCenter marginTop-10'>
                                <Col span={4}>
                                    <Text className='font-15 NanumGothic-Regular' strong>
                                        상품코드
                                    </Text>
                                </Col>
                                <Col span={6}>
                                    <Input
                                        name='assortId'
                                        placeholder='상품코드'
                                        className='fullWidth'
                                        value={getData.assortId != '' ? getData.assortId : undefined}
                                        onInput={handlechangeInput}
                                    />
                                </Col>
                                <Col span={6}>
                                    <Input
                                        name='assortNm'
                                        placeholder='상품명'
                                        className='fullWidth'
                                        value={getData.assortNm != '' ? getData.assortNm : undefined}
                                        onInput={handlechangeInput}
                                    />
                                </Col>
                            </Row>
                            <Row gutter={[16, 8]} className='onVerticalCenter marginTop-10'>
                                <Col span={4}>
                                    <Text className='font-15 NanumGothic-Regular' strong>
                                        구매처
                                    </Text>
                                </Col>
                                <Col span={6}>
                                    <Select
                                        placeholder='구매처선택'
                                        className='fullWidth'
                                        defaultValue={getData.channelId != '' ? getData.channelId : ''}
                                        name='selectVendor'
                                        onChange={handleChangeOption}>
                                        <Option key='00'>선택</Option>
                                        {purchaseVendorList.map(item => (
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
                            // rowSelection={'multiple'}
                            onFirstDataRendered={onFirstDataRendered}
                            onBodyScroll={onFirstDataRendered}
                            columnDefs={state.columnDefs}
                            onRowClicked={goDetail}
                            onGridReady={onGridReady}></AgGridReact>
                    </div>
                </Row>
            </div>
        </>
    )
}

//export default Create
export default withRouter(ReleaseProcess)
