import React, { Component , useMemo } from 'react'

import { Layout } from 'antd'

import { Input, DatePicker, Select, Button, AutoComplete, Spin } from 'antd'

import '../../../style/custom.css'
import * as moment from 'moment'

import { withRouter } from 'react-router-dom'

import Https from '../../../api/http'

import { AgGridReact } from 'ag-grid-react'

import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-alpine.css'

import * as Constans from '../../../utils/Constans'



const { Header, Footer, Sider, Content } = Layout
const { Option } = Select
const AutoCompleteOption = AutoComplete.Option

class SearchList extends Component {
    constructor(props) {
        super(props)
    }

    state = {
        loading: false,
        goodsSearchVisible: false,
        assortId: '',
        assortNm: '',
        regDtBegin: moment()
            .subtract(30, 'd')
            .format('YYYY-MM-DD HH:mm:ss'),
        regDtEnd: moment().format('YYYY-MM-DD HH:mm:ss'),
        shortageYn: '01',
        regDtEndOpen: false,
        rowData: [],
        height:0,
        columnDefs: [
            {
                headerName: '품목',
                field: 'assortId'
            },
            {
                headerName: '품목명',
                field: 'assortNm'
            },
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
            {
                headerName: '브랜드',
                field: 'brandId'
            },
            {
                headerName: '브랜드명',
                field: 'brandNm'
            },
            {
                headerName: '카테고리',
                field: 'dispCategoryId'
            },
            {
                headerName: '카테고리명',
                field: 'categoryNm'
            },
            {
                headerName: '전체카테고리명',
                field: 'fullCategoryNm'
            }
        ],
        defaultColDef: {
            editable: false,
            flex: 1,
            minWidth: 100,
            resizable: true
        },
        rowSelection: 'single'
    }

    componentDidMount() {
        this.setState({
            height: window.innerHeight - (document.querySelector('header') != undefined ? document.querySelector('header').clientHeight : 0) - (document.querySelector('footer') != undefined ? document.querySelector('footer').clientHeight : 0) - document.querySelector('.notice-condition').clientHeight - 100
        })
        window.addEventListener('resize', this.resizeEvent)
    }

    componentWillUnmount() {
        this.setState({
            height: window.innerHeight - (document.querySelector('header') != undefined ? document.querySelector('header').clientHeight : 0) - (document.querySelector('footer') != undefined ? document.querySelector('footer').clientHeight : 0) - document.querySelector('.notice-condition').clientHeight - 100
        })
        window.removeEventListener('resize', this.resizeEvent)
    }

    resizeEvent = () => {
        this.setState({
            height: window.innerHeight - (document.querySelector('header') != undefined ? document.querySelector('header').clientHeight : 0) - (document.querySelector('footer') != undefined ? document.querySelector('footer').clientHeight : 0) - document.querySelector('.notice-condition').clientHeight - 100
        })
    }

    handleInputChange = event => {
        const target = event.target

        //const value

        let value

        if (target.type === 'checkbox') {
            value = target.checked
        } else if (target.type === 'file') {
            value = target.files[0]
        } else {
            value = target.value
        }

        //const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name
        //    onInputValue(name,value);

        this.setState({
            [name]: value
        })
    }

    getSearch = (regDtBegin, regDtEnd, shortageYn) => {
        this.setState({
            ...this.state,
            loading: true
        })
        let params = {}
        if (regDtBegin != '') {
            params['regDtBegin'] = regDtBegin
        }

        if (regDtEnd != '') {
            params['regDtEnd'] = regDtEnd
        }

        if (shortageYn != '') {
            params['shortageYn'] = shortageYn
        }

        const p = new URLSearchParams(params)

        return Https.getGoodsSearchList(p)
            .then(response => {
                console.log(response)

                this.setState({
                    rowData: response.data.data,
                    loading: false
                })
            })
            .catch(error => {
                 
                Common.commonNotification({
                    kind: 'error',
                    message: '에러 발생',
                    description: '잠시후 다시 시도해 주세요'
                })
                this.setState({
                    rowData: []
                })
            }) // ERROR
    }

    onValueChange = (field, value) => {
        console.log(field)
        console.log(value)
        this.setState({
            [field]: value
        })
    }

    onGridReady = params => {
        this.gridApi = params.api
        this.gridColumnApi = params.columnApi
    }

    onSearchSelectedValue = () => {
        let r = this.gridApi.getSelectedRows()
        // this.props.onSearchSelectedValue('brandId', r.codeId)
        // this.props.onSearchSelectedValue('brandNm', r.codeNm)
        return r
    }

