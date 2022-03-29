import React, { useState, useEffect, useLayoutEffect, useCallback , useMemo } from 'react'
import CustomBreadcrumb from '/src/utils/CustomBreadcrumb'
import { withRouter } from 'react-router-dom'
import queryStirng from 'query-string'
import moment from 'moment'
import { Row, Col, Button, Input, Typography, DatePicker, Select, Divider } from 'antd'
import { AgGridReact } from 'ag-grid-react'
import Https from '../../../api/http'
import * as Helpers from '../../../utils/Helpers'
import * as GridKeyValue from '../../../utils/GridKeyValue'
import * as Constans from '../../../utils/Constans'
import * as Common from '../../../utils/Common.js'
import '/src/style/custom.css'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-alpine.css'
import * as XLSX from 'xlsx'

const { Text } = Typography
const { Option } = Select

// 이동지시구분 JSON
let moveIndGb = {}
for (let i = 0; i < Constans.MOVEINBGB.length; i++) {
    moveIndGb[Constans.MOVEINBGB[i].value] = Constans.MOVEINBGB[i].label
}

// 배송방법 관련 Select 박스 적용용
let shipmentList = []
let keys = Object.keys(GridKeyValue.SHIPMENT)
let values = Object.values(GridKeyValue.SHIPMENT)

for (let i = 0; i < keys.length; i++) {
    let tempJson = {}
    tempJson.label = values[i]
    tempJson.value = keys[i]
    shipmentList.push(tempJson)
}

