import React, { Component, useState , useMemo, useEffect } from 'react'
import { Layout } from 'antd'
import { Input, DatePicker, Select, Button, Spin, Modal } from 'antd'
import '../../../style/custom.css'
import * as moment from 'moment'
import { withRouter } from 'react-router-dom'
import Https from '../../../api/http'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-alpine.css'
import * as Constans from '../../../utils/Constans'
import * as Common from '../../../utils/Common.js'



const { Option } = Select

const SearchList = props => {
    const { isModalVisible, setIsModalVisible, backState, setBackState } = props

    const [loading, setLoading] = useState(false)
    const [gridApi, setGridApi] = useState(null)
    const [gridColumnApi, setGridColumnApi] = useState(null)
    const [purchaseVendorList, setPurchaseVendorList] = useState([])
    const [storageList, setStorageList] = useState([])
    const [state, setState] = useState({
        assortId: '',
        assortNm: '',
        regDtBegin: moment().subtract(30, 'd'),
        regDtEnd: moment(),
        shortageYn: '01',
        rowData: [],
    })

    const columnDefs = () => {
        return [
            { headerName: '품목', field: 'assortId' },
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
                headerName: '진행상태',
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
            { headerName: '옵션3', field: 'optionNm3' },
            { headerName: '브랜드', field: 'brandId' },
            { headerName: '브랜드명', field: 'brandNm' },
            { headerName: '카테고리', field: 'dispCategoryId' },
            { headerName: '카테고리명', field: 'categoryNm' },
            { headerName: '전체카테고리명', field: 'fullCategoryNm' }
        ]
    }

    // Input 창에 HandleChange 관련 함수
    const handleInputChange = event => {
        const target = event.target
        const name = target.name

        let value = ''

        if (target.type === 'checkbox') {
            value = target.checked
        } else if (target.type === 'file') {
            value = target.files[0]
        } else {
            value = target.value
        }

        setState({
            ...state,
            [name]: value
        })
    }

    // 조건에 맞는 상품 검색하기;
    const getSearch = () => {
        setLoading(true)
        const { assortId, assortNm, regDtBegin, regDtEnd, shortageYn } = state
        let params = {}

        params.assortId = assortId
        params.assortNm = assortNm
        params.regDtBegin = regDtBegin.format('YYYY-MM-DD')
        params.regDtEnd = regDtEnd.format('YYYY-MM-DD')
        params.shortageYn = shortageYn

        console.log('params : ' + JSON.stringify(params))

        const p = new URLSearchParams(params)

        return Https.getGoodsItemSearchList(p)
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
            }) // ERROR
    }

    const onValueChange = (field, value) => {
        console.log(field)
        console.log(value)
        setState({
            ...state,
            [field]: value
        })
    }

    // agGrid API 호출
    const onGridReady = params => {
        setGridApi(params.api)
        setGridColumnApi(params.columnApi)
    }

    const onSearchSelectedValue = () => {
        let rows = gridApi.getSelectedRows()
        return rows
    }

    const handleRegDtBeginChange = (date, dateString) => {
        onValueChange('regDtBegin', moment(dateString))
    }

    const handleRegDtEndChange = (date, dateString) => {
        onValueChange('regDtEnd', moment(dateString))
    }

    // 컬럼 리사이즈
    const onFirstDataRendered = params => {
        var allColumnIds = []
        params.columnApi.getAllColumns().forEach(function(column) {
            allColumnIds.push(column.colId)
        })

        params.columnApi.autoSizeColumns(allColumnIds, false)
    }

    const handleOk = () => {
        let rows = gridApi.getSelectedRows()
        setIsModalVisible(false)
    }

    const handleCancel = () => {
        setIsModalVisible(false)
    }

    const defaultColDef = useMemo(() => {
        return {
          sortable: true,
          editable: false, 
          minWidth: 100, 
          resizable: true
        };
    }, []);

    return (
            <Spin spinning={loading} size='large'>
                <Modal width={880} title='상품검색' visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
                <div className='notice-wrapper'>
                    <div className='notice-condition'>
                        <table>
                            <tbody>
                                <tr>
                                    <td>상품코드</td>
                                    <td>
                                        <Input name='assortId' value={state.assortId} onChange={handleInputChange}></Input>
                                    </td>
                                    <td>상품명</td>
                                    <td>
                                        <Input name='assortNm' value={state.assortNm} onChange={handleInputChange}></Input>
                                    </td>
                                </tr>
                                <tr>
                                    <td>생성일</td>
                                    <td>
                                        <DatePicker
                                            name='regDtBegin'
                                            value={state.regDtBegin}
                                            placeholder='Start'
                                            onChange={handleRegDtBeginChange}
                                        />
                                        {' ~ '}

                                        <DatePicker
                                            name='regDtEnd'
                                            value={state.regDtEnd}
                                            placeholder='End'
                                            onChange={handleRegDtEndChange}
                                        />
                                    </td>
                                    <td>진행상태</td>
                                    <td>
                                        <Select
                                            name='shortageYn'
                                            className='fullWidth'
                                            onChange={v => {
                                                onValueChange('shortageYn', v)
                                            }}
                                            value={state.shortageYn}>
                                            {Constans.SHORTAGEYN.map(item => (
                                                <Option key={item.value}>{item.label}</Option>
                                            ))}
                                        </Select>
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan='4'>
                                        <Button onClick={getSearch}>조회</Button>
                                        {/* <Button onClick={showGoodsSearCh}>
                                            팝업
                                        </Button> */}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        </div>
                        <div>
                            <div className='ag-theme-alpine' style={{ height: props.height, width: '100%' }}>
                                <AgGridReact defaultColDef={defaultColDef} multiSortKey={'ctrl'}
                                    columnDefs={columnDefs()}
                                    onFirstDataRendered={onFirstDataRendered}
                                    rowData={state.rowData}
                                    ensureDomOrder={true}
                                    enableCellTextSelection={true}
                                    rowSelection={'single'}
                                    onGridReady={onGridReady}></AgGridReact>
                            </div>
                        </div>
                    </div>
                </Modal>
            </Spin>
    )
}

//export default Create
export default withRouter(SearchList)
