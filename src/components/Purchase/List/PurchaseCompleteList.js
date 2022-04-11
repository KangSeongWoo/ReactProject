import React, { useLayoutEffect, useState, useEffect, useCallback , useMemo } from 'react'
import { withRouter } from 'react-router-dom'
import CustomBreadcrumb from '/src/utils/CustomBreadcrumb'
import { AgGridReact } from 'ag-grid-react'
import { Layout, Input, Select, Row, Col, Button, DatePicker, Spin, Typography } from 'antd'
import Https from '../../../api/http'
import queryStirng from 'query-string'
import * as moment from 'moment'
import * as Constans from '../../../utils/Constans'
import * as Common from '../../../utils/Common.js'

import '/src/style/custom.css'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-alpine.css'

const { Option } = Select
const { Text } = Typography
const { RangePicker } = DatePicker

//상세 이동
const LinkCellRenderer = props => {
    return (
        <a herf='#' onClick={() => {
            props.data.displayKd = 'POP'
            //window.location.href = '/#/Move/moveProcessOne?' + queryStirng.stringify(e.data)
            window
                .open(
                    '/#/purchase/completeOne?' + queryStirng.stringify(props.data),
                    '상세' + new Date(),
                    'toolbar=no,location=no,directories=no,status=no,scrollbars=yes,resizable=no,width=1610,height=1402,top=, left= '
                )
                .focus()
        }}>
            {props.value}
        </a>
    )
}