const MoveProcessList = props => {
    const { userId } = props

    console.log('유저 ID : ' + userId)

    let params = queryStirng.parse(props.params)
    
    const [gridApi, setGridApi] = useState(null)
    const [gridColumnApi, setGridColumnApi] = useState(null)
    const [storageList, setStorageList] = useState([])
    const [storageCate, setStorageCate] = useState([])

    // API 호출 get state
    const [getData, setGetData] = useState({
        startDt: moment().subtract(7, 'd'),
        endDt: moment(),
        storageId: '',
        assortId: '',
        assortNm: '',
        shipId: '',
        blNo: Common.trim(params.blNo) != '' ? Common.trim(params.blNo) : '',
        userId: userId
    })

    //화면에 노출되는 state
    const [state, setState] = useState({
        rowData: []
    })
    
    //상세 이동
    const LinkCellRenderer1 = props => {
        return (
            <a herf='#' onClick={() => {
                props.data.displayKd = 'POP'
                //window.location.href = '/#/Move/moveProcessOne?' + queryStirng.stringify(e.data)
                window
                    .open(
                        '/#/Move/moveProcessOne?' + queryStirng.stringify(props.data),
                        '상세' + new Date(),
                        'toolbar=no,location=no,directories=no,status=no,scrollbars=yes,resizable=no,width=1610,height=1402,top=, left= '
                    )
                    .focus()
            }}>
                {props.value}
            </a>
        )
    }
    
    const LinkCellRenderer2 = (props) => {
        return (
            <Select placeholder="컨테이너 종류" value={props.value} style={{ width: 139 }} onChange={(e) => {
                props.data.containerKd = e;
                props.setValue(e);
                return props
            }}>
                {Constans.CONTAINERKD.map(item => (
                     <Option value={item.value}>{item.label}</Option>
                ))}
            </Select>
        )
    }

    const columnDefs = () => {
        return [
            {
                field: 'shipKey',
                headerName: '이동지시번호', 
                editable: false,
                suppressMenu: true,
                headerCheckboxSelection: true,
                headerCheckboxSelectionFilteredOnly: true,
                checkboxSelection: true,
                cellRenderer: 'LinkCellRenderer1'
            },
            { field: 'shipIndDt', headerName: '이동지시일자', editable: false, suppressMenu: true },
            { field: 'shipDt', headerName: '이동일자', editable: false, suppressMenu: true },
            { field: 'trackNo ', headerName: '트래킹번호', editable: false, suppressMenu: true },
            {
                field: 'storageId',
                headerName: '출고창고',
                editable: false,
                suppressMenu: true,
                cellEditor: 'select',
                cellEditorParams: {
                    values: Helpers.extractValues(storageCate)
                },
                valueFormatter: function(params) {
                    return Helpers.lookupValue(storageCate, params.value)
                },
                valueParser: function(params) {
                    return Helpers.lookupKey(storageCate, params.newValue)
                }
            },
            {
                field: 'oStorageId',
                headerName: '입고창고',
                editable: false,
                suppressMenu: true,
                cellEditor: 'select',
                cellEditorParams: {
                    values: Helpers.extractValues(storageCate)
                },
                valueFormatter: function(params) {
                    return Helpers.lookupValue(storageCate, params.value)
                },
                valueParser: function(params) {
                    return Helpers.lookupKey(storageCate, params.newValue)
                }
            },
            {
                field: 'shipGb',
                headerName: '이동지시구분',
                editable: false,
                suppressMenu: true,
                cellEditor: 'select',
                cellEditorParams: {
                    values: Helpers.extractValues(moveIndGb)
                },
                valueFormatter: function(params) {
                    return Helpers.lookupValue(moveIndGb, params.value)
                },
                valueParser: function(params) {
                    return Helpers.lookupKey(moveIndGb, params.newValue)
                }
            },
            {
                field: 'deliMethod',
                headerName: '이동방법',
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
            { field: 'assortId', headerName: '품목코드', editable: false, suppressMenu: true },
            { field: 'itemId', headerName: '상품코드', editable: false, suppressMenu: true },
            { field: 'assortNm', headerName: '상품명', editable: false, suppressMenu: true },
            { field: 'optionNm1', headerName: '옵션1', editable: false, suppressMenu: true },
            { field: 'optionNm2', headerName: '옵션2', editable: false, suppressMenu: true },
            { field: 'optionNm3', headerName: '옵션3', editable: false, suppressMenu: true },
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
            { field: 'blNo', headerName: 'BL번호', editable: true, suppressMenu: true,cellStyle: { backgroundColor: '#DAF7A6' } },
            { field: 'shipmentDt', headerName: '선적일자', editable: true, suppressMenu: true,cellStyle: { backgroundColor: '#DAF7A6' } },
            { field: 'movementKd', headerName: '운송형태', editable: true, suppressMenu: true ,cellStyle: { backgroundColor: '#DAF7A6' }},
            { field: 'estiArrvDt', headerName: '도착예정일자', editable: true, suppressMenu: true ,cellStyle: { backgroundColor: '#DAF7A6' }},
            {
                field: 'containerKd', headerName: '컨테이너 종류', editable: false, suppressMenu: true, cellRenderer: 'LinkCellRenderer2'
            },
            { field: 'containerQty', headerName: '컨테이너 수량', editable: true, suppressMenu: true ,cellStyle: { backgroundColor: '#DAF7A6' }}
        ]
    }

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

    useEffect(() => {
        changeArray()
    }, [storageList])

    // 화면 진입할때 blNo를 가지고 오는 경우 
    useEffect(() => {
        if (params.blNo != null && params.blNo != undefined && params.blNo != '') {
            let params = {}
            
            params.blNo = Common.trim(params.blno)

            console.log('params : ' + JSON.stringify(params))

            const p = new URLSearchParams(params)

            getMoveProcessList(p)
        }
    },[])
    
    // 창고 관련 리스트 카테고리 만들기
    const changeArray = () => {
        let storageCate = {}
        for (let i = 0; i < storageList.length; i++) {
            storageCate[storageList[i].value] = storageList[i].label
        }
        setStorageCate(storageCate)
    }

    // 화면초기화
    const setInit = async () => {
        props.setSpin(true)
        try {
            let res = await Https.getStorageList()
            console.log('---------------------------------------------------')
            console.log(res)

            setStorageList(res.data.data.Storages) // 입고창고 State
        } catch (error) {
            console.error(error)
        } finally {
            props.setSpin(false)
        }
    }

    // agGrid API 호출
    const onGridReady = params => {
        setGridApi(params.api)
        setGridColumnApi(params.columnApi)
    }

    // 조건에 따라 주문이동 가능 내역 조회
    const checkTheValue = () => {
        props.setSpin(true)
        
        const { startDt, endDt, storageId, shipId, assortId, assortNm, blNo } = getData

        let params = {}
        params.startDt = Common.trim(startDt.format('YYYY-MM-DD'))
        params.endDt = Common.trim(endDt.format('YYYY-MM-DD'))
        params.storageId = Common.trim(storageId)
        params.shipId = Common.trim(shipId)
        params.assortId = Common.trim(assortId)
        params.assortNm = Common.trim(assortNm)
        params.blNo = Common.trim(blNo)

        console.log('params : ' + JSON.stringify(params))

        const p = new URLSearchParams(params)

        getMoveProcessList(p)
    }
    
    const getMoveProcessList = (p) => {
        return Https.getMoveProcessList(p)
            .then(response => {
                console.log(response)

                let target = response.data.data
                setState({
                    ...state,
                    height: window.innerHeight - (document.querySelector('header') != undefined ? document.querySelector('header').clientHeight : 0) - (document.querySelector('footer') != undefined ? document.querySelector('footer').clientHeight : 0) - document.querySelector('.notice-condition').clientHeight - 100,
                    rowData: target.moves // 화면에 보여줄 리스트
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

    // 조회 리스트 & 조건 초기화
    const refresh = () => {
        setState({
            ...state,
            rowData: [] // 화면에 보여줄 리스트
        })

        setGetData({
            ...getData,
            purchaseNo: '', // 발주번호
            storageId: '입고창고선택', // 창고아이디
            purchaseVendorId: '구매처선택', // 구매처
            deposits: []
        })
    }

    // 발주번호 입력
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

    // 이동시작일자 변경
    const handleChangeStartDate = e => {
        setGetData({
            ...getData,
            startDt: e
        })
    }

    // 이동종료일자 변경
    const handleChangeEndDate = e => {
        setGetData({
            ...getData,
            endDt: e
        })
    }
    
    // 컬럼 리사이즈
    const onFirstDataRendered = params => {
        var allColumnIds = []
        params.columnApi.getAllColumns().forEach(function(column) {
            allColumnIds.push(column.colId)
        })

        params.columnApi.autoSizeColumns(allColumnIds, false)
    }

    const excelDownload = () => {
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
                orderId: tempData.orderId,
                orderSeq: tempData.orderSeq,
                shipDt: tempData.shipDt,
                shipId: tempData.shipId,
                shipGb: tempData.shipGb,
                shipIndDt: tempData.shipIndDt,
                shipKey: tempData.shipKey,
                shipSeq: tempData.shipSeq,
                storageId: tempData.storageId,
                trackNo: tempData.trackNo,
                assortId: tempData.assortId,
                assortNm: tempData.assortNm,
                deliMethod: tempData.deliMethod,
                goodsKey: tempData.goodsKey,
                itemId: tempData.itemId,
                oStorageId: tempData.oStorageId,
                optionNm1: tempData.optionNm1,
                optionNm2: tempData.optionNm2,
                optionNm3: tempData.optionNm3,
                qty: tempData.qty,
                blNo: tempData.blNo,
                shipmentDt: tempData.shipmentDt.replace(/-/g, ''),
                movementKd: tempData.movementKd,
                estiArrvTm: tempData.estiArrvTm,
                containerKd: tempData.containerKd,
                containerQty: tempData.containerQty
            }
            console.log(o)
            l.push(o)
        }
        var wscols = [
            { wch: 10 },
            { wch: 10 },
            { wch: 10 },
            { wch: 10 },
            { wch: 10 },
            { wch: 10 },
            { wch: 10 },
            { wch: 10 },
            { wch: 10 },
            { wch: 10 },
            { wch: 10 },
            { wch: 10 },
            { wch: 10 },
            { wch: 10 },
            { wch: 10 },
            { wch: 10 },
            { wch: 10 },
            { wch: 10 },
            { wch: 10 },
            { wch: 10 },
            { wch: 10 },
            { wch: 10 },
            { wch: 10 },
            { wch: 10 }
        ]
        let fname = moment().format('YYYYMMDDHHmmss') + '.xlsx'
        let ws = XLSX.utils.json_to_sheet(l)
        ws['!cols'] = wscols
        XLSX.utils.book_append_sheet(wb, ws, 'sheet1')
        XLSX.writeFile(wb, fname)
        gridApi.deselectAll()
        props.setSpin(false)
    }

    const excelUpload = event => {
        var input = event.target
        var reader = new FileReader()
        reader.onload = function() {
            var fileData = reader.result
            var wb = XLSX.read(fileData, { type: 'binary' })
            wb.SheetNames.forEach(async function(sheetName) {
                var rowObj = XLSX.utils.sheet_to_json(wb.Sheets[sheetName])
                console.log(JSON.stringify(rowObj))
                for (let i = 0; i < rowObj.length; i++) {
                    if (Common.trim(rowObj[i].shipmentDt) != '') {
                        if (String(rowObj[i].shipmentDt).length != 8) {
                            alert('입력하신 날짜 형식을 확인해 주세요 ex) 20220120')
                            document.querySelector('#excelFile').value = ''
                            return false
                        }
                        rowObj[i].shipmentDt =
                            String(rowObj[i].shipmentDt).slice(0, 4) +
                            '-' +
                            String(rowObj[i].shipmentDt).slice(4, 6) +
                            '-' +
                            String(rowObj[i].shipmentDt).slice(6, 8)
                    }
                }

                let sendData = {}

                sendData.assortId = getData.assortId
                sendData.assortNm = getData.assortNm
                sendData.startDt = getData.startDt.format('YYYY-MM-DD')
                sendData.endDt = getData.endDt.format('YYYY-MM-DD')
                sendData.shipId = getData.shipId
                sendData.storageId = getData.storageId
                sendData.userId = getData.userId
                sendData.moves = rowObj

                const config = { headers: { 'Content-Type': 'application/json' } }

                return await Https.uploadExcelDB(sendData, config)
                    .then(response => {
                        props.setSpin(false)
                        console.log(response)

                        setState({
                            ...state,
                            rowData: rowObj
                        })
                        document.querySelector('#excelFile').value = ''
                    })
                    .catch(error => {
                        console.error(error)
                        Common.commonNotification({
                            kind: 'error',
                            message: '에러 발생',
                            description: '잠시후 다시 시도해 주세요'
                        })
                        document.querySelector('#excelFile').value = ''
                        props.setSpin(false)
                    }) // ERROR
            })
        }
        reader.readAsBinaryString(input.files[0])
    }
    
    const saveTheValue = async () => {
        var selectedRows = gridApi.getSelectedRows()
        
        if (selectedRows.length == 0) {
            alert("저장할 데이터를 선택해 주세요");
            return false;
        }
        
        let sendData = {}

        sendData.assortId = getData.assortId
        sendData.assortNm = getData.assortNm
        sendData.startDt = getData.startDt.format('YYYY-MM-DD')
        sendData.endDt = getData.endDt.format('YYYY-MM-DD')
        sendData.shipId = getData.shipId
        sendData.storageId = getData.storageId
        sendData.userId = getData.userId
        sendData.moves = selectedRows

        const config = { headers: { 'Content-Type': 'application/json' } }

        props.setSpin(true)
        return await Https.uploadExcelDB(sendData, config)
            .then(response => {
                props.setSpin(false)
            })
            .catch(error => {
                console.error(error)
                Common.commonNotification({
                    kind: 'error',
                    message: '에러 발생',
                    description: '잠시후 다시 시도해 주세요'
                })
                document.querySelector('#excelFile').value = ''
                props.setSpin(false)
            }) // ERROR
    }
    
    const handleChangeStorage = (e) => {
        setGetData({
            ...getData,
            storageId: e
        })
    }

    const defaultColDef = useMemo(() => {
        return {
          sortable: true,
          flex: 1, minWidth: 100, resizable: true
        };
    }, []);

    return (
        <>
            <CustomBreadcrumb style={{ marginBottom: '0px' }} arr={['이동', '이동리스트']}></CustomBreadcrumb>

            <div className='notice-wrapper'>
                <div className='notice-condition'>
            <Row type='flex' justify='end' gutter={[16, 8]}>
                <Col style={{ width: '150px' }}>
                    <Button type='primary' className='fullWidth' onClick={excelDownload}>
                        엑셀 다운로드
                    </Button>
                </Col>
                <Col style={{ width: '150px' }}>
                    <input type='file' id='excelFile' onChange={excelUpload} style={{ display: 'none' }} />
                    <Button
                        type='primary'
                        className='fullWidth'
                        onClick={() => {
                            document.querySelector('#excelFile').click()
                        }}>
                        엑셀 업로드
                    </Button>
                </Col>
                <Col style={{ width: '150px' }}>
                    <Button type='primary' className='fullWidth search' onClick={checkTheValue}>
                        조회
                    </Button>
                </Col>
                <Col style={{ width: '150px' }}>
                    <Button type='primary' className='fullWidth search' onClick={saveTheValue}>
                        저장
                    </Button>
                </Col>
            </Row>
            <Divider style={{ margin: '10px 0' }} />
            <Row gutter={[16, 8]}>
                <Col span={20}>
                    <Row gutter={[16, 8]} className='onVerticalCenter marginTop-10'>
                        <Col span={4}>
                            <Text className='font-15 NanumGothic-Regular' strong>
                                이동일자
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
                                이동지시번호
                            </Text>
                        </Col>
                        <Col span={12}>
                            <Input
                                name='shipId'
                                placeholder='이동지시번호를 입력해주세요.'
                                className='fullWidth'
                                defaultValue={getData.shipId != '' ? getData.shipId : undefined}
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
                                placeholder='상품코드를 입력해주세요.'
                                className='fullWidth'
                                defaultValue={getData.assortId != '' ? getData.assortId : undefined}
                                onInput={handlechangeInput}
                            />
                        </Col>
                        <Col span={6}>
                            <Input
                                name='assortNm'
                                placeholder='상품명을 입력해주세요.'
                                className='fullWidth'
                                defaultValue={getData.assortNm != '' ? getData.assortNm : undefined}
                                onInput={handlechangeInput}
                            />
                        </Col>
                    </Row>
                    <Row gutter={[16, 8]} className='onVerticalCenter marginTop-10'>
                        <Col span={4}>
                            <Text className='font-15 NanumGothic-Regular' strong>
                                입고센터
                            </Text>
                        </Col>
                        <Col span={12}>
                            <Select
                                name='storageId'
                                placeholder='입고센터를 선택해 주세요.'
                                defaultValue={getData.storageId != '' ? getData.storageId : undefined}
                                onChange={handleChangeStorage}
                                className='fullWidth'>
                                {storageList.map(item => (
                                    <Option key={item.value}>{item.label}</Option>
                                ))}
                            </Select>
                        </Col>
                    </Row>
                    <Row gutter={[16, 8]} className='onVerticalCenter marginTop-10'>
                        <Col span={4}>
                            <Text className='font-15 NanumGothic-Regular' strong>
                                BL 번호
                            </Text>
                        </Col>
                        <Col span={12}>
                            <Input
                                name='blNo'
                                placeholder='BL 번호를 입력해주세요.'
                                className='fullWidth'
                                defaultValue={getData.blNo != '' ? getData.blNo : undefined}
                                onInput={handlechangeInput}
                            />
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
                        //onSelectionChanged={onSelectionChanged}
                        suppressRowClickSelection={true}
                        onFirstDataRendered={onFirstDataRendered}
                        onBodyScroll={onFirstDataRendered}
                        rowSelection={'multiple'}
                        // onRowClicked={goDetail}
                        frameworkComponents={{ LinkCellRenderer1: LinkCellRenderer1, LinkCellRenderer2: LinkCellRenderer2 }}
                        columnDefs={columnDefs()}
                        onGridReady={onGridReady}></AgGridReact>
                </div>
            </Row>
            </div>
        </>
    )
}

export default withRouter(MoveProcessList)
