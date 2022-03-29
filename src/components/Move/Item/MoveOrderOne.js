import React, { useState, useEffect, useLayoutEffect , useMemo } from 'react'
import CustomBreadcrumb from '/src/utils/CustomBreadcrumb'
import queryStirng from 'query-string'
import { withRouter } from 'react-router-dom'
import moment from 'moment'
import { Row, Col, Input, Typography, DatePicker, Select, Spin, Button } from 'antd'
import * as ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import { AgGridReact } from 'ag-grid-react'
import Https from '../../../api/http'
import * as GridKeyValue from '../../../utils/GridKeyValue'
import * as Helpers from '../../../utils/Helpers'
import * as Constans from '../../../utils/Constans'
import * as Common from '../../../utils/Common.js'
import * as SignatureImage from '../../../img/signature.png'
import axios from 'axios'

import '/src/style/custom.css'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-alpine.css'

const { Text } = Typography
const { Option } = Select

const MoveOrderOne = props => {
    const { userId } = props

    let params = queryStirng.parse(props.params)

    console.log('params : ' + JSON.stringify(params))

    console.log('유저 ID : ' + userId)

    const [gridApi, setGridApi] = useState(null)
    const [gridColumnApi, setGridColumnApi] = useState(null)
    const [storageList, setStorageList] = useState([])

    // API 호출 get state
    const [getData, setGetData] = useState({
        moveIndDt: moment(params.moveIndDt),
        oStorageId: params.oStorageId,
        storageId: params.storageId,
        shipId: params.shipId,
        moveIndGb: params.moveIndGb,
        purchaseNo: '',
        userId: userId
    })

    //화면에 노출되는 state
    const [state, setState] = useState({
        rowData: []
    })

    const columnDefs = () => {
        return [
            {
                field: 'shipKey',
                headerName: '이동지시번호',
                editable: false,
                suppressMenu: true
            },
            { field: 'orderKey', headerName: '주문번호', editable: false, suppressMenu: true },
            {
                field: 'deliMethod',
                headerName: '배송방법',
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
            { field: 'qty', headerName: '수량', editable: false, suppressMenu: true },
            { field: 'cost', headerName: '금액', editable: false, suppressMenu: true }
        ]
    }

    // 화면 그려지기 전에 호출
    useLayoutEffect(() => {
        window.addEventListener('resize', () => props.setHeight());
        props.setHeight();
        setInit()
    }, [])

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
            props.setSpin(false)
        } finally {
            setView()
        }
    }

    // agGrid API 호출
    const onGridReady = params => {
        setGridApi(params.api)
        setGridColumnApi(params.columnApi)
    }

    // 체크박스 또는 클릭으로 선택시
    const onSelectionChanged = () => {
        var selectedRows = gridApi.getSelectedRows()
        setGetData({
            ...getData,
            deposits: [...selectedRows]
        })
    }

    // 조건에 따라 내역 조회
    const setView = async () => {
        try {
            let res = await Https.getMoveOrderOne(getData)

            console.log('---------------------------------------------------')
            console.log(JSON.stringify(res))

            setState({
                ...state,
                height: window.innerHeight - (document.querySelector('header') != undefined ? document.querySelector('header').clientHeight : 0) - (document.querySelector('footer') != undefined ? document.querySelector('footer').clientHeight : 0) - document.querySelector('.notice-condition').clientHeight - 100,
                rowData: res.data.data.moves
            })

            setGetData({
                ...getData,
                purchaseNo: res.data.data.purchaseNo
            })
        } catch (error) {
            console.error(error)
        } finally {
            props.setSpin(false)
        }
    }

    // 컬럼 리사이즈
    const onFirstDataRendered = params => {
        var allColumnIds = []
        params.columnApi.getAllColumns().forEach(function(column) {
            allColumnIds.push(column.colId)
        })

        params.columnApi.autoSizeColumns(allColumnIds, false)
    }

    // CI 출력
    const printCI = async () => {
        let list = state.rowData
        let count = list.length
        let purchaseUnitAmt = 0

        for (let a = 0; a < list.length; a++) {
            purchaseUnitAmt +=
                Number(list[a].cost) * Number(list[a].qty) +
                Number(list[a].cost) * 0.03 * Number(list[a].qty).toFixed(2)
        }

        // 엑셀에 입력되야 하는 내역
        let excelJson = [
            { cellNm: 'E2', value: 'High Home GmbH' },
            { cellNm: 'E3', value: 'Am Kronberger Hang 2' },
            { cellNm: 'E4', value: '65824 Schwalbach Ts.' },
            { cellNm: 'E5', value: 'eMail: buyer@high-home.com' },
            { cellNm: 'B7', value: 'Commercial Invoice' },
            { cellNm: 'E7', value: 'ORIGINAL' },
            { cellNm: 'B9', value: '1)Shipper/Exporter' },
            { cellNm: 'B10', value: 'High Home GmbH' },
            { cellNm: 'B11', value: 'Am Kronberger Hang 2' },
            { cellNm: 'B12', value: '65824 Schwalbach Ts.' },
            { cellNm: 'B13', value: 'eMail: buyer@high-home.com' },
            { cellNm: 'B15', value: '2) Consignee' },
            { cellNm: 'B16', value: 'Company name' },
            { cellNm: 'B17', value: 'Address' },
            { cellNm: 'B18', value: 'City/Postal Code' },
            { cellNm: 'B19', value: 'count + 1ry' },
            { cellNm: 'B20', value: 'Name/Department' },
            { cellNm: 'B21', value: 'TEL.-No' },
            { cellNm: 'B22', value: 'UST no.' },
            { cellNm: 'C16', value: 'CDF BROS INC.' },
            { cellNm: 'C17', value: '604, 151, Teheran-ro, Gangnam-gu' },
            { cellNm: 'C18', value: 'Seoul / 06132' },
            { cellNm: 'C19', value: 'South Korea' },
            { cellNm: 'C20', value: 'JAEHO KWON / SCM' },
            { cellNm: 'C21', value: '(+82) 1668-1097' },
            { cellNm: 'C22', value: '372-81-00393' },
            { cellNm: 'B23', value: '3) Nortify Party' },
            { cellNm: 'B24', value: 'Same as Consignee' },
            { cellNm: 'B26', value: '4)Port of Loading' },
            { cellNm: 'B27', value: 'Frankfurt, Germany' },
            { cellNm: 'C26', value: '5)Final Destination' },
            { cellNm: 'C27', value: 'South Korea' },
            { cellNm: 'B28', value: '6)Carrier' },
            { cellNm: 'B29', value: 'Sea' },
            { cellNm: 'C28', value: '7)Sailing on or about' },
            { cellNm: 'C29', value: 'Immediately' },
            { cellNm: 'D9', value: '8)No. & date of Invoice' },
            { cellNm: 'E10', value: 'CI-' + getData.shipId },
            { cellNm: 'G11', value: moment(getData.moveIndDt).format('DD.MM.YYYY') },
            { cellNm: 'D12', value: '9)No. & date of P/O' },
            // { cellNm: 'E13', value: 'PO-' + getData.purchaseNo },
            // { cellNm: 'G14', value: moment(getData.purchaseDt).format('DD.MM.YYYY') },
            { cellNm: 'D15', value: '10)L/C issuing bank' },
            // { cellNm: 'E16', value: 'DDDD' },
            // { cellNm: 'F17', value: 'DD.MM.JJJJ' },
            { cellNm: 'D18', value: '11)Remarks' },
            { cellNm: 'D19', value: '* SHIPMENT: ' },
            { cellNm: 'E19', value: 'EXW' },
            { cellNm: 'D20', value: '* PAYMENT TERMS : ' },
            { cellNm: 'E20', value: 'deposit 100%' },
            { cellNm: 'E21', value: 'to receive on order confirmation' },
            { cellNm: 'D22', value: '* PAYMENT INSTRUCTION' },
            { cellNm: 'D23', value: 'PLEASE REMIT DUE AMOUNT,' },
            { cellNm: 'G23', value: Common.fommatMoney(purchaseUnitAmt) + ' €' },
            { cellNm: 'D25', value: 'TO THE FOLLOWING ACcount + 1 NO.' },
            { cellNm: 'D26', value: 'Beneficiary Name :' },
            { cellNm: 'D27', value: 'Beneficiary Bank : ' },
            { cellNm: 'D28', value: 'IBAN: ' },
            { cellNm: 'D29', value: 'Swift code : ' },
            { cellNm: 'E26', value: 'High Home GmbH ' },
            { cellNm: 'E27', value: 'SOLARIS BANK AG' },
            { cellNm: 'E28', value: 'DE25 1101 0101 5279 0706 19' },
            { cellNm: 'E29', value: 'SOBKDEB2XXX' },
            { cellNm: 'B30', value: '12)Description of Goods' },
            { cellNm: 'D30', value: '13) Quantity' },
            { cellNm: 'E30', value: '14) Unit Price' },
            { cellNm: 'F30', value: '15) Commission' },
            { cellNm: 'G30', value: '16) Amount' },
            { cellNm: 'B31', value: 'Order No.' },
            { cellNm: 'B32', value: Common.trim(state.piNo) },
            { cellNm: 'C' + Common.getCellNum(31, count + 1), value: 'TOTAL' },
            { cellNm: 'D' + Common.getCellNum(31, count + 1), value: count + 1 + ' SET' },
            { cellNm: 'E' + Common.getCellNum(31, count + 1), value: 'EXW/Germany' },
            { cellNm: 'G' + Common.getCellNum(31, count + 1), value: Common.fommatMoney(purchaseUnitAmt) + ' €' },
            { cellNm: 'B' + Common.getCellNum(33, count + 1), value: '<Remarks>' },
            { cellNm: 'B' + Common.getCellNum(34, count + 1), value: '* Packing : Total' },
            { cellNm: 'B' + Common.getCellNum(35, count + 1), value: '* Carton Size : ' },
            { cellNm: 'C' + Common.getCellNum(34, count + 1), value: 'xxx cartons' },
            {
                cellNm: 'C' + Common.getCellNum(37, count + 1),
                value: 'VAT(steuerfreie Ausfuhrlieferung / tax free export)'
            },
            { cellNm: 'C' + Common.getCellNum(42, count + 1), value: 'Signed by' },
            { cellNm: 'D' + Common.getCellNum(43, count + 1), value: 'Jae-Ho Kwon Geschäftsführer' },
            {
                cellNm: 'B' + Common.getCellNum(45, count + 1),
                value: 'High Home GmbH - Sitz Schwalbach Amtsgericht - Registergericht – Königstein Main HRB 10970'
            },
            {
                cellNm: 'B' + Common.getCellNum(46, count + 1),
                value: 'Geschäftsführer: Jae-Ho Kwon Geschäftsführerin: Jin-Young Park'
            },
            {
                cellNm: 'B' + Common.getCellNum(47, count + 1),
                value:
                    'Bankverbindung\r\nSOLARIS BANK AG\r\nIBAN: DE25 1101 0101 5279 0706 19\r\nUST ID Nr.DE346035048\r\nEORI Nr.DE367955663057091\r\n'
            }
        ]

        props.setSpin(true)

        const workbook = new ExcelJS.Workbook()
        const worksheet = workbook.addWorksheet('PI') // sheet 이름이 My Sheet

        // 각각의 컬럼 너비 조절
        worksheet.getColumn(1).width = 1.11
        worksheet.getColumn(2).width = 17.89
        worksheet.getColumn(3).width = 23.22
        worksheet.getColumn(4).width = 15.56
        worksheet.getColumn(5).width = 12.33
        worksheet.getColumn(6).width = 10.89
        worksheet.getColumn(7).width = 10.89

        worksheet.getRow(Common.getCellNum(47, count + 1)).height = 78

        worksheet.getRow('B' + Common.getCellNum(45, count + 1)).height = 20

        // 셀병합이 필요한 셀 병합
        // 셀병합 데이터
        let mergeCellArray = [
            'E2:F2',
            'E3:F3',
            'E4:F4',
            'E5:F5',
            'B7:D7',
            'E7:F7',
            'E10:F10',
            'E13:F13',
            'E19:G19',
            'E20:G20',
            'E21:G21',
            'E27:G27',
            'E28:G28',
            'E29:G29',
            'B30:C30',

            'D' + Common.getCellNum(43, count + 1) + ':' + 'E' + Common.getCellNum(43, count + 1),
            'B' + Common.getCellNum(45, count + 1) + ':' + 'G' + Common.getCellNum(45, count + 1),
            'B' + Common.getCellNum(46, count + 1) + ':' + 'G' + Common.getCellNum(46, count + 1),
            'B' + Common.getCellNum(47, count + 1) + ':' + 'G' + Common.getCellNum(47, count + 1),
            'C' + Common.getCellNum(37, count + 1) + ':' + 'E' + Common.getCellNum(37, count + 1)
        ]

        // border 설정을 위해 Json 합쳐 주는 함수
        Common.setProps(worksheet, 'E7', 'border', {
            top: { style: 'thick' },
            bottom: { style: 'thick' },
            right: { style: 'thick' },
            left: { style: 'thick' },
            color: { argb: 'D8DBDD' }
        })

        Common.setProps(
            worksheet,
            [
                'B9:G9',
                'B30:G30',
                'B' + Common.getCellNum(45, count + 1) + ':' + 'F' + Common.getCellNum(45, count + 1),
                'D' + Common.getCellNum(43, count + 1)
            ],
            'border',
            { top: { style: 'thick' } }
        )
        Common.setProps(
            worksheet,
            ['B15:C15', 'B23:C23', 'B26:C26', 'B28:C28', 'D12:G12', 'D15:G15', 'D18:G18', 'B31:G31'],
            'border',
            { top: { style: 'thin' } }
        )
        Common.setProps(
            worksheet,
            [
                'B' + Common.getCellNum(31, count + 1) + ':' + 'G' + Common.getCellNum(31, count + 1),
                'B' + Common.getCellNum(32, count + 1) + ':' + 'G' + Common.getCellNum(32, count + 1)
            ],
            'border',
            { top: { style: 'double' } }
        )
        Common.setProps(worksheet, 'B9:' + 'B' + Common.getCellNum(47, count + 1), 'border', {
            left: { style: 'thick' }
        })
        Common.setProps(worksheet, ['D9:D30', 'C26:C29', ['D30', 'E30', 'F30']], 'border', { left: { style: 'thin' } })
        Common.setProps(
            worksheet,
            [
                'G9:' + 'G' + Common.getCellNum(47, count + 1),
                'E27:E29',
                'E21',
                'E19:E20',
                'B' + Common.getCellNum(45, count + 1) + ':' + 'B' + Common.getCellNum(47, count + 1)
            ],
            'border',
            { right: { style: 'thick' } }
        )
        Common.setProps(worksheet, 'B' + Common.getCellNum(47, count + 1), 'border', { bottom: { style: 'thick' } })

        // 폰트 관련
        Common.setProps(worksheet, 'E2', 'font', { name: 'Montserrat', size: 12 })
        Common.setProps(worksheet, 'E7', 'font', { name: 'Montserrat', size: 14, color: { argb: 'FD2204' } })
        Common.setProps(worksheet, ['E3:E5'], 'font', { name: 'Montserrat', size: 9 })
        Common.setProps(worksheet, 'B7', 'font', {
            name: 'Montserrat',
            size: 16,
            bold: true,
            color: { argb: 'FF0000FF' }
        })
        Common.setProps(
            worksheet,
            ['B9', 'D9', 'B15', 'D12', 'D15', 'D18', 'B23', 'B26', 'C26', 'B28', 'C28', 'B30', 'D30:G30', 'E19'],
            'font',
            { name: 'Montserrat', size: 7.5, bold: true, color: { argb: 'FF333399' } }
        )
        Common.setProps(
            worksheet,
            [
                'D19:D23',
                'D26:D29',
                'B44',
                'B' + Common.getCellNum(45, count + 1) + ':' + 'B' + Common.getCellNum(47, count + 1)
            ],
            'font',
            {
                name: 'Montserrat',
                size: 10
            }
        )
        Common.setProps(worksheet, ['E26:E29'], 'font', {
            name: 'Montserrat',
            size: 10,
            bold: true,
            color: { argb: 'FF333399' }
        })
        Common.setProps(
            worksheet,
            ['C' + Common.getCellNum(42, count + 1), 'D' + Common.getCellNum(43, count + 1)],
            'font',
            {
                name: 'Montserrat',
                size: 11,
                bold: true,
                color: { argb: 'FF333399' }
            }
        )
        Common.setProps(
            worksheet,
            [
                'C' + Common.getCellNum(31, count + 1) + ':' + 'F' + Common.getCellNum(31, count + 1),
                'C' + +Common.getCellNum(37, count + 1)
            ],
            'font',
            {
                name: 'Montserrat',
                size: 11,
                bold: true
            }
        )

        Common.setProps(
            worksheet,
            [
                'D19:D23',
                'D26:D29',
                'B' + Common.getCellNum(33, count + 1),
                'B' + Common.getCellNum(45, count + 1) + ':' + 'B' + Common.getCellNum(47, count + 1)
            ],
            'font',
            { name: 'Montserrat', size: 10 }
        )

        Common.setProps(worksheet, 'B10', 'font', { name: 'Arial', size: 10, bold: true })

        Common.setProps(worksheet, ['B11:B13', 'B16:B22', 'B24', 'B27', 'B29:C29', 'E20', 'E21', 'F23'], 'font', {
            name: 'Arial',
            size: 10
        })

        Common.setProps(worksheet, 'C27', 'font', { name: '맑은고딕', size: 10 })

        Common.setProps(worksheet, ['C16:C22', 'E10', 'F11', 'E13', 'F14', 'E16', 'F17', 'F11'], 'font', {
            name: 'Tahoma',
            size: 10
        })

        // BACKGROUND 처리
        Common.setProps(
            worksheet,
            [
                'C16:C22',
                'B27:C27',
                'B29:C29',
                'C' + Common.getCellNum(34, count + 1) + ':' + 'C' + Common.getCellNum(36, count + 1),
                ['E10', 'E13', 'G11', 'G14', 'G23']
            ],
            'fill',
            { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC5D9F1' } }
        )

        if (count + 1 != 0) {
            Common.setProps(worksheet, 'B31:G' + Common.getCellNum(30, count + 1), 'fill', {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFC5D9F1' }
            })
        }

        // 정렬
        Common.setProps(
            worksheet,
            [
                'E2:E6',
                'B7',
                'E7:F7',
                'B24',
                'B27:C27',
                'B29:C29',
                'B30',
                'E10',
                'F11',
                'E13',
                'F14',
                'E16',
                'F17',
                'E19:E21',
                'F23',
                'C' + Common.getCellNum(31, count + 1) + ':' + 'D' + Common.getCellNum(31, count + 1),
                'B' + Common.getCellNum(46, count + 1),
                'D' + Common.getCellNum(43, count + 1),
                'C' + Common.getCellNum(37, count + 1)
            ],
            'alignment',
            { vertical: 'middle', horizontal: 'center' }
        )

        Common.setProps(worksheet, 'C' + Common.getCellNum(42, count + 1), 'alignment', {
            vertical: 'middle',
            horizontal: 'right'
        })
        Common.setProps(worksheet, 'B' + Common.getCellNum(45, count + 1), 'alignment', {
            vertical: 'bottom',
            horizontal: 'center'
        })
        Common.setProps(worksheet, 'B' + Common.getCellNum(47, count + 1), 'alignment', { wrapText: true })

        let purchases = []

        for (let a = 0; a < list.length; a++) {
            purchases.push({
                cellNm: 'B' + String(32 + Number(a)),
                value: list[a].assortNm + ' / ' + list[a].optionNm1 + ' / ' + list[a].optionNm2
            })
            purchases.push({ cellNm: 'D' + String(32 + Number(a)), value: Common.fommatMoney(list[a].qty) + ' PCS' })
            purchases.push({ cellNm: 'E' + String(32 + Number(a)), value: Common.fommatMoney(list[a].cost) + ' €' })
            purchases.push({
                cellNm: 'F' + String(32 + Number(a)),
                value: Common.fommatMoney(String((Number(list[a].cost) * 0.03 * Number(list[a].qty)).toFixed(2))) + ' €'
            })
            purchases.push({
                cellNm: 'G' + String(32 + Number(a)),
                value:
                    Common.fommatMoney(
                        String(
                            Number(list[a].cost) * Number(list[a].qty) +
                                Number(list[a].cost) * 0.03 * Number(list[a].qty).toFixed(2)
                        )
                    ) + ' €'
            })
        }

        const imageBuffer = await axios.get(SignatureImage.default, { responseType: 'arraybuffer' })

        // 서명 이미지
        const signImage = workbook.addImage({
            buffer: imageBuffer.data,
            extension: 'png'
        })

        worksheet.addImage(signImage, {
            tl: { col: 3.3, row: Number(Common.getCellNum(39, count + 1)) + 0.3 },
            br: { col: 4.8, row: Number(Common.getCellNum(41, count + 1)) + 0.8 }
        })

        excelJson = excelJson.concat(purchases)

        for (let i = 0; i < mergeCellArray.length; i++) {
            worksheet.mergeCells(mergeCellArray[i])
        }

        Common.setJsonValues(worksheet, excelJson)

        const mimeType = {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }

        const buffer = await workbook.xlsx.writeBuffer()
        const blob = new Blob([buffer], mimeType)
        saveAs(blob, 'CI 견적서.xlsx')

        props.setSpin(false)
    }

    // PL 출력
    const printPL = async () => {
        let list = state.rowData
        let listCount = list.length
        let count = 0
        let totalweight = 0

        for (let a = 0; a < list.length; a++) {
            totalweight += Number(list[a].weight)
            count += Number(list[a].qty)
        }

        // 엑셀에 입력되야 하는 내역
        let excelJson = [
            { cellNm: 'E2', value: 'High Home GmbH' },
            { cellNm: 'E3', value: 'Am Kronberger Hang 2' },
            { cellNm: 'E4', value: '65824 Schwalbach Ts.' },
            { cellNm: 'E5', value: 'eMail: buyer@high-home.com' },
            { cellNm: 'B7', value: 'Packing List' },
            { cellNm: 'E7', value: 'ORIGINAL' },
            { cellNm: 'B9', value: '1)Shipper/Exporter' },
            { cellNm: 'B10', value: 'High Home GmbH' },
            { cellNm: 'B11', value: 'Am Kronberger Hang 2' },
            { cellNm: 'B12', value: '65824 Schwalbach Ts.' },
            { cellNm: 'B13', value: 'eMail: buyer@high-home.com' },
            { cellNm: 'B15', value: '2) Consignee' },
            { cellNm: 'B16', value: 'Company name' },
            { cellNm: 'B17', value: 'Address' },
            { cellNm: 'B18', value: 'City/Postal Code' },
            { cellNm: 'B19', value: 'Country' },
            { cellNm: 'B20', value: 'Name/Department' },
            { cellNm: 'B21', value: 'TEL.-No' },
            { cellNm: 'B22', value: 'UST no.' },
            { cellNm: 'C16', value: 'CDF BROS INC.' },
            { cellNm: 'C17', value: '604, 151, Teheran-ro, Gangnam-gu' },
            { cellNm: 'C18', value: 'Seoul / 06132' },
            { cellNm: 'C19', value: 'South Korea' },
            { cellNm: 'C20', value: 'JAEHO KWON / SCM' },
            { cellNm: 'C21', value: '(+82) 1668-1097' },
            { cellNm: 'C22', value: '372-81-00393' },
            { cellNm: 'B23', value: '3) Nortify Party' },
            { cellNm: 'B24', value: 'Same as Consignee' },
            { cellNm: 'B26', value: '4)Port of Loading' },
            { cellNm: 'B27', value: 'Frankfurt, Germany' },
            { cellNm: 'C26', value: '5)Final Destination' },
            { cellNm: 'C27', value: 'South Korea' },
            { cellNm: 'B28', value: '6)Carrier' },
            { cellNm: 'B29', value: 'Sea' },
            { cellNm: 'C28', value: '7)Sailing on or about' },
            { cellNm: 'C29', value: 'Immediately' },
            { cellNm: 'D9', value: '8)No. & date of Invoice' },
            { cellNm: 'E10', value: 'CI-' + getData.shipId },
            { cellNm: 'F11', value: moment(getData.moveIndDt).format('DD.MM.YYYY') },
            { cellNm: 'D12', value: '9)No. & date of P/O' },
            // { cellNm: 'E13', value: 'PO-' + getData.purchaseNo },
            // { cellNm: 'F14', value: moment(getData.purchaseDt).format('DD.MM.YYYY') },
            { cellNm: 'D15', value: '10)L/C issuing bank' },
            // { cellNm: 'E16', value: 'DDDD' },
            // { cellNm: 'F17', value: 'DD.MM.JJJJ' },
            { cellNm: 'D18', value: '11)Remarks' },
            { cellNm: 'E19', value: '* HS CODE ' },
            { cellNm: 'F19', value: 'XXXX' },
            { cellNm: 'E20', value: '* HS CODE ' },
            { cellNm: 'F20', value: 'XXXX' },
            { cellNm: 'E21', value: '* Condition ' },
            { cellNm: 'F21', value: 'EXW/Germany' },
            { cellNm: 'E22', value: '* Shipping Mark ' },
            { cellNm: 'F22', value: 'XXXX' },
            { cellNm: 'E23', value: '* Weight' },
            { cellNm: 'F23', value: Common.fommatMoney(totalweight) },

            { cellNm: 'B30', value: '12) No.' },
            { cellNm: 'C30', value: '13) Description of Goods' },
            { cellNm: 'D30', value: '14) Quantity' },
            { cellNm: 'E30', value: '15) Net Weight (Kg)' },
            { cellNm: 'F30', value: '16) Gross Weight (Kg)' },

            { cellNm: 'C' + Common.getCellNum(31, listCount), value: 'TOTAL' },
            { cellNm: 'D' + Common.getCellNum(31, listCount), value: count + ' PCS' },
            { cellNm: 'F' + Common.getCellNum(31, listCount), value: Common.fommatMoney(totalweight) },
            { cellNm: 'B' + Common.getCellNum(33, listCount), value: '<Remarks>' },
            { cellNm: 'B' + Common.getCellNum(34, listCount), value: '* Repair' },
            { cellNm: 'B' + Common.getCellNum(35, listCount), value: '* Packing : ' },
            { cellNm: 'B' + Common.getCellNum(36, listCount), value: '* Carton Size : ' },
            { cellNm: 'C' + Common.getCellNum(36, listCount), value: 'XXXX' },
            { cellNm: 'C' + Common.getCellNum(42, listCount), value: 'Signed by' },
            { cellNm: 'D' + Common.getCellNum(43, listCount), value: 'Jae-Ho Kwon Geschäftsführer' },
            {
                cellNm: 'B' + Common.getCellNum(45, listCount),
                value: 'High Home GmbH - Sitz Schwalbach Amtsgericht - Registergericht – Königstein Main HRB 10970'
            },
            {
                cellNm: 'B' + Common.getCellNum(46, listCount),
                value: 'Geschäftsführer: Jae-Ho Kwon Geschäftsführerin: Jin-Young Park'
            },
            {
                cellNm: 'B' + Common.getCellNum(47, listCount),
                value:
                    'Bankverbindung\r\nSOLARIS BANK AG\r\nIBAN: DE25 1101 0101 5279 0706 19\r\nUST ID Nr.DE346035048\r\nEORI Nr.DE367955663057091\r\n'
            }
        ]

        props.setSpin(true)

        const workbook = new ExcelJS.Workbook()
        const worksheet = workbook.addWorksheet('PI') // sheet 이름이 My Sheet

        // 각각의 컬럼 너비 조절
        worksheet.getColumn(1).width = 1.11
        worksheet.getColumn(2).width = 14.11
        worksheet.getColumn(3).width = 30.5
        worksheet.getColumn(4).width = 8.33
        worksheet.getColumn(5).width = 13.33
        worksheet.getColumn(6).width = 14.89

        worksheet.getRow(Common.getCellNum(47, listCount)).height = 78

        worksheet.getRow('B' + Common.getCellNum(45, listCount)).height = 20

        // 셀병합이 필요한 셀 병합
        // 셀병합 데이터
        let mergeCellArray = [
            'E2:F2',
            'E3:F3',
            'E4:F4',
            'E5:F5',
            'B7:D7',
            'E7:F7',

            'D' + Common.getCellNum(43, listCount) + ':' + 'E' + Common.getCellNum(43, listCount),
            'B' + Common.getCellNum(45, listCount) + ':' + 'F' + Common.getCellNum(45, listCount),
            'B' + Common.getCellNum(46, listCount) + ':' + 'F' + Common.getCellNum(46, listCount),
            'B' + Common.getCellNum(47, listCount) + ':' + 'F' + Common.getCellNum(47, listCount),
            'C' + Common.getCellNum(37, listCount) + ':' + 'E' + Common.getCellNum(37, listCount)
        ]

        // border 설정을 위해 Json 합쳐 주는 함수
        Common.setProps(worksheet, 'E7', 'border', {
            top: { style: 'thick' },
            bottom: { style: 'thick' },
            right: { style: 'thick' },
            left: { style: 'thick' },
            color: { argb: 'D8DBDD' }
        })

        Common.setProps(
            worksheet,
            [
                'B9:F9',
                'B30:F30',
                'B' + Common.getCellNum(45, listCount) + ':' + 'F' + Common.getCellNum(45, listCount),
                'D' + Common.getCellNum(43, listCount)
            ],
            'border',
            { top: { style: 'thick' } }
        )
        Common.setProps(
            worksheet,
            ['B15:C15', 'B23:C23', 'B26:C26', 'B28:C28', 'D12:F12', 'D15:F15', 'D18:F18', 'B31:F31'],
            'border',
            { top: { style: 'thin' } }
        )
        Common.setProps(
            worksheet,
            [
                'B' + Common.getCellNum(31, listCount) + ':' + 'F' + Common.getCellNum(31, listCount),
                'B' + Common.getCellNum(32, listCount) + ':' + 'F' + Common.getCellNum(32, listCount)
            ],
            'border',
            { top: { style: 'double' } }
        )
        Common.setProps(worksheet, 'B9:' + 'B' + Common.getCellNum(47, listCount), 'border', {
            left: { style: 'thick' }
        })
        Common.setProps(worksheet, ['D9:D30', 'C26:C29', ['D30', 'E30', 'F30']], 'border', { left: { style: 'thin' } })
        Common.setProps(
            worksheet,
            [
                'F9:' + 'F' + Common.getCellNum(47, listCount),
                'B' + Common.getCellNum(45, listCount) + ':' + 'B' + Common.getCellNum(47, listCount)
            ],
            'border',
            { right: { style: 'thick' } }
        )
        Common.setProps(worksheet, 'B' + Common.getCellNum(47, listCount), 'border', { bottom: { style: 'thick' } })

        // 폰트 관련
        Common.setProps(worksheet, 'E2', 'font', { name: 'Montserrat', size: 12 })
        Common.setProps(worksheet, 'E7', 'font', { name: 'Montserrat', size: 14, color: { argb: 'FD2204' } })
        Common.setProps(worksheet, ['E3:E5'], 'font', { name: 'Montserrat', size: 9 })
        Common.setProps(worksheet, 'B7', 'font', {
            name: 'Montserrat',
            size: 16,
            bold: true,
            color: { argb: 'FF0000FF' }
        })
        Common.setProps(
            worksheet,
            ['B9', 'D9', 'B15', 'D12', 'D15', 'D18', 'B23', 'B26', 'C26', 'B28', 'C28', 'B30', 'D30:F30'],
            'font',
            { name: 'Montserrat', size: 7.5, bold: true, color: { argb: 'FF333399' } }
        )
        Common.setProps(
            worksheet,
            [
                'D19:D23',
                'D26:D29',
                'B44',
                'B' + Common.getCellNum(45, listCount) + ':' + 'B' + Common.getCellNum(47, listCount)
            ],
            'font',
            {
                name: 'Montserrat',
                size: 10
            }
        )
        Common.setProps(
            worksheet,
            ['E26:E29', 'B' + Common.getCellNum(33, listCount) + ':' + 'B' + Common.getCellNum(36, listCount)],
            'font',
            {
                name: 'Montserrat',
                size: 10,
                bold: true,
                color: { argb: 'FF333399' }
            }
        )
        Common.setProps(
            worksheet,
            ['C' + Common.getCellNum(42, listCount), 'D' + Common.getCellNum(43, listCount)],
            'font',
            {
                name: 'Montserrat',
                size: 11,
                bold: true,
                color: { argb: 'FF333399' }
            }
        )
        Common.setProps(
            worksheet,
            [
                'C' + Common.getCellNum(31, listCount) + ':' + 'F' + Common.getCellNum(31, listCount),
                'C' + +Common.getCellNum(37, listCount)
            ],
            'font',
            {
                name: 'Montserrat',
                size: 11,
                bold: true
            }
        )

        Common.setProps(
            worksheet,
            [
                'D19:D23',
                'D26:D29',
                'B' + Common.getCellNum(45, listCount) + ':' + 'B' + Common.getCellNum(47, listCount)
            ],
            'font',
            { name: 'Montserrat', size: 10 }
        )

        Common.setProps(worksheet, 'B10', 'font', { name: 'Arial', size: 10, bold: true })

        Common.setProps(worksheet, ['B11:B13', 'B16:B22', 'B24', 'B27', 'B29:C29', 'E20', 'E21', 'F23'], 'font', {
            name: 'Arial',
            size: 10
        })

        Common.setProps(worksheet, 'C27', 'font', { name: '맑은고딕', size: 10 })

        Common.setProps(worksheet, ['C16:C22', 'E10', 'F11', 'E13', 'F14', 'E16', 'F17', 'F11', 'E19:F23'], 'font', {
            name: 'Tahoma',
            size: 10
        })

        // BACKGROUND 처리
        Common.setProps(
            worksheet,
            [
                'F19:F23',
                'C' + Common.getCellNum(35, listCount) + ':' + 'C' + Common.getCellNum(36, listCount),
                ['E10', 'E13', 'F11', 'F14', 'B29']
            ],
            'fill',
            { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC5D9F1' } }
        )

        if (count != 0) {
            Common.setProps(worksheet, 'B31:F' + Common.getCellNum(30, listCount), 'fill', {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFC5D9F1' }
            })
        }

        // 정렬
        Common.setProps(
            worksheet,
            [
                'E2:E6',
                'B7',
                'E7:F7',
                'B24',
                'B27:C27',
                'B29:C29',
                'B30',
                'E10',
                'F11',
                'E13',
                'F14',
                'E16',
                'F17',
                'F23',
                'C' + Common.getCellNum(31, listCount) + ':' + 'D' + Common.getCellNum(31, listCount),
                'B' + Common.getCellNum(46, listCount),
                'D' + Common.getCellNum(43, listCount),
                'C' + Common.getCellNum(37, listCount)
            ],
            'alignment',
            { vertical: 'middle', horizontal: 'center' }
        )

        Common.setProps(worksheet, ['C' + Common.getCellNum(42, listCount), 'E19:E23'], 'alignment', {
            vertical: 'middle',
            horizontal: 'right'
        })
        Common.setProps(worksheet, 'B' + Common.getCellNum(45, listCount), 'alignment', {
            vertical: 'bottom',
            horizontal: 'center'
        })
        Common.setProps(worksheet, 'B' + Common.getCellNum(47, listCount), 'alignment', { wrapText: true })

        let purchases = []

        for (let a = 0; a < list.length; a++) {
            purchases.push({
                cellNm: 'B31',
                value: list[a].assortNm + ' / ' + list[a].optionNm1 + ' / ' + list[a].optionNm2
            })
            purchases.push({ cellNm: 'D31', value: Common.fommatMoney(list[a].qty) + ' PCS' })
            purchases.push({ cellNm: 'E31', value: Common.fommatMoney(list[a].weight) })
            purchases.push({
                cellNm: 'F31',
                value: Common.fommatMoney(String(Number(list[a].qty)) * Number(list[a].weight))
            })
        }

        const imageBuffer = await axios.get(SignatureImage.default, { responseType: 'arraybuffer' })

        // 서명 이미지
        const signImage = workbook.addImage({
            buffer: imageBuffer.data,
            extension: 'png'
        })

        worksheet.addImage(signImage, {
            tl: { col: 3.3, row: Number(Common.getCellNum(39, listCount)) + 0.3 },
            br: { col: 4.8, row: Number(Common.getCellNum(41, listCount)) + 0.8 }
        })

        excelJson = excelJson.concat(purchases)

        for (let i = 0; i < mergeCellArray.length; i++) {
            worksheet.mergeCells(mergeCellArray[i])
        }

        Common.setJsonValues(worksheet, excelJson)

        const mimeType = {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }

        const buffer = await workbook.xlsx.writeBuffer()
        const blob = new Blob([buffer], mimeType)
        saveAs(blob, 'PL 견적서.xlsx')

        props.setSpin(false)
    }

    const defaultColDef = useMemo(() => {
        return {
          sortable: true,
          flex: 1, minWidth: 100, resizable: true 
        };
    }, []);

    return (
        <>
            <CustomBreadcrumb style={{ marginBottom: '0px' }} arr={['이동', '이동지시내역']}></CustomBreadcrumb>

            <div className='notice-wrapper'>
                <div className='notice-condition'>
            <Row gutter={[16, 8]}>
                <Col span={24}>
                    <Row type='flex' justify='end' gutter={[16, 16]}>
                        <Col span={2}>
                            <Button type='primary' ghost style={{ width: '100%' }} onClick={printCI}>
                                CI 출력
                            </Button>
                        </Col>
                        <Col span={2}>
                            <Button type='primary' style={{ width: '100%' }} onClick={printPL}>
                                PL 출력
                            </Button>
                        </Col>
                    </Row>
                    <Row gutter={[16, 8]} className='onVerticalCenter marginTop-10'>
                        <Col span={4}>
                            <Text className='font-15 NanumGothic-Regular' strong>
                                이동지시번호
                            </Text>
                        </Col>
                        <Col span={6}>
                            <Input
                                name='shipId'
                                className='fullWidth'
                                defaultValue={getData.shipId != '' ? getData.shipId : ''}
                                disabled
                            />
                        </Col>
                    </Row>
                    <Row gutter={[16, 8]} className='onVerticalCenter marginTop-10'>
                        <Col span={4}>
                            <Text className='font-15 NanumGothic-Regular' strong>
                                출고창고
                            </Text>
                        </Col>
                        <Col span={6}>
                            <Select
                                className='fullWidth'
                                defaultValue={getData.storageId != '' ? getData.storageId : ''}
                                disabled>
                                {storageList.map(item => (
                                    <Option key={item.value}>{item.label}</Option>
                                ))}
                            </Select>
                        </Col>
                    </Row>
                    <Row gutter={[16, 8]} className='onVerticalCenter marginTop-10'>
                        <Col span={4}>
                            <Text className='font-15 NanumGothic-Regular' strong>
                                입고창고
                            </Text>
                        </Col>
                        <Col span={6}>
                            <Select
                                className='fullWidth'
                                defaultValue={getData.oStorageId != '' ? getData.oStorageId : ''}
                                disabled>
                                {storageList.map(item => (
                                    <Option key={item.value}>{item.label}</Option>
                                ))}
                            </Select>
                        </Col>
                    </Row>
                    <Row gutter={[16, 8]} className='onVerticalCenter marginTop-10'>
                        <Col span={4}>
                            <Text className='font-15 NanumGothic-Regular' strong>
                                이동지시일자
                            </Text>
                        </Col>
                        <Col span={6}>
                            <DatePicker
                                name='moveIndDt'
                                className='fullWidth'
                                defaultValue={getData.moveIndDt}
                                disabled
                            />
                        </Col>
                    </Row>
                    <Row gutter={[16, 8]} className='onVerticalCenter marginTop-10'>
                        <Col span={4}>
                            <Text className='font-15 NanumGothic-Regular' strong>
                                이동지시구분
                            </Text>
                        </Col>
                        <Col span={6}>
                            <Select
                                className='fullWidth'
                                defaultValue={getData.moveIndGb != '' ? getData.moveIndGb : ''}
                                disabled>
                                {Constans.MOVEINBGB.map(item => (
                                    <Option key={item.value}>{item.label}</Option>
                                ))}
                            </Select>
                        </Col>
                    </Row>
                </Col>
                {/* <Col span={4}>
                        <Row>
                            <Col span={20}>
                                <Button type='primary' className='fullWidth margin-10'>이동지시취소</Button>
                            </Col>
                        </Row>
                    </Col> */}
            </Row>
</div>
            <Row className='marginTop-10'>
                <div className='ag-theme-alpine' style={{ height: props.height, width: '100%' }}>
                    <AgGridReact defaultColDef={defaultColDef} multiSortKey={'ctrl'}
                        enableCellTextSelection={true}
                        rowData={state.rowData}
                        suppressDragLeaveHidesColumns={true}
                        onSelectionChanged={onSelectionChanged}
                        suppressRowClickSelection={true}
                        onFirstDataRendered={onFirstDataRendered}
                        rowSelection={'single'}
                        columnDefs={columnDefs()}
                        onGridReady={onGridReady}></AgGridReact>
                </div>
            </Row>
            </div>
        </>
    )
}

export default withRouter(MoveOrderOne)
