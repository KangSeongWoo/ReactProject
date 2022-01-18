import React, { useState, useLayoutEffect, useEffect } from 'react'
import { withRouter } from 'react-router-dom'
import { Layout } from 'antd'
import { Input, Row, Col, Modal, Button, Select, Typography } from 'antd'
import { Spin, Cascader } from 'antd'

import Https from '../../../api/http'
import { AgGridReact } from 'ag-grid-react'
import BrandSearch from '../../Common/Brand/Search'
import * as Common from '../../../utils/Common.js'
//import PurchaseVendorSearch from '../../Common/Purchase/VendorList'

import '../../../style/custom.css'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-alpine.css'



const { Option } = Select
const { Title, Text } = Typography

const GoodsSearchList = props => {
    const { isModalVisible, setIsModalVisible, backState, setBackState } = props

    const [loading, setLoading] = useState(false)
    const [gridApi, setGridApi] = useState(null)
    const [ownerList, setOwnerList] = useState([])
    const [brandList, setBrandList] = useState([])
    const [gridColumnApi, setGridColumnApi] = useState(null)
    const [isBrandVisible, setIsBrandVisible] = useState(false) // 브랜드 팝업 state
    const [isPurchaseVendorVisible, setIsPurchaseVendorVisible] = useState(false) // 구매처 팝업 state
    const [state, setState] = useState({
        ownerList: '',
        vendorId: '',
        purchaseVendorNm: '',
        brandId: '',
        brandNm: '',
        categories: [],
        categoryValue: '',
        categoryLabel: '',
        rowData: [],
        assortId: '',
        assortNm: ''
    })

    const columnDefs = () => {
        return [
            {
                headerName: '품목코드',
                field: 'assortId',
                headerCheckboxSelection: true,
                headerCheckboxSelectionFilteredOnly: true,
                checkboxSelection: true
            },
            { headerName: '품목명', field: 'assortNm' },
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
            { headerName: '상품코드', field: 'itemId' },
            {
                headerName: '옵션 진행상태',
                field: 'itemShortageYn',
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
            { headerName: '옵션1', field: 'optionNm1' },
            { headerName: '옵션2', field: 'optionNm2' },
            { headerName: '브랜드', field: 'brandId' },
            { headerName: '브랜드명', field: 'brandNm' },
            { headerName: '카테고리', field: 'dispCategoryId' },
            { headerName: '카테고리명', field: 'categoryNm' },
            { headerName: '전체카테고리명', field: 'fullCategoryNm' },
            { headerName: 'RRP', field: 'mdRrp' },
            { headerName: '공급처할인', field: 'buySupplyDiscount' }
        ]
    }

    // 화면 로딩전 호출
    useLayoutEffect(() => {
        setInit()
    }, [])

    useEffect(() => {
        getBrandSearch()
    }, [ownerList])

    useEffect(() => {
        setCate()
    }, [brandList])

    // 초기화
    const setCate = async () => {
        try {
            const res = await Https.getFullCategories() //카테고리 리스트 조회

            setState({
                ...state,
                categories: [...res.data.data.categoryList]
            })
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    // 구매처 가져오기
    const setInit = async () => {
        try {
            setLoading(true)

            let res = await Https.getVendorList()
            console.log('---------------------------------------------------')
            console.log(res)
            setOwnerList(res.data.data.PurchaseVendors) // 구매처 State
        } catch (error) {
            console.error(error)
        } finally {
        }
    }

    // 브랜드 팝업 보기
    const showBrand = () => {
        setIsBrandVisible(true)
    }

    // 구매처 팝업 보기
    const showPurchaseVendor = () => {
        setIsPurchaseVendorVisible(true)
    }

    // Input Change
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

    const getSearch = () => {
        setLoading(true)
        const { vendorId, brandId, assortId, assortNm, categoryValue } = state

        let params = {}

        if (vendorId != '') {
            params['vendorId'] = vendorId
        }

        if (brandId != '') {
            params['brandId'] = brandId
        }

        if (assortId != '') {
            params['assortId'] = assortId
        }
        if (assortNm != '') {
            params['assortNm'] = assortNm
        }

        if (categoryValue != '') {
            params['categoryValue'] = categoryValue
        }

        const p = new URLSearchParams(params)

        return Https.goodsItemFullCategory(p)
            .then(response => {
                console.log(response)

                setState({
                    ...state,
                    rowData: response.data.data
                })
                setLoading(false)
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
                setLoading(false)
            })
    }

    // agGrid API 호출
    const onGridReady = params => {
        setGridApi(params.api)
        setGridColumnApi(params.columnApi)
    }

    const onChangeCategory = (value, label) => {
        setState({
            ...state,
            categoryValue: value,
            categoryLabel: label.map(o => o.label).join(' > ')
        })
    }

    const handleOk = () => {
        let rows = gridApi.getSelectedRows()

        if (rows.length == 0) {
            alert('상품을 선택해 주세요.')
            return false
        }

        let oriList = backState.rowData
        let newList = rows

        for (var row of oriList) {
            newList = newList.filter(item => !(item.assortId == row.assortId && item.itemId == row.itemId))
        }

        if (backState.page == 'stockList') {
            setBackState({
                ...backState,
                assortId: newList[0].assortId,
                assortNm: newList[0].assortNm
            })
        } else {
            setBackState({
                ...backState,
                rowData: [...backState.rowData, ...newList]
            })
        }

        setIsModalVisible(false)
    }

    const handleCancel = () => {
        setIsModalVisible(false)
    }

    // 컬럼 리사이즈
    const onFirstDataRendered = params => {
        var allColumnIds = []
        params.columnApi.getAllColumns().forEach(function(column) {
            allColumnIds.push(column.colId)
        })

        params.columnApi.autoSizeColumns(allColumnIds, false)
    }

    // 구매처 변경
    const handleChangeVendor = e => {
        setState({
            ...state,
            vendorId: e
        })
    }

    const getBrandSearch = () => {
        setLoading(true)
        let params = {}

        const p = new URLSearchParams(params)

        return Https.getBrandSearchList(p)
            .then(response => {
                console.log(response)

                setBrandList(response.data.data)

                setLoading(false)
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
                setLoading(false)
            }) // ERROR
    }

    return (
        <Layout>
            <Modal
                title='상품검색'
                width='800px'
                visible={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                footer={[
                    <Button key='back' onClick={handleCancel}>
                        취소
                    </Button>,
                    <Button key='submit' type='primary' loading={loading} onClick={handleOk}>
                        확인
                    </Button>
                ]}>
                <Spin spinning={loading} size='large'>
                    <div className='modal-condition'>
                        <Row gutter={[16, 8]} className='onVerticalCenter marginTop-10'>
                            <Col span={4}>
                                <Text className='font-15 NanumGothic-Regular' strong>
                                    구매처
                                </Text>
                            </Col>
                            <Col span={5}>
                                <Select
                                    name='vendorId'
                                    placeholder='구매처 선택'
                                    className='fullWidth'
                                    value={state.vendorId != '' ? state.vendorId : undefined}
                                    onChange={handleChangeVendor}>
                                    {ownerList.map(item => (
                                        <Option key={item.value}>{item.label}</Option>
                                    ))}
                                </Select>
                            </Col>
                            <Col span={4}>
                                <Text className='font-15 NanumGothic-Regular' strong>
                                    브랜드
                                </Text>
                            </Col>
                            <Col span={9}>
                                <Select
                                    name='brandId'
                                    placeholder='브랜드 선택'
                                    className='fullWidth'
                                    value={state.brandId != '' ? state.brandId : undefined}
                                    disabled>
                                    {brandList.map(item => (
                                        <Option key={item.codeId}>{item.codeNm}</Option>
                                    ))}
                                </Select>
                            </Col>
                            <Col span={2}>
                                <Button onClick={showBrand}>검색</Button>
                            </Col>
                        </Row>
                        <Row gutter={[16, 8]} className='onVerticalCenter marginTop-10'>
                            <Col span={4}>
                                <Text className='font-15 NanumGothic-Regular' strong>
                                    품목
                                </Text>
                            </Col>
                            <Col span={8}>
                                <Input
                                    name='assortId'
                                    placeholder='품목코드'
                                    value={state.assortId != '' ? state.assortId : undefined}
                                    onChange={handleInputChange}
                                />
                            </Col>
                            <Col span={12}>
                                <Input
                                    name='assortNm'
                                    placeholder='품목명'
                                    value={state.assortNm != '' ? state.assortNm : undefined}
                                    onChange={handleInputChange}
                                />
                            </Col>
                        </Row>
                        <Row gutter={[16, 8]} className='onVerticalCenter marginTop-10'>
                            <Col span={4}>
                                <Text className='font-15 NanumGothic-Regular' strong>
                                    카테고리
                                </Text>
                            </Col>
                            <Col span={20} style={{ paddingTop: '3px' }}>
                                <Text>{state.categoryLabel != '' ? state.categoryLabel : undefined}</Text>
                                &nbsp;
                                <Cascader name='categoryId' options={state.categories} onChange={onChangeCategory}>
                                    <a href='#'>카테고리 선택</a>
                                </Cascader>
                            </Col>
                        </Row>
                        <Row className='marginTop-10'>
                            <Col span={24}>
                                <Button type='primary' className='fullWidth' onClick={getSearch}>
                                    조회
                                </Button>
                            </Col>
                        </Row>

                        <div>
                            <div className='ag-theme-alpine' style={{ height: 250, width: '100%', paddingTop: '5px' }}>
                                <AgGridReact
                                    className='marginTop-10'
                                    columnDefs={columnDefs()}
                                    rowData={state.rowData}
                                    ensureDomOrder={true}
                                    suppressRowClickSelection={true}
                                    onFirstDataRendered={onFirstDataRendered}
                                    enableCellTextSelection={true}
                                    defaultColDef={{ editable: false, flex: 1, minWidth: 100, resizable: true }}
                                    rowSelection={'single'}
                                    onGridReady={onGridReady}></AgGridReact>
                            </div>
                        </div>
                    </div>

                    <div>
                        <BrandSearch
                            isModalVisible={isBrandVisible}
                            setIsModalVisible={setIsBrandVisible}
                            backState={state}
                            setBackState={setState}
                        />
                    </div>
                    {/* <div>
                        <PurchaseVendorSearch
                            isModalVisible={isPurchaseVendorVisible}
                            setIsModalVisible={setIsPurchaseVendorVisible}
                            backState={state}
                            setBackState={setState}
                        />
                    </div> */}
                </Spin>
            </Modal>
        </Layout>
    )
}

//export default Create
export default withRouter(GoodsSearchList)
