import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import { Layout, Row, Col, Button, Upload, Spin, message } from 'antd'
import '/src/style/custom.css'
import * as moment from 'moment'
import { AgGridReact } from 'ag-grid-react'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-alpine.css'
import Https from '../../../api/http'
import * as XLSX from 'xlsx'

function getUserNm() {
    let user = JSON.parse(localStorage.getItem('user'))
    return user.username
}
function orderDateCounterValueGetter(param) {
    return moment().diff(moment(param.data.orderDt).format('YYYY-MM-DD'), 'days')
}

class List extends Component {
    constructor(props) {
        super(props)
    }
    state = {
        fileList: [],
        height: window.innerHeight - 200,
        data: [],
        rowData: [],
        columnDefs: [
            { field: 'id' },
            { field: 'statusCd', headerName: '상태', editable: true, suppressMenu: true },
            { field: 'orderId', headerName: '주문번호', editable: true, suppressMenu: true },
            {
                field: 'purchaseVendor',
                headerName: '공급처',
                suppressMenu: false,
                editable: true
            },
            { field: 'brand', headerName: '제조사', editable: true, suppressMenu: true },
            { field: 'modelNo', headerName: '모델번호', editable: true, suppressMenu: true },
            { field: 'assortNm', headerName: '상품명', editable: true, suppressMenu: true },
            { field: 'optionNm1', headerName: '옵션1', editable: true, suppressMenu: true },
            { field: 'optionNm2', headerName: '옵션2', editable: true, suppressMenu: true },
            { field: 'optionNm3', headerName: '옵션3', editable: true, suppressMenu: true },
            { field: 'textOptionInfo', headerName: '텍스트옵션', editable: true, suppressMenu: true },
            { field: 'qty', headerName: '수량', editable: true, suppressMenu: true },
            { field: 'unitAmt', headerName: '매입가', editable: true, suppressMenu: true },
            { field: 'optionAmt', headerName: '옵션매입가', editable: true, suppressMenu: true },
            {
                field: 'discountRate',
                headerName: '공급할인율',
                editable: true,
                suppressMenu: true
            },
            {
                headerName: '합계',
                field: 'amt',
                suppressMenu: true,
                valueGetter: param => {
                    let unitAmt = !param.data.unitAmt ? 0 : Number(param.data.unitAmt)
                    let optionAmt = !param.data.optionAmt ? 0 : Number(param.data.optionAmt)
                    let discountRate = !param.data.discountRate ? 0 : Number(param.data.discountRate)
                    let amt = (unitAmt + optionAmt) * (1 - discountRate)
                    return amt
                }
            },
            { field: 'deliMethod', headerName: '고객 선택 운송방식', editable: true, suppressMenu: true },
            { field: 'origin', headerName: '원산지', editable: true, suppressMenu: true },
            { field: 'orderNm', headerName: '주문자이름', editable: true, suppressMenu: true },
            { field: 'orderDt', headerName: '주문일자', editable: true, suppressMenu: true },
            { field: 'orderMemo', headerName: '주문요청사항', editable: true, suppressMenu: true },
            { field: 'stockNo', headerName: '재고', editable: true, suppressMenu: true },
            { field: 'purchaseNo', headerName: '발주번호', editable: true, suppressMenu: true },
            { field: 'pi', headerName: 'PI', editable: true, suppressMenu: true },
           
            { field: 'blNo', headerName: 'B/L번호', editable: true, suppressMenu: true },
            {
                headerName: '주문일 기준 소요기간',
                colId: 'orderDateCounter',
                filter: 'agNumberColumnFilter',
                valueGetter: orderDateCounterValueGetter,
                suppressMenu: true
            },
            { field: 'purchaseDt', headerName: '발주일자', editable: true, suppressMenu: true },
            { field: 'estimatedProductionDate', headerName: '제작완료일', editable: true, suppressMenu: true },
            { field: 'estimatedShipmentDate', headerName: '선적일', editable: true, suppressMenu: true },
            { field: 'estimatedArrivalDate', headerName: '입항일', editable: true, suppressMenu: true },
            { field: 'expectedDeliveryDate', headerName: '입고일', editable: true, suppressMenu: true },
            { field: 'memo', editable: true, suppressMenu: true },
            { field: 'googleDrive', editable: true, suppressMenu: true }
        ],
        gridOptions: {
            rowHeight: 50
        },
        defaultColDef: {
            sortable : true,
            resizable: true,
            flex: 1,
            Width: 150,
            minWidth: 100,
            filter: true,
            sortable: true,
            floatingFilter: true
        },
        rowId: 0,
        rowData: [],
        updateRow: []
    }

