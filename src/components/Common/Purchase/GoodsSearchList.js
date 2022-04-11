import React, { useState, useLayoutEffect, useEffect, useCallback , useMemo } from 'react'
import { withRouter } from 'react-router-dom'
import { Layout } from 'antd'
import { Input, Row, Col, Modal, Button, Select, Typography } from 'antd'
import Https from '../../../api/http'
import { AgGridReact } from 'ag-grid-react'
import * as Common from '../../../utils/Common.js'
import '../../../style/custom.css'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-alpine.css'

const { Option } = Select
const { Text } = Typography

const GoodsSearchList = props => {
    const { isModalVisible, setIsModalVisible, backState, setBackState, rowSelection, callBackFunc } = props

    const [gridApi, setGridApi] = useState(null)
    const [ownerList, setOwnerList] = useState([])
    const [brandList, setBrandList] = useState([])
    const [gridColumnApi, setGridColumnApi] = useState(null)
    const [isBrandVisible, setIsBrandVisible] = useState(false) // 브랜드 팝업 state
    const [isPurchaseVendorVisible, setIsPurchaseVendorVisible] = useState(false) // 구매처 팝업 state
    const [selectedRows, setSelectedRows] = useState(0);
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
        assortNm: '',
        channelGoodsNo:'',
    })

    const columnDefs = () => {
        return [
            {
                headerName: '상품코드',
                field: 'goodsKey',
                headerCheckboxSelection: rowSelection == 'single' ? false :  true,
                headerCheckboxSelectionFilteredOnly: true,
                checkboxSelection: true
            },
            { headerName : '고도몰상품코드', field:'channelGoodsNo'},
            { headerName: '브랜드', field: 'brandNm' },
            { headerName: '모델번호', field: 'modelNo' },
            {
                field: 'imagePath',
                headerName: '이미지',
                cellRenderer: param => {
                    let imgRend = ''
                    imgRend += '<div style="width:40px; text-align:center"><img style="max-width:100%" src="'
                    imgRend += param.value
                    imgRend += '"></div>'

                    return imgRend
                }
            },
            { headerName: '상품명', field: 'assortNm' },
            { headerName: '옵션1', field: 'optionNm1' },
            { headerName: '옵션2', field: 'optionNm2' },
            { headerName: '옵션3', field: 'optionNm3' }
        ]
    }

    // 화면 로딩전 호출
    useLayoutEffect(() => {
        setInit()
    }, [])

    const hotkeyFunction = useCallback(event => {
        if (event.key == 'F8') {
            document.querySelector('.searchPop').click()
        }
    }, [])

    useEffect(() => {
        if (isModalVisible) {
            document.addEventListener('keyup', hotkeyFunction)
        } else {
            document.removeEventListener('keyup', hotkeyFunction)
        }
    }, [isModalVisible])

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
            props.setSpin(false)
        }
    }

    // 구매처 가져오기
    const setInit = async () => {
        try {
            props.setSpin(true)

            let res = await Https.getVendorList()

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
            })
            .finally(() => {
                setCate()
            })
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
        const { vendorId, brandId, assortId, assortNm, categoryValue,channelGoodsNo } = state

        if(vendorId == '' && assortId == '' && assortNm == '' && categoryValue == '' && channelGoodsNo == ''){
            if (brandId == '') {
                alert('브랜드를 선택해 주세요.')
                return false
            }
        }

        let params = {}

        params['vendorId'] = Common.trim(vendorId)
        params['assortId'] = Common.trim(assortId)
        params['assortNm'] = Common.trim(assortNm)
        params['categoryValue'] = Common.trim(categoryValue)
        params['channelGoodsNo'] = Common.trim(channelGoodsNo)
        params['brandId'] = Common.trim(brandId)

        const p = new URLSearchParams(params)

        props.setSpin(true)
        return Https.getGoodsDetailList(p)
            .then(response => {
                console.log(response)

                for(let i = 0; i < response.data.data.length; i++){
                    if(response.data.data[i].rackNo == '' || response.data.data[i].rackNo == null || response.data.data[i].rackNo == undefined){
                        response.data.data[i].rackNo = '999999'
                    }
                }

                setState({
                    ...state,
                    rowData: response.data.data
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
            
            if (callBackFunc != undefined) {
                callBackFunc();
            }
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

    const handleSelectChange = e => {
        setState({
            ...state,
            brandId: e
        })
    }

    // 이미지 Cell 클릭시
    const onCellClicked = e => {
        if (e.colDef.field != 'imagePath') {
            return false
        }
        let data = e.data.listImageData
        window
            .open(
                data,
                '이미지 미리보기' + new Date(),
                'toolbar=no,location=no,directories=no,status=no,scrollbars=yes,resizable=no,width=710,height=1502,top=, left= '
            )
            .focus()
    }
    
    const onSelectionChanged = () => {
        var selectedRows = gridApi.getSelectedRows()
        
        setSelectedRows(selectedRows.length);
    } 

    const defaultColDef = useMemo(() => {
        return {
          sortable: true,
          ditable: false, 
          flex: 1, 
          minWidth: 100, 
          resizable: true
        };
    }, []);

    return (
        <Layout>
            <Modal
                title='상품검색'
                width='1500px'
                className='goodsSearchList'
                visible={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                footer={[
                    <Button key='back' onClick={handleCancel}>
                        취소
                    </Button>,
                    <Button key='submit' type='primary' onClick={handleOk}>
                        확인
                    </Button>
                ]}>
                <div className='notice-wrapper'>
                    <div className='notice-condition'>
                        <Row gutter={[16, 8]} className='onVerticalCenter marginTop-10'>
                            <Col span={4}>
                                <Text className='font-15 NanumGothic-Regular' strong>
                                    브랜드
                                </Text>
                            </Col>
                            <Col span={8}>
                                <Select
                                    name='brandId'
                                    showSearch
                                    placeholder='브랜드 선택'
                                    className='fullWidth'
                                    onChange={handleSelectChange}
                                    value={state.brandId != '' ? state.brandId : undefined}
                                    filterOption={(input, option) =>
                                        option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                    }>
                                    {brandList.map(item => (
                                        <Option key={item.codeId}>{item.codeNm}</Option>
                                    ))}
                                </Select>
                            </Col>
                            <Col span={4}>
                                <Text className='font-15 NanumGothic-Regular' strong>
                                    상품코드
                                </Text>
                            </Col>
                            <Col span={8}>
                                <Input
                                    name='assortId'
                                    placeholder='상품코드'
                                    value={state.assortId != '' ? state.assortId : undefined}
                                    onChange={handleInputChange}
                                />
                            </Col>
                        </Row>
                        <Row gutter={[16, 8]} className='onVerticalCenter marginTop-10'>
                            <Col span={4}>
                                <Text className='font-15 NanumGothic-Regular' strong>
                                    상품명
                                </Text>
                            </Col>
                            <Col span={8}>
                                <Input
                                    name='assortNm'
                                    placeholder='상품명'
                                    value={state.assortNm != '' ? state.assortNm : undefined}
                                    onChange={handleInputChange}
                                />
                            </Col>
                            <Col span={4}>
                                <Text className='font-15 NanumGothic-Regular' strong>
                                    고도몰상품코드
                                </Text>
                            </Col>
                            <Col span={8}>
                                <Input
                                    name='channelGoodsNo'
                                    placeholder='고도몰상품코드'
                                    value={state.channelGoodsNo != '' ? state.channelGoodsNo : undefined}
                                    onChange={handleInputChange}
                                />
                            </Col>
                        </Row>
                        <Row className='marginTop-10'>
                            <Col span={24}>
                                <Button type='primary' className='fullWidth searchPop' onClick={getSearch}>
                                    조회
                                </Button>
                            </Col>
                        </Row>
                    </div>
                    <div className='marginTop-10'>
                        <Text className='font-15 NanumGothic-Regular'>총 선택 : {selectedRows}개</Text>
                        <div className='ag-theme-alpine' style={{ height: 400, width: '100%', paddingTop: '5px' }}>
                            <AgGridReact 
                                defaultColDef={defaultColDef} 
                                multiSortKey={'ctrl'}
                                suppressDragLeaveHidesColumns={true}
                                className='marginTop-10'
                                columnDefs={columnDefs()}
                                onCellClicked={onCellClicked}
                                rowData={state.rowData}
                                ensureDomOrder={true}
                                suppressRowClickSelection={true}
                                onSelectionChanged={onSelectionChanged}
                                onFirstDataRendered={onFirstDataRendered}
                                enableCellTextSelection={true}
                                rowSelection={rowSelection}
                                onGridReady={onGridReady}></AgGridReact>
                        </div>
                    </div>
                </div>
                {/* <div>
                    <BrandSearch
                        isModalVisible={isBrandVisible}
                        setIsModalVisible={setIsBrandVisible}
                        backState={state}
                        setSpin={props.setSpin}
                        setBackState={setState}
                    />
                </div> */}
            </Modal>
        </Layout>
    )
}

//export default Create
export default withRouter(GoodsSearchList)
