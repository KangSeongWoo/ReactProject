import React, { useState, useLayoutEffect, useCallback , useMemo, useEffect } from 'react'
import { withRouter } from 'react-router-dom'
import { Layout, Spin, Input, Select, DatePicker, Button, Typography, Row, Col } from 'antd'
import CustomBreadcrumb from '/src/utils/CustomBreadcrumb'
import '/src/style/custom.css'
import * as moment from 'moment'
import Https from '../../../api/http'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-alpine.css'
import * as Constans from '../../../utils/Constans'
import LinkCellRenderer from './LinkCellRenderer'
import * as Common from '../../../utils/Common.js'
import queryStirng from 'query-string'

const { Option } = Select
const { Text } = Typography
const { RangePicker } = DatePicker

const ListV2 = props => {
    const { userId } = props

    const [gridApi, setGridApi] = useState(null)
    const [gridColumnApi, setGridColumnApi] = useState(null)
    const [state, setState] = useState({
        regDtBegin: moment().subtract(1, 'M'),
        regDtEnd: moment(),
        loading: false,
        shortageYn: ' ',
        regDtEndOpen: false,
        rowData: [],
        assortId: '',
        assortNm: '',
        userId: userId
    })

    // 상품리스트 컬럼
    const columnDefs = () => {
        return [
            { headerName: '품목', field: 'assortId' },
            { headerName: '품목명', field: 'assortNm', width: 300, cellRenderer: 'LinkCellRenderer' },
            {
                headerName: '진행상태',
                field: 'shortageYn',
                cellRenderer: param => {
                    let statusNm = ''
                    if (param.value == '01') {
                        statusNm = '진행중'
                    } else if (param.value == '02') {
                        statusNm = '일시중지'
                    } else if (param.value == '03') {
                        statusNm = '단종'
                    } else if (param.value == '04') {
                        statusNm = '품절'
                    }

                    return statusNm
                }
            },
            { headerName: '브랜드', field: 'brandId' },
            { headerName: '브랜드명', field: 'brandNm' },
            { headerName: '전체카테고리명', field: 'fullCategoryNm', width: 300 },
            { headerName: '카테고리', field: 'dispCategoryId' },
            { headerName: '카테고리명', field: 'categoryNm' }
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

    useLayoutEffect(() => {
        window.addEventListener('resize', () => props.setHeight());
        props.setHeight();
        document.addEventListener('keyup', hotkeyFunction)
    }, [])
    
    // 상품 리스트 내역 호출
    const getGoods = () => {
        let params = {}

        params['regDtBegin'] = Common.trim(state.regDtBegin.format('YYYY-MM-DD'))
        params['regDtEnd'] = Common.trim(state.regDtEnd.format('YYYY-MM-DD'))
        params['shortageYn'] = Common.trim(state.shortageYn)
        params['assortId'] = Common.trim(state.assortId)
        params['assortNm'] = Common.trim(state.assortNm)

        const p = new URLSearchParams(params)
        props.setSpin(true)
        return Https.getGoodsMasterListV2(p)
            .then(response => {
                console.log(response)

                setState({
                    ...state,
                    rowData: response.data.data != null ? response.data.data : []
                })
            })
            .catch(error => {
                console.error(error)
                Common.commonNotification({
                    kind: 'error',
                    message: '에러 발생',
                    description: '잠시후 다시 시도해 주세요'
                })
            })
            .finally(() => {
                props.setSpin(false)
            })
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

    const handleSelectShortageYn = e => {
        setState({
            ...state,
            shortageYn: e
        })
    }

    // agGrid API 호출
    const onGridReady = params => {
        setGridApi(params.api)
        setGridColumnApi(params.columnApi)
    }

    // 초기화
    const refresh = () => {
        setState({
            ...state,
            regDtBegin: moment().subtract(1, 'M'),
            regDtEnd: moment(),
            shortageYn: '01',
            rowData: [],
            assortId: '',
            assortNm: ''
        })
    }

    // 상품등록 화면으로 이동
    const addGoods = () => {
        let url = '/Goods/add'
        props.history.push(url)
    }

    // 상품수정 화면 이동
    const productEdit = e => {
        e.data.displayKd = 'POP'
        let url = '/#/Goods/editV2?' + queryStirng.stringify(e.data)

        window
            .open(
                url,
                '상세' + new Date(),
                'toolbar=no,location=no,directories=no,status=no,scrollbars=yes,resizable=no,width=1610,height=1402,top=, left= '
            )
            .focus()
    }

    // 주문일자 범위변경
    const handleChangeRangeDate = e => {
        setState({
            ...state,
            regDtBegin: e[0],
            regDtEnd: e[1]
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
            <CustomBreadcrumb style={{ marginBottom: '0px' }} arr={['상품', '상품리스트']}></CustomBreadcrumb>
            <div className='notice-wrapper'>
                <div className='notice-condition'>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Row gutter={16} className='onVerticalCenter marginTop-10'>
                                <Col span={4}>
                                    <Text className='font-15 NanumGothic-Regular' strong>
                                        상품코드
                                    </Text>
                                </Col>
                                <Col span={20}>
                                    <Input name='assortId' value={state.assortId} onChange={handleInputChange} />
                                </Col>
                            </Row>
                        </Col>
                        <Col span={12}>
                            <Row gutter={16} className='onVerticalCenter marginTop-10'>
                                <Col span={4}>
                                    <Text className='font-15 NanumGothic-Regular' strong>
                                        상품명
                                    </Text>
                                </Col>
                                <Col span={20}>
                                    <Input name='assortNm' value={state.assortNm} onChange={handleInputChange} />
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Row gutter={16} className='onVerticalCenter marginTop-10'>
                                <Col span={4}>
                                    <Text className='font-15 NanumGothic-Regular' strong>
                                        생성일
                                    </Text>
                                </Col>
                                <Col span={20}>
                                    <RangePicker
                                        className='fullWidth'
                                        value={[state.regDtBegin, state.regDtEnd]}
                                        ranges={{
                                            Today: [moment(), moment()],
                                            '3일': [moment().subtract(3, 'd'), moment()],
                                            '7일': [moment().subtract(7, 'd'), moment()],
                                            '1개월': [moment().subtract(1, 'M'), moment()],
                                            '3개월': [moment().subtract(3, 'M'), moment()],
                                            '1년': [moment().subtract(1, 'Y'), moment()]
                                        }}
                                        onChange={handleChangeRangeDate}
                                    />
                                </Col>
                            </Row>
                        </Col>
                        <Col span={12}>
                            <Row gutter={16} className='onVerticalCenter marginTop-10'>
                                <Col span={4}>
                                    <Text className='font-15 NanumGothic-Regular' strong>
                                        진행상태
                                    </Text>
                                </Col>
                                <Col span={20}>
                                    <Select
                                        name='shortageYn'
                                        className='fullWidth'
                                        onChange={handleSelectShortageYn}
                                        value={state.shortageYn}>
                                        {Constans.SHORTAGEYN.map(item => (
                                            <Option key={item.value}>{item.label}</Option>
                                        ))}
                                    </Select>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                    <Row gutter={16} type='flex' justify='center' align='middle' className='marginTop-10'>
                        <Col style={{ width: '150px' }}>
                            <Button type='primary' className='fullWidth' ghost onClick={refresh}>
                                초기화
                            </Button>
                        </Col>
                        <Col style={{ width: '150px' }}>
                            <Button type='primary' className='fullWidth search' onClick={getGoods}>
                                검색
                            </Button>
                        </Col>
                    </Row>
                </div>
                
                <div className='clearfix'>
                    <div className='notice-center-button-left'>
                        <span>총 {state.rowData.length} 개</span>
                    </div>
                    <div className='notice-center-button'>
                        <Button type='primary' className='fullWidth' onClick={addGoods}>
                            상품등록
                        </Button>
                    </div>
                </div>
                <div>
                    <div className='ag-theme-alpine' style={{ height: props.height, width: '100%' }}>
                        <AgGridReact defaultColDef={defaultColDef} multiSortKey={'ctrl'}
                            suppressDragLeaveHidesColumns={true}
                            columnDefs={columnDefs()}
                            rowData={state.rowData}
                            ensureDomOrder={true}
                            enableCellTextSelection={true}
                            frameworkComponents={LinkCellRenderer}
                            columnTypes={{
                                fullCategoryNmType: {
                                    width: 500
                                }
                            }}
                            onRowClicked={productEdit}
                            rowSelection={'single'}
                            paginationAutoPageSize={true}
                            skipHeaderOnAutoSize={true}
                            pagination={true}
                            onGridReady={onGridReady}></AgGridReact>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default withRouter(ListV2)