    componentDidMount() {
        window.addEventListener('resize', this.resizeEvent)
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.resizeEvent)
    }

    resizeEvent = e => {
        this.setState({
            height: window.innerHeight - 200
        })
    }

    onGridReady = params => {
        this.gridApi = params.api
        this.gridColumnApi = params.columnApi
    }

    getData = async () => {
        this.props.setSpin(true)
        this.setState({ fileList: [], updateRow: [] })

        try {
            let res = await Https.getOrderStock()

            this.setState({
                rowData: res.data.data
            })

            this.props.setSpin(false)

            //  message.success('저장 성공')
            console.log(res)
        } catch (error) {
            this.props.setSpin(false)
            //    message.error('저장 실패')
            console.error(error)
        }
    }

    postData = async () => {
        /* 21-09-17 jack 요청 으로 권한 해제*/
        //        if (getUserNm() == 'rina' || getUserNm() == 'jack') {
        //          message.error('권한이 없습니다.')
        ///        return
        // }
        this.props.setSpin(true)

        let data = []

        try {
            data = await this.convertExcel()
        } catch (error) {
            //    message.error('저장 실패')
            this.props.setSpin(false)
            console.error(error)
        }
        //    console.log(r)

        //   const { data } = this.state

        console.log(data)

        if (data.length == 0) {
            message.error('파일을 선택해주시기 바랍니다.')
            return
        }

        let l = []

        const config = { headers: { 'Content-Type': 'application/json' } }

        data.map((item, idx) => {
            if (idx < 40010) {
                let o = {
                    id: item.id == undefined ? '' : item.id,
                    purchaseVendor: item.purchaseVendor == undefined ? '' : item.purchaseVendor,
                    brand: item.brand == undefined ? '' : item.brand,
                    modelNo: item.modelNo == undefined ? '' : item.modelNo,
                    assortNm: item.assortNm == undefined ? '' : item.assortNm,
                    optionInfo: item.optionInfo == undefined ? '' : item.optionInfo,
                    textOptionInfo: item.textOptionInfo == undefined ? '' : item.textOptionInfo,
                    qty: item.qty == undefined || item.qty == null ? '' : item.qty,
                    unitAmt: item.unitAmt == undefined || item.unitAmt == null ? '' : item.unitAmt,
                    optionAmt: item.optionAmt == undefined || item.optionAmt == null ? '' : item.optionAmt,
                    discountRate: item.discountRate == undefined || item.discountRate == null ? '' : item.discountRate,
                    amt: item.amt == undefined || item.amt == null ? '' : item.amt,
                    deliMethod: item.deliMethod == undefined ? '' : item.deliMethod,
                    origin: item.origin == undefined ? '' : item.origin,
                    orderNm: item.orderNm == undefined ? '' : item.orderNm,
                    orderId: item.orderId == undefined ? '' : item.orderId,
                    orderDt: item.orderDt == undefined ? '' : item.orderDt,
                    orderMemo: item.orderMemo == undefined ? '' : item.orderMemo,
                    statusCd: item.statusCd == undefined ? '' : item.statusCd,
                    stockNo: item.stockNo == undefined ? '' : item.stockNo,
                    purchaseNo: item.purchaseNo == undefined ? '' : item.purchaseNo,
                    pi: item.pi == undefined ? '' : item.pi,
                    realAmt: item.realAmt == undefined || item.realAmt == null ? '' : item.realAmt,
                    realDeliMethod: item.realDeliMethod == undefined ? '' : item.realDeliMethod,
                    carrier: item.carrier == undefined ? '' : item.carrier,
                    blNo: item.blNo == undefined ? '' : item.blNo,
                    deliveryPeriod: item.deliveryPeriod == undefined ? '' : item.deliveryPeriod,
                    purchaseDt: item.purchaseDt == undefined ? '' : item.purchaseDt,
                    estimatedProductionDate:
                        item.estimatedProductionDate == undefined ? '' : item.estimatedProductionDate,
                    estimatedShipmentDate: item.estimatedShipmentDate == undefined ? '' : item.estimatedShipmentDate,
                    estimatedArrivalDate: item.estimatedArrivalDate == undefined ? '' : item.estimatedArrivalDate,
                    expectedDeliveryDate: item.expectedDeliveryDate == undefined ? '' : item.expectedDeliveryDate,
                    memo: item.memo == undefined ? '' : item.memo,
                    userNm: getUserNm()
                }
                l.push(o)
            }
        })

        try {
            let res = await Https.SaveOrderStock(l, config)
            message.success('저장 성공')
            this.getData()
            this.props.setSpin(false)
            this.setState({ fileList: [] })
            console.log(res)
        } catch (error) {
            message.error('저장 실패')
            this.props.setSpin(false)
            console.error(error)
        }
    }

    setData = data => {
        this.setState({
            data: data
        })
    }

    convertExcel = () => {
        return new Promise((resolve, reject) => {
            const { fileList } = this.state

            if (fileList.length == 0) {
                const error = new Error()
                error.name = '파일을 선택 하시기 바랍니다!'
                reject(error)
            }

            let data = []

            this.setState({
                data: []
            })

            let i, f
            for (i = 0, f = fileList[i]; i != fileList.length; ++i) {
                var reader = new FileReader()
                var name = f.name
                reader.onload = e => {
                    try {
                        const { result } = e.target
                        const workbook = XLSX.read(result, {
                            type: 'binary',
                            cellDates: true,
                            cellText: false
                        })
                        data = []
                        for (const sheet in workbook.Sheets) {
                            if (workbook.Sheets.hasOwnProperty(sheet)) {
                                data = data.concat(
                                    XLSX.utils.sheet_to_json(workbook.Sheets[sheet], {
                                        raw: false,
                                        dateNF: 'yyyy-mm-dd hh:mm:ss',
                                        range: 1,
                                        header: [
                                            'id',
                                            'statusCd',
                                            'orderId',
                                            'purchaseVendor',
                                            'brand',
                                            'modelNo',
                                            'assortNm',
                                            'optionInfo',
                                            'textOptionInfo',
                                            'qty',
                                            'unitAmt',
                                            'optionAmt',
                                            'discountRate',
                                            'amt',
                                            'deliMethod',
                                            'origin',
                                            'orderNm',
                                            'orderDt',
                                            'orderMemo',
                                            'stockNo',
                                            'purchaseNo',
                                            'pi',
                                            'realAmt',
                                            'realDeliMethod',
                                            'carrier',
                                            'blNo',
                                            'deliveryPeriod',
                                            'purchaseDt',
                                            'estimatedProductionDate',
                                            'estimatedShipmentDate',
                                            'estimatedArrivalDate',
                                            'expectedDeliveryDate',
                                            'memo',
                                            'googleDrive'
                                        ]
                                    })
                                )
                            }
                        }
                        resolve(data)
                    } catch (e) {
                        const error = new Error()
                        error.name = 'sheet convert 오류!'
                        reject(error)
                    }
                }
                reader.readAsBinaryString(f)
            }
        })
    }

    onRowClicked = event => {
        console.log(event.data.id)

        this.setState({
            rowId: event.data.id
        })
    }

    handleNewVoc = id => {
        window.open('/#/CustomerService/add?orderStockId=' + id, '_blank', 'width=1100,height=840')
    }

    onCellValueChanged = event => {
        const { updateRow } = this.state
        console.log('onCellValueChanged: ')
        console.log(event.rowIndex)

        console.log(event.data)

        console.log(event.node)

        //e.

        let newData = updateRow.filter(v => v.id != event.data.id)

        console.log(newData)

        let o = event.data

        o.userNm = getUserNm()

        newData.push(event.data)
        console.log(newData)

        this.setState({
            updateRow: newData
        })

        console.log(this.state.updateRow)
    }

    updateData = async () => {
        this.props.setSpin(true)

        const { updateRow, rowData } = this.state
        let l = updateRow
        console.log(l)

        const config = { headers: { 'Content-Type': 'application/json' } }

        try {
            let res = await Https.SaveOrderStock(l, config)
            message.success('저장 성공')
            console.log(res)
            this.setState({
                updateRow: []
            })
            this.props.setSpin(false)
        } catch (error) {
            this.props.setSpin(false)
            message.error('저장 실패')
            console.error(error)
        }
    }

    exportExcel = () => {
        this.props.setSpin(true)
        var wb = XLSX.utils.book_new()

        let l = []

        this.gridApi.selectAllFiltered()

        if (this.gridApi.getSelectedRows().length == 0) {
            alert('출력할 데이터가 없습니다.')
            this.props.setSpin(false)
            return false
        }

        this.gridApi.getSelectedRows().map(item => {
            let o = {
                id: item.id,
                상태: item.statusCd,
                주문번호: item.orderId,
                공급처: item.purchaseVendor,
                제조사: item.brand,
                모델번호: item.modelNo,
                상품명: item.assortNm,
                옵션: item.optionInfo,
                텍스트옵션: item.textOptionInfo,
                수량: item.qty,
                매입가: item.unitAmt,
                옵션매입가: item.optionAmt,
                공급할인율: item.discountRate,
                합계: item.amt,
                '고객 선택 운송방식': item.deliMethod,
                원산지: item.origin,
                '주문자 이름': item.orderNm,
                주문일자: item.orderDt,
                주문요청사항: item.orderMemo,
                재고: item.stockNo,
                '발주 번호': item.purchaseNo,
                pi: item.pi,
                잔금: item.realAmt,
                실운송방식: item.realDeliMethod,
                CARRIER: item.carrier,
                'B/L번호': item.blNo,
                '주문일 기준 소요기간': item.deliveryPeriod,
                발주일자: item.purchaseDt,
                제작완료일: item.estimatedProductionDate,
                선적일: item.estimatedShipmentDate,
                입항일: item.estimatedArrivalDate,
                입고일: item.expectedDeliveryDate,
                비고: item.memo,
                구글드라이브: item.googleDrive
            }
            console.log(o)
            l.push(o)
        })
        let fname = moment().format('YYYYMMDDHHmmss') + '.xlsx'
        var ws = XLSX.utils.json_to_sheet(l)
        XLSX.utils.book_append_sheet(wb, ws, 'sheet1')
        XLSX.writeFile(wb, fname)
        this.gridApi.deselectAll()
        this.props.setSpin(false)
    }

    render() {
        const { fileList, rowData, height } = this.state
        const props = {
            onRemove: file => {
                this.setState(state => {
                    const index = state.fileList.indexOf(file)
                    const newFileList = state.fileList.slice()
                    newFileList.splice(index, 1)
                    return {
                        fileList: newFileList
                    }
                })
            },
            beforeUpload: file => {
                this.setState(state => ({
                    fileList: [file]
                }))
                return false
            },

            fileList
        }

        return (
            <Layout>
                <div className='notice-wrapper'>
                    <div className='notice-condition'>
                        <div>
                            <Row gutter={[4, 0]}>
                                <Col span={7}>
                                    <Row type='flex' justify='start'>
                                        <Col span={24}>
                                            <Upload {...props}>
                                                <Button
                                                    style={{
                                                        backgroundColor: '#ffffff',
                                                        color: '#262626'
                                                    }}>
                                                    파일선택
                                                </Button>
                                            </Upload>
                                        </Col>
                                    </Row>
                                </Col>

                                <Col span={16}>
                                    <Row type='flex' justify='end' gutter={[4, 0]}>
                                        <Col span={3}>
                                            <Button
                                                style={{ width: '100%' }}
                                                onClick={e => {
                                                    this.postData()
                                                }}>
                                                파일업로드
                                            </Button>
                                        </Col>
                                        <Col span={3}>
                                            <Button
                                                style={{ width: '100%' }}
                                                onClick={e => {
                                                    this.getData()
                                                }}>
                                                조회
                                            </Button>
                                        </Col>

                                        <Col span={3}>
                                            <Button
                                                style={{ width: '100%' }}
                                                onClick={e => {
                                                    this.updateData()
                                                }}>
                                                저장
                                            </Button>
                                        </Col>

                                        <Col span={3}>
                                            <Button
                                                style={{ width: '100%' }}
                                                onClick={e => {
                                                    this.exportExcel()
                                                }}>
                                                엑셀다운
                                            </Button>
                                        </Col>

                                        <Col span={3}>
                                            <Button
                                                style={{ width: '100%' }}
                                                onClick={e => {
                                                    this.handleNewVoc(this.state.rowId)
                                                }}>
                                                Voc등록
                                            </Button>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                        </div>
                    </div>
                    <div>
                        <div className='ag-theme-alpine' style={{ height: height, width: '100%' }}>
                            <AgGridReact
                                ref='gridRef'
                                suppressDragLeaveHidesColumns={true}
                                gridOptions={this.state.gridOptions}
                                columnDefs={this.state.columnDefs}
                                rowData={rowData}
                                ensureDomOrder={true}
                                enableCellTextSelection={true}
                                defaultColDef={this.state.defaultColDef}
                                multiSortKey={'ctrl'}
                                rowSelection={'single'}
                                suppressRowClickSelection={false}
                                onCellValueChanged={this.onCellValueChanged.bind(this)}
                                onRowClicked={this.onRowClicked.bind(this)}
                                onGridReady={this.onGridReady}></AgGridReact>
                        </div>
                    </div>
                </div>
            </Layout>
        )
    }
}

//export default Create
export default withRouter(List)