    disabledRegDtBegin = regDtBegin => {
        const { regDtEnd } = this.state
        if (!regDtBegin || !regDtEnd) {
            return false
        }
        return regDtBegin.valueOf() > regDtEnd.valueOf()
    }

    disabledRegDtEnd = regDtEnd => {
        const { regDtBegin } = this.state
        if (!regDtEnd || !regDtBegin) {
            return false
        }
        return regDtEnd.valueOf() <= regDtBegin.valueOf()
    }

    handleRegDtBeginChange = (date, dateString) => {
        this.onValueChange('regDtBegin', dateString)
    }

    handleRegDtEndChange = (date, dateString) => {
        this.onValueChange('regDtEnd', dateString)
    }

    handleRegDtBeginOpenChange = open => {
        if (!open) {
            this.setState({ RegDtBeginOpen: true })
        }
    }

    handleRegDtEndOpenChange = open => {
        this.setState({ RegDtBeginOpen: open })
    }

    defaultColDef = useMemo(() => {
        return {
          sortable: true,
        };
    }, []);

    render() {
        const { assortId, assortNm, rowData, regDtBegin, regDtEnd, shortageYn, regDtEndOpen } = this.state

        console.log(regDtBegin)
        console.log(regDtEnd)

        return (
            <Layout>
                <Spin spinning={this.state.loading} size='large'>
                    <div className='notice-wrapper'>
                        <div className='notice-condition'>
                            <table>
                                <tbody>
                                    <tr>
                                        <td>상품코드</td>
                                        <td>
                                            <Input
                                                name='assortId'
                                                value={assortId}
                                                onChange={this.handleInputChange}></Input>
                                        </td>
                                        <td>상품명</td>
                                        <td>
                                            <Input
                                                name='assortNm'
                                                value={assortNm}
                                                onChange={this.handleInputChange}></Input>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>생성일</td>
                                        <td>
                                            <DatePicker
                                                disabledDate={this.disabledRegDtBegin}
                                                showTime
                                                format='YYYY-MM-DD HH:mm:ss'
                                                // defaultValue={moment(today, 'YYYY-MM-DD HH:mm:ss')}

                                                value={moment(
                                                    moment(regDtBegin).format('YYYY-MM-DD HH:mm:ss'),
                                                    'YYYY-MM-DD HH:mm:ss'
                                                )}
                                                placeholder='Start'
                                                onChange={this.handleRegDtBeginChange}
                                                onOpenChange={this.handleRegDtBeginOpenChange}
                                            />
                                            {' ~ '}

                                            <DatePicker
                                                disabledDate={this.disabledRegDtEnd}
                                                showTime
                                                format='YYYY-MM-DD HH:mm:ss'
                                                value={moment(
                                                    moment(regDtEnd).format('YYYY-MM-DD HH:mm:ss'),
                                                    'YYYY-MM-DD HH:mm:ss'
                                                )}
                                                placeholder='End'
                                                onChange={this.handleRegDtEndChange}
                                                open={regDtEndOpen}
                                                onOpenChange={this.handleRegDtEndOpenChange}
                                            />
                                        </td>
                                        <td>진행상태</td>
                                        <td>
                                            <Select
                                                style={{ width: '100%' }}
                                                onChange={v => {
                                                    this.onValueChange('shortageYn', v)
                                                }}
                                                value={shortageYn}>
                                                {Constans.SHORTAGEYN.map(item => (
                                                    <Option key={item.value}>{item.label}</Option>
                                                ))}
                                            </Select>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colSpan='4'>
                                            <Button
                                                onClick={e => {
                                                    this.getSearch(regDtBegin, regDtEnd, shortageYn)
                                                }}>
                                                조회
                                            </Button>

                                            <Button
                                                onClick={e => {
                                                    this.showGoodsSearCh()
                                                }}>
                                                팝업
                                            </Button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div>
                            <div className='ag-theme-alpine' style={{ height: this.state.height, width: '100%' }}>
                                <AgGridReact defaultColDef={this.defaultColDef} multiSortKey={'ctrl'}
                                    suppressDragLeaveHidesColumns={true}
                                    ref='gridRef'
                                    columnDefs={this.state.columnDefs}
                                    rowData={rowData}
                                    ensureDomOrder={true}
                                    enableCellTextSelection={true}
                                    defaultColDef={this.state.defaultColDef}
                                    rowSelection={this.state.rowSelection}
                                    onGridReady={this.onGridReady}></AgGridReact>
                            </div>
                        </div>
                    </div>
                </Spin>
            </Layout>
        )
    }
}

//export default Create
export default withRouter(SearchList)
