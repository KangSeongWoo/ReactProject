import React, { Component , useMemo } from 'react'

import CustomBreadcrumb from '../../../utils/CustomBreadcrumb'
import { Layout } from 'antd'
import { PageHeader } from 'antd'
import { withRouter } from 'react-router-dom'
import { Form, Input, Tooltip, Icon, DatePicker, Select, Row, Col, Modal, Checkbox, Button, AutoComplete } from 'antd'

import '../../../style/custom.css'
import * as moment from 'moment'



import Https from '../../../api/http'

import { AgGridColumn, AgGridReact } from 'ag-grid-react'

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
        regDtBegin: moment()
            .subtract(30, 'd')
            .format('YYYY-MM-DD HH:mm:ss'),
        regDtEnd: moment().format('YYYY-MM-DD HH:mm:ss'),
        regDtEndOpen: false,
        purchaseVendorId: '',
        purchaseVendorNm: '',
        rowData: [],
        columnDefs: [
            {
                headerName: '발주번호',
                field: 'purchaseNo'
            },
            {
                headerName: '발주일자',
                field: 'purchaseDt'
            },
            {
                headerName: '발주상태',
                field: 'purchaseStatus',
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
                headerName: '구매처',
                field: 'purchaseVendorId'
            },
            {
                headerName: '구매처명',
                field: 'purchaseVendorNm'
            },
            {
                headerName: '발주수량합계',
                field: 'purchaseQty'
            },
            {
                headerName: '발주금액합계',
                field: 'purchaseAmt'
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
                    rowData: response.data.data
                })

                //  if (response.data.data != null) {

                //    }
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
        const {
            rowData,
            regDtBegin,
            regDtEnd,
            shortageYn,
            regDtEndOpen,
            goodsSearchVisible,
            purchaseVendorId,
            purchaseVendorNm
        } = this.state

        return (
            <Layout>
                <div className='modal-condition'>
                    <table>
                        <tbody>
                            <tr>
                                <td>발주일자</td>
                                <td colSpan={3}>
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
                            </tr>
                            <tr>
                                <td>구매처</td>
                                <td colSpan={3}>
                                    <Button>구매처</Button>
                                    <Input
                                        name='purchaseVendorId'
                                        value={purchaseVendorId}
                                        onChange={this.handleInputChange}></Input>
                                    <Input
                                        name='purchaseVendorNm'
                                        value={purchaseVendorNm}
                                        onChange={this.handleInputChange}></Input>
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
                    <div>
                        <div className='ag-theme-alpine' style={{ height: 200, width: '100%' }}>
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

                <div>
                    <Modal
                        width={600}
                        title='상품검색'
                        visible={this.state.goodsSearchVisible}
                        onOk={this.handleGoodsSearChOk}
                        onCancel={this.handleGoodsSearChCancel}></Modal>
                </div>
            </Layout>
        )
    }
}

//export default Create
export default withRouter(SearchList)