const PurchaseCompleteList = props => {
    const { userId } = props

    const [gridApi, setGridApi] = useState(null)
    const [gridColumnApi, setGridColumnApi] = useState(null)
    const [ownerList, setOwnerList] = useState([])
    const [storageList, setStorageList] = useState([])
    const [brandList, setBrandList] = useState([])
    const [state, setState] = useState({
        startDt: moment().subtract(1, 'M'),
        endDt: moment(),
        orderNm: '',
        siteOrderNo: '',
        unifiedOrderNo: '',
        brandId: '',
        vendorId: '00',
        height: window.innerHeight - 369,
        dealtypeCd: '00',
        purchaseNo: '',
        rowData: [],
        purchaseVendorGridKey: {},
        storesGridKey: {},
        frameworkComponents: {
            LinkCellRenderer: LinkCellRenderer
        }
    })

    const getColumnDefs = () => {
        const { purchaseVendorGridKey } = state

        console.log(purchaseVendorGridKey)

        return [
            { headerName: '발주번호', field: 'purchaseNo', cellRenderer: 'LinkCellRenderer' },
            { headerName: '해외주문번호', field: 'siteOrderNo' },
            { headerName: '발주일자', field: 'purchaseDt' },
            {
                headerName: '발주구분',
                field: 'dealtypeCd',
                cellRenderer: param => {
                    let statusNm = ''
                    if (param.value == '01') {
                        statusNm = '주문발주'
                    } else if (param.value == '02') {
                        statusNm = '상품발주'
                    } else if (param.value == '03') {
                        statusNm = '입고예정주문발주'
                    }

                    return statusNm
                }
            },
            {
                headerName: '발주상태',
                field: 'purchaseStatus',
                cellRenderer: param => {
                    let statusNm = ''
                    if (param.value == '01') {
                        statusNm = '접수'
                    } else if (param.value == '03') {
                        statusNm = '부분입고'
                    } else if (param.value == '04') {
                        statusNm = '전체입고'
                    } else if (param.value == '05') {
                        statusNm = '취소'
                    }

                    return statusNm
                }
            }
        ]
    }

    // 컬럼 리사이즈
    const onFirstDataRendered = params => {
        var allColumnIds = []
        params.columnApi.getAllColumns().forEach(function(column) {
            allColumnIds.push(column.colId)
        })

        params.columnApi.autoSizeColumns(allColumnIds, false)
    }

    const getPurchaseList = () => {
        props.setSpin(true)
        const {
            vendorId,
            dealtypeCd,
            startDt,
            endDt,
            orderNm,
            siteOrderNo,
            unifiedOrderNo,
            brandId,
            purchaseNo
        } = state

        let params = {}

        params['orderNm'] = Common.trim(orderNm)
        params['siteOrderNo'] = Common.trim(siteOrderNo)
        params['unifiedOrderNo'] = Common.trim(unifiedOrderNo)
        params['brandId'] = Common.trim(brandId)
        params['vendorId'] = vendorId != '00' ? Common.trim(vendorId) : ''
        params['dealtypeCd'] = dealtypeCd != '00' ? Common.trim(dealtypeCd) : ''
        params['purchaseNo'] = Common.trim(purchaseNo)
        params['startDt'] = Common.trim(Common.trim(startDt.format('YYYY-MM-DD')))
        params['endDt'] = Common.trim(Common.trim(endDt.format('YYYY-MM-DD')))

        if (Common.trim(startDt.format('YYYY-MM-DD')) == '') {
            alert('발주일자 시작일을 선택하세요.')
            return false
        }

        if (Common.trim(endDt.format('YYYY-MM-DD')) == '') {
            alert('발주일자 종료일을 선택하세요.')
            return false
        }

        console.log(params)

        const p = new URLSearchParams(params)

        return Https.getPurchaseList(p)
            .then(response => {
                console.log(response)

                setState({
                    ...state,
                    rowData: response.data.data.purchases
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

    // 화면 진입시 랜더링 하기 전에
    useLayoutEffect(() => {
        window.addEventListener('resize', () => props.setHeight());
        props.setHeight();
        setInit()
    }, [])

    const hotkeyFunction = useCallback(event => {
        if (event.key == 'F8') {
            document.querySelector('.search').click()
        }
    }, [])

    useEffect(() => {
        document.addEventListener('keyup', hotkeyFunction)
    }, [])

    const setInit = async () => {
        props.setSpin(true)
        try {
            let res = await Https.getStorageList()
            console.log('---------------------------------------------------')
            console.log(res)

            setStorageList(res.data.data.Storages)
        } catch (error) {
            console.log('2222222222222222')
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
            setOwnerList(res.data.data.PurchaseVendors) // 구매처 State
        } catch (error) {
            console.error(error)
        } finally {
            getBrandSearch()
        }
    }

    const getBrandSearch = () => {
        props.setSpin(true)
        let params = {}

        const p = new URLSearchParams(params)

        return Https.getBrandSearchList(p)
            .then(response => {
                console.log(response)

                setBrandList(response.data.data)

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

    const handleInputChange = event => {
        const target = event.target

        let value = ''

        if (target.type === 'checkbox') {
            value = target.checked
        } else if (target.type === 'file') {
            value = target.files[0]
        } else {
            value = target.value
        }

        const name = target.name

        setState({
            ...state,
            [name]: value
        })
    }

    const handleSelectChange = (name, value) => {
        setState({
            ...state,
            [name]: value
        })
    }

    // agGrid API 호출
    const onGridReady = params => {
        setGridApi(params.api)
        setGridColumnApi(params.columnApi)
    }

    // 발주일자 범위 변경
    const handleChangeTimeRange = e => {
        setState({
            ...state,
            startDt: e[0],
            endDt: e[1]
        })
    }

    const onDateChange = value => {
        setState({
            ...state,
            startDt: value
        })
    }

    const defaultColDef = useMemo(() => {
        return {
            editable: false,
            enableRowGroup: true,
            enablePivot: true,
            enableValue: true,
            sortable: true,
            resizable: true,
            filter: true,
            minWidth: 50
        };
    }, []);

    return (
        <Layout>
            <div className='notice-header'>
                <CustomBreadcrumb arr={['발주', '발주완료리스트']}></CustomBreadcrumb>
            </div>
            <div className='notice-wrapper'>
            <div className='notice-condition'>
                <Row gutter={16}>
                    <Row gutter={16} className='onVerticalCenter marginTop-10'>
                        <Col span={2}>
                            <Text className='font-15 NanumGothic-Regular' strong>
                                발주일자*
                            </Text>
                        </Col>
                        <Col span={6}>
                            <RangePicker
                                style={{ width: '100%' }}
                                value={[state.startDt, state.endDt]}
                                onChange={handleChangeTimeRange}
                            />
                        </Col>
                        <Col span={8}>
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
                        <Col span={2}>
                            <Text className='font-15 NanumGothic-Regular' strong>
                                발주번호
                            </Text>
                        </Col>
                        <Col span={6}>
                            <Input
                                style={{ width: '100%' }}
                                name='purchaseNo'
                                value={state.purchaseNo}
                                onChange={handleInputChange}
                                placeholder='발주번호'
                            />
                        </Col>
                    </Row>
                    <Row gutter={16} className='onVerticalCenter marginTop-10'>
                        <Col span={2}>
                            <Text className='font-15 NanumGothic-Regular' strong>
                                주문자명
                            </Text>
                        </Col>
                        <Col span={6}>
                            <Input
                                style={{ width: '100%' }}
                                name='orderNm'
                                value={state.orderNm}
                                onChange={handleInputChange}
                                placeholder='주문자명'
                            />
                        </Col>
                        <Col span={2}>
                            <Text className='font-15 NanumGothic-Regular' strong>
                                해외주문번호
                            </Text>
                        </Col>
                        <Col span={6}>
                            <Input
                                style={{ width: '100%' }}
                                name='siteOrderNo'
                                value={state.siteOrderNo}
                                onChange={handleInputChange}
                                placeholder='해외주문번호'
                            />
                        </Col>
                        <Col span={2}>
                            <Text className='font-15 NanumGothic-Regular' strong>
                                (고도몰)주문번호
                            </Text>
                        </Col>
                        <Col span={6}>
                            <Input
                                style={{ width: '100%' }}
                                name='unifiedOrderNo'
                                value={state.unifiedOrderNo}
                                onChange={handleInputChange}
                                placeholder='주문번호'
                            />
                        </Col>
                    </Row>
                    <Row gutter={16} className='onVerticalCenter marginTop-10'>
                        <Col span={2}>
                            <Text className='font-15 NanumGothic-Regular' strong>
                                브랜드
                            </Text>
                        </Col>
                        <Col span={6}>
                            <Select
                                name='brandId'
                                showSearch
                                placeholder='브랜드 선택'
                                className='fullWidth'
                                onChange={v => {
                                    handleSelectChange('brandId', v)
                                }}
                                value={state.brandId != '' ? state.brandId : undefined}
                                filterOption={(input, option) =>
                                    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                }>
                                {brandList.map(item => (
                                    <Option key={item.codeId}>{item.codeNm}</Option>
                                ))}
                            </Select>
                        </Col>
                        <Col span={2}>
                            <Text className='font-15 NanumGothic-Regular' strong>
                                구매처
                            </Text>
                        </Col>
                        <Col span={6}>
                            <Select
                                style={{ width: '100%' }}
                                showSearch
                                showArrow
                                onChange={v => {
                                    handleSelectChange('vendorId', v)
                                }}
                                optionFilterProp='children'
                                filterOption={(input, option) =>
                                    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                }
                                defaultValue={state.vendorId != '' ? state.vendorId : ''}>
                                <Option key='00'>전체</Option>
                                {ownerList.map(item => (
                                    <Option key={item.value}>{item.label}</Option>
                                ))}
                            </Select>
                        </Col>
                        <Col span={2}>
                            <Text className='font-15 NanumGothic-Regular' strong>
                                발주구분
                            </Text>
                        </Col>
                        <Col span={6}>
                            <Select
                                style={{ width: '100%' }}
                                showSearch
                                showArrow
                                onChange={v => {
                                    handleSelectChange('dealtypeCd', v)
                                }}
                                optionFilterProp='children'
                                filterOption={(input, option) =>
                                    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                }
                                defaultValue={state.dealtypeCd != '' ? state.dealtypeCd : ''}>
                                <Option key='00'>전체</Option>
                                {Constans.DEALTYPECD.map(item => (
                                    <Option key={item.value}>{item.label}</Option>
                                ))}
                            </Select>
                        </Col>
                    </Row>

                    <Row gutter={16} type='flex' justify='center' align='middle' className='marginTop-10'>
                        <Col style={{ width: '150px' }}>
                            <Button type='primary' className='fullWidth search' onClick={getPurchaseList}>
                                검색
                            </Button>
                        </Col>
                    </Row>
                </Row>
</div>
                <div style={{ marginTop: '4px' }}>
                    <div className='ag-theme-alpine' style={{ height: props.height, width: '100%' }}>
                        <AgGridReact defaultColDef={defaultColDef} multiSortKey={'ctrl'}
                            className='marginTop-15'
                            onFirstDataRendered={onFirstDataRendered}
                            onBodyScroll={onFirstDataRendered}
                            columnDefs={getColumnDefs()}
                            suppressDragLeaveHidesColumns={true}
                            rowData={state.rowData}
                            ensureDomOrder={true}
                            enableCellTextSelection={true}
                            frameworkComponents={state.frameworkComponents}
                            columnTypes={state.columnTypes}
                            rowSelection={state.rowSelection}
                            paginationAutoPageSize={true}
                            skipHeaderOnAutoSize={true}
                            pagination={false}
                            onGridReady={onGridReady}></AgGridReact>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

//export default Create
export default withRouter(PurchaseCompleteList)
