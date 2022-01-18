import React, { useMemo, useMemouseEffect, useLayoutEffect, useState } from 'react'
import { withRouter } from 'react-router-dom'
import CustomBreadcrumb from '/src/utils/CustomBreadcrumb'
import { Layout, Input, Select, Row, Col, Button, DatePicker, Spin, message, Typography } from 'antd'
import { AgGridReact } from 'ag-grid-react'
import { saveAs } from 'file-saver'
import Https from '../../../api/http'
import GoodsSearchList from '../../Common/Purchase/GoodsSearchList'
import axios from 'axios'

import '/src/style/custom.css'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-alpine.css'
import * as moment from 'moment'
import * as ExcelJS from 'exceljs'
import * as Constans from '../../../utils/Constans'
import * as SignatureImage from '/src/img/signature.png'
import * as LogoImage from '../../../img/logo1.png'
import * as Common from '../../../utils/Common.js'

const { Option } = Select
const { TextArea } = Input
const { Text } = Typography

const Edit = props => {
    const { userId, id } = props

    const [purchaseVendorList, setPurchaseVendorList] = useState([])
    const [storageList, setStorageList] = useState([])
    const [isModalVisible, setIsModalVisible] = useState(false)
    const [gridApi, setGridApi] = useState(null)
    const [gridColumnApi, setGridColumnApi] = useState(null)
    const [state, setState] = useState({
        purchaseId: '',
        purchaseDt: moment().format('YYYY-MM-DD HH:mm:ss'),
        vendorId: '',
        purchaseVendorNm: '',
        storageId: '',
        piNo: '',
        memo: '',
        deliFee: '',
        siteOrderNo: '',
        assortId: '',
        assortNm: '',
        loading: false,
        purchaseStatus: '',
        purchaseGb: '',
        dealtypeCd: '',
        purchaseStatus: '',
        items: [],
        userId: userId
    })

    const columnDefs = () => {
        return [
            {
                headerName: '번호',
                field: 'index',
                headerCheckboxSelection: true,
                headerCheckboxSelectionFilteredOnly: true,
                checkboxSelection: true,
                cellRenderer: param => {
                    let tempHtml = ''

                    tempHtml += '<div>'
                    tempHtml += param.rowIndex + 1
                    tempHtml += '</div>'

                    return tempHtml
                }
            },
            { headerName: '고도몰주문번호', field: 'channelOrderNo' },
            { headerName: '주문자명', field: 'custNm' },
            { headerName: '상품코드', field: 'assortId' },
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
            { headerName: '모델번호', field: 'modelNo' },
            { headerName: '상품명', field: 'assortNm' },
            { headerName: '옵션1', field: 'optionNm1' },
            { headerName: '옵션2', field: 'optionNm2' },
            { headerName: '옵션3', field: 'optionNm3' },
            { headerName: '원산지', field: 'origin' },
            { headerName: '카테고리', field: 'custCategory' },
            { headerName: '재질', field: 'material' },
            { headerName: '발주수량', field: 'purchaseQty' },
            { headerName: 'RRP', field: 'mdRrp' },
            { headerName: '할인율', field: 'discount + 1Rate' },
            {
                headerName: '발주가',
                field: 'purchaseUnitAmt',
                key: 'purchaseUnitAmt',
                editable: true,
                suppressMenu: true,
                cellStyle: { backgroundColor: '#DAF7A6' }
            }
        ]
    }

    // 화면 랜더링 전에 호출
    useLayoutEffect(() => {
        setInit()
    }, [])

    // 화면 초기화
    const setInit = async () => {
        props.setSpin(true)
        try {
            let res = await Https.getStorageList()

            setStorageList(res.data.data.Storages)
        } catch (error) {
            console.error('getPurchaseGoodsInitData error')
            console.error(error)
            props.setSpin(false)
        } finally {
            getVendorList()
        }
    }

    // 구매처 리스트 호출
    const getVendorList = async () => {
        try {
            let res = await Https.getVendorList()
            setPurchaseVendorList(res.data.data.PurchaseVendors) // 구매처 State
        } catch (error) {
            console.error(error)
        } finally {
            setView()
        }
    }

    // 화면에 노출 되는 리스트 가져오기
    const setView = async () => {
        try {
            let res = await Https.getPurchase(id)

            console.log(res)

            setState({
                ...state,
                purchaseId: Common.trim(res.data.data.purchaseId),
                purchaseDt: Common.trim(res.data.data.purchaseDt),
                vendorId: Common.trim(res.data.data.vendorId),
                piNo: Common.trim(res.data.data.piNo),
                memo: Common.trim(res.data.data.memo),
                purchaseVendorNm: Common.trim(res.data.data.purchaseVendorNm),
                storageId: Common.trim(res.data.data.storageId),
                siteOrderNo: Common.trim(res.data.data.siteOrderNo),
                purchaseStatus: Common.trim(res.data.data.purchaseStatus),
                purchaseGb: Common.trim(res.data.data.purchaseGb),
                dealtypeCd: Common.trim(res.data.data.dealtypeCd),
                purchaseStatus: Common.trim(res.data.data.purchaseStatus),
                deliFee: Common.trim(res.data.data.deliFee),
                items: res.data.data.items
            })
        } catch (error) {
            console.error('getPurchase error')
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

    const showGoodsSearchList = () => {
        setIsModalVisible(true)
    }

    // 선택된 상품 삭제
    const deleteRowData = () => {
        const { items } = state
        let rows = gridApi.getSelectedRows()

        let list = items
        console.log(list)
        for (var row in rows) {
            let list1 = list.filter(item => !(item.assortId == rows[row].assortId && item.itemId == rows[row].itemId))
            console.log(list1)
            list = list1
        }

        setState({
            ...state,
            items: list
        })
    }

    // 화면 초기화
    const resetData = () => {
        setState({
            ...state,
            purchaseDt: moment().format('YYYY-MM-DD HH:mm:ss'),
            ownerId: '',
            purchaseVendorNm: '',
            storageId: '',
            terms: '',
            delivery: '',
            payment: '',
            carrier: '',
            siteOrderNo: '',
            assortId: '',
            assortNm: '',
            purchaseGb: '',
            dealtypeCd: '',
            purchaseStatus: '',
            deliFee: '',
            loading: false,
            items: []
        })

        setIsModalVisible(false)
    }

    // 발주 저장하기
    const savePurchase = () => {
        props.setSpin(true)

        const {
            purchaseId,
            vendorId,
            purchaseDt,
            storageId,
            siteOrderNo,
            rowData,
            deliFee,
            purchaseStatus,
            piNo,
            memo,
            purchaseGb,
            userId
        } = state
        const config = { headers: { 'Content-Type': 'application/json' } }

        let tempItems = []

        gridApi.getSelectedRows().map(item => {
            let o = {
                orderId: '',
                orderSeq: '',
                assortId: Common.trim(item.assortId),
                itemId: Common.trim(item.itemId),
                purchaseQty: parseInt(Common.trim(item.purchaseQty)),
                purchaseUnitAmt: parseFloat(Common.trim(item.purchaseUnitAmt)),
                purchaseId: Common.trim(item.purchaseId),
                purchaseSeq: Common.trim(item.purchaseSeq),
                itemGrade: '11'
            }

            tempItems.push(o)
        })

        let purchase = {
            storageId: Common.trim(storageId),
            piNo: Common.trim(piNo),
            memo: Common.trim(memo),
            deliFee: Common.trim(deliFee),
            purchaseGb: Common.trim(purchaseGb),
            vendorId: Common.trim(vendorId),
            siteOrderNo: Common.trim(siteOrderNo),
            purchaseDt: moment(Common.trim(purchaseDt)).format('YYYY-MM-DD HH:mm:ss'),
            purchaseStatus: purchaseStatus != '' ? Common.trim(purchaseStatus) : '01',
            purchaseId: Common.trim(purchaseId),
            items: tempItems,
            userId: Common.trim(userId)
        }

        console.log(purchase)

        return Https.postSavePurchase(purchase, config)
            .then(response => {
                props.setSpin(false)

                message.success('저장 성공')
                console.log(response)
            })
            .catch(error => {
                console.error(error)
                Common.commonNotification({
                    kind: 'error',
                    message: '에러 발생',
                    description: '잠시후 다시 시도해 주세요'
                })
                props.setSpin(false)
            }) // ERROR
    }

    //Input 필드 수정
    const handleChangeInput = e => {
        setState({
            ...state,
            [e.target.name]: e.target.value
        })
    }

    // 구매처 선택
    const handleChangeVendorOption = e => {
        setState({
            ...state,
            vendorId: e
        })
    }

    // 구매처 선택
    const handleChangeStorageOption = e => {
        setState({
            ...state,
            storageId: e
        })
    }

    // 발주 일자 선택
    const handleChangeDate = e => {
        setState({
            ...state,
            purchaseDt: e
        })
    }

    // 발주 상태 변경
    const handleChangePurchaseStatusOption = e => {
        setState({
            ...state,
            purchaseStatus: e
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

    // 해당 내역 인쇄
    const printInvoice = async () => {
        let params = {}

        params.printDt = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
        params.purchaseNo = state.purchaseId

        console.log('Params : ' + JSON.stringify(params))

        const p = new URLSearchParams(params)
        props.setSpin(true)
        return Https.getPrintDt(p)
            .then(async response => {
                console.log(JSON.stringify(response))

                let printDt = response.data.data

                let list = state.items
                let count = list.length
                let purchaseUnitAmt = 0

                for (let a = 0; a < list.length; a++) {
                    purchaseUnitAmt +=
                        Number(list[a].purchaseUnitAmt) * Number(list[a].purchaseQty) +
                        Number(list[a].purchaseUnitAmt) * 0.03 * Number(list[a].purchaseQty).toFixed(2)
                }

                // 엑셀에 입력되야 하는 내역
                let excelJson = [
                    { cellNm: 'E2', value: 'High Home GmbH' },
                    { cellNm: 'E3', value: 'Am Kronberger Hang 2' },
                    { cellNm: 'E4', value: '65824 Schwalbach Ts.' },
                    { cellNm: 'E5', value: 'eMail: buyer@high-home.com' },
                    { cellNm: 'B7', value: 'PROFORMA INVOICE' },
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
                    { cellNm: 'E10', value: 'PI-' + state.purchaseId },
                    { cellNm: 'G11', value: moment(printDt).format('DD.MM.YYYY') },
                    { cellNm: 'D12', value: '9)No. & date of P/O' },
                    { cellNm: 'E13', value: 'PO-' + state.purchaseId },
                    { cellNm: 'G14', value: moment(state.purchaseDt).format('DD.MM.YYYY') },
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
                    { cellNm: 'G23', value: Common.fommatMoney(purchaseUnitAmt.toFixed(2)) + ' €' },
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
                    {
                        cellNm: 'G' + Common.getCellNum(31, count + 1),
                        value: Common.fommatMoney(purchaseUnitAmt.toFixed(2)) + ' €'
                    },
                    { cellNm: 'B' + Common.getCellNum(33, count + 1), value: '<Remarks>' },
                    { cellNm: 'C' + Common.getCellNum(42, count + 1), value: 'Signed by' },
                    { cellNm: 'D' + Common.getCellNum(43, count + 1), value: 'Jae-Ho Kwon Geschäftsführer' },
                    {
                        cellNm: 'B' + Common.getCellNum(45, count + 1),
                        value:
                            'High Home GmbH - Sitz Schwalbach Amtsgericht - Registergericht – Königstein Main HRB 10970'
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
                    'B' + Common.getCellNum(47, count + 1) + ':' + 'G' + Common.getCellNum(47, count + 1)
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
                Common.setProps(worksheet, ['D9:D30', 'C26:C29', ['D30', 'E30', 'F30']], 'border', {
                    left: { style: 'thin' }
                })
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
                Common.setProps(worksheet, 'B' + Common.getCellNum(47, count + 1), 'border', {
                    bottom: { style: 'thick' }
                })

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
                    [
                        'B9',
                        'D9',
                        'B15',
                        'D12',
                        'D15',
                        'D18',
                        'B23',
                        'B26',
                        'C26',
                        'B28',
                        'C28',
                        'B30',
                        'D30:G30',
                        'E19'
                    ],
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
                    ['C' + Common.getCellNum(31, count + 1) + ':' + 'F' + Common.getCellNum(31, count + 1)],
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

                Common.setProps(
                    worksheet,
                    ['B11:B13', 'B16:B22', 'B24', 'B27', 'B29:C29', 'E20', 'E21', 'F23'],
                    'font',
                    {
                        name: 'Arial',
                        size: 10
                    }
                )

                Common.setProps(worksheet, 'C27', 'font', { name: '맑은고딕', size: 10 })

                Common.setProps(worksheet, ['C16:C22', 'E10', 'F11', 'E13', 'F14', 'E16', 'F17', 'F11'], 'font', {
                    name: 'Tahoma',
                    size: 10
                })

                // BACKGROUND 처리
                Common.setProps(
                    worksheet,
                    ['C16:C22', 'B27:C27', 'B29:C29', ['E10', 'E13', 'G11', 'G14', 'G23']],
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
                        'D' + Common.getCellNum(43, count + 1)
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
                    purchases.push({
                        cellNm: 'D' + String(32 + Number(a)),
                        value: Common.fommatMoney(list[a].purchaseQty) + ' PCS'
                    })
                    purchases.push({
                        cellNm: 'E' + String(32 + Number(a)),
                        value: Common.fommatMoney(list[a].purchaseUnitAmt) + ' €'
                    })
                    purchases.push({
                        cellNm: 'F' + String(32 + Number(a)),
                        value:
                            Common.fommatMoney(
                                String(
                                    (Number(list[a].purchaseUnitAmt) * 0.03 * Number(list[a].purchaseQty)).toFixed(2)
                                )
                            ) + ' €'
                    })
                    purchases.push({
                        cellNm: 'G' + String(32 + Number(a)),
                        value:
                            Common.fommatMoney(
                                String(
                                    (
                                        Number(list[a].purchaseUnitAmt) * Number(list[a].purchaseQty) +
                                        Number(list[a].purchaseUnitAmt) * 0.03 * Number(list[a].purchaseQty)
                                    ).toFixed(2)
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
                saveAs(blob, 'PI 견적서.xlsx')

                props.setSpin(false)
            })
            .catch(error => {
                console.error(error)
                Common.commonNotification({
                    kind: 'error',
                    message: '에러 발생',
                    description: '잠시후 다시 시도해 주세요'
                })
                props.setSpin(false)
            }) // ERROR
    }

    const printPOCDFInvoice = async () => {
        let list = state.items
        let count = list.length + 1
        let vendorNm = ''
        let totalAmount = 0
        let totalPrice = 0

        purchaseVendorList.forEach(row => {
            if (row.value == state.vendorId) {
                vendorNm = row.label
            }
        })
        if (list.length > 0) {
            list.forEach(row1 => {
                totalAmount += row1.purchaseQty
                totalPrice += row1.purchaseQty * row1.mdRrp * (1 - row1.buySupplyDiscount / 100)
            })
        }

        // 엑셀에 입력되야 하는 내역
        let excelJson = [
            {
                cellNm: 'A4',
                value:
                    '151, Teheran-ro, Gangnam-gu, Seoul,\r\nRepublic of Korea Zip Code : 06132\r\nE-mail : ryanyoon@trdst.com\r\nTel : (+82) 10 9533 6306'
            },
            { cellNm: 'E2', value: 'Order Date.' },
            { cellNm: 'F2', value: Common.trim(state.purchaseDt) },
            { cellNm: 'H2', value: 'Company' },
            { cellNm: 'I2', value: Common.trim(vendorNm) },
            { cellNm: 'E3', value: 'Order No.' },
            { cellNm: 'F3', value: Common.trim(state.siteOrderNo) },
            { cellNm: 'H3', value: 'Sales Term' },
            { cellNm: 'I3', value: 'EXW' },
            { cellNm: 'E4', value: 'Payment\r\nTerms' },
            { cellNm: 'E6', value: 'Delivery' },
            { cellNm: 'E7', value: 'Carrier' },
            { cellNm: 'F4', value: '50% DEPOSIT AGAINST ORDER CONFIRMATION\r\n& 50% BALANCE BEFORE SHIPMENT' },
            { cellNm: 'F6', value: 'AS SOON AS POSSIBLE' },
            { cellNm: 'F7', value: 'TO BE NOMINATED BEFORE SHIPMENT' },
            { cellNm: 'A8', value: 'PURCHASE ORDER' },
            { cellNm: 'A10', value: 'NO.' },
            { cellNm: 'B10', value: 'Brand' },
            { cellNm: 'C10', value: 'Model No' },
            { cellNm: 'D10', value: 'Description' },
            { cellNm: 'E10', value: 'Color' },
            { cellNm: 'F10', value: 'Qty' },
            { cellNm: 'G10', value: 'RRP' },
            { cellNm: 'H10', value: 'Discount' },
            { cellNm: 'I10', value: 'Total' },
            { cellNm: 'J10', value: 'Name' },
            { cellNm: 'A' + Common.getCellNum(10, count), value: 'Total' },
            {
                cellNm: 'A' + Common.getCellNum(12, count),
                value: '※ PLEASE SPECIFY THE COUNTRY OF ORIGIN PER ITEM ON THE COMMERCIAL INVOICE FOR THE SHIPMENT.'
            },
            { cellNm: 'F' + Common.getCellNum(10, count), value: totalAmount },
            { cellNm: 'I' + Common.getCellNum(10, count), value: '€ ' + Number(totalPrice).toFixed(2) }
        ]

        props.setSpin(true)

        const workbook = new ExcelJS.Workbook()
        const worksheet = workbook.addWorksheet('CDF PO(발주서)') // sheet 이름이 My Sheet

        // 각각의 컬럼 너비 조절
        worksheet.getColumn(1).width = 4
        worksheet.getColumn(2).width = 7.5
        worksheet.getColumn(3).width = 9
        worksheet.getColumn(4).width = 60
        worksheet.getColumn(5).width = 9
        worksheet.getColumn(6).width = 6.5
        worksheet.getColumn(7).width = 6.5
        worksheet.getColumn(8).width = 8
        worksheet.getColumn(9).width = 6.5
        worksheet.getColumn(10).width = 6.5

        // 셀병합이 필요한 셀 병합
        // 셀병합 데이터
        let mergeCellArray = [
            'A4:C7',
            'I2:J2',
            'I3:J3',
            'F2:G2',
            'F3:G3',
            'F4:J5',
            'F6:J6',
            'F7:J7',
            'A8:J9',
            'E4:E5',
            'A' + Common.getCellNum(10, count) + ':E' + Common.getCellNum(10, count)
        ]

        // border 설정을 위해 Json 합쳐 주는 함수
        Common.setProps(
            worksheet,
            [
                'A10:J10',
                'A11:J11',
                'E2:J7',
                'A' + Common.getCellNum(10, count) + ':J' + Common.getCellNum(10, count),
                'A' + Common.getCellNum(11, count) + ':J' + Common.getCellNum(11, count)
            ],
            'border',
            { top: { style: 'thin' } }
        )
        Common.setProps(worksheet, ['E2:J7', 'A10:J10', 'A10:J' + Common.getCellNum(10, count)], 'border', {
            left: { style: 'thin' }
        })
        Common.setProps(worksheet, ['I2:I3', 'F4:F7', 'J10:J' + Common.getCellNum(10, count)], 'border', {
            right: { style: 'thin' }
        })
        Common.setProps(worksheet, ['E7:F7'], 'border', { bottom: { style: 'thin' } })

        // 폰트 관련
        Common.setProps(worksheet, ['A4', 'E2:J7', 'A28', 'A' + Common.getCellNum(12, count)], 'font', {
            name: '맑은 고딕',
            size: 8
        })
        Common.setProps(worksheet, 'A10:J10', 'font', { name: '맑은 고딕', size: 9 })
        Common.setProps(worksheet, 'A8', 'font', { name: '맑은 고딕', size: 20 })
        Common.setProps(worksheet, ['E2:E7', 'H2:H3', 'A10:J10', 'A' + Common.getCellNum(10, count), 'A8'], 'font', {
            bold: true
        })
        Common.setProps(worksheet, 'A' + Common.getCellNum(12, count), 'font', { color: '#FF0000' })

        if (list.length > 0) {
            Common.setProps(worksheet, 'A11:J' + Common.getCellNum(10, count), 'font', { name: '맑은 고딕', size: 8 })
        }

        // BACKGROUND 처리
        Common.setProps(worksheet, 'A11', 'fill', { type: 'pattern', pattern: 'solid', fgColor: { rgba: '#E2EFDA' } })

        // 정렬
        Common.setProps(worksheet, ['F4:J7'], 'alignment', { vertical: 'middle', horizontal: 'left' })
        Common.setProps(worksheet, ['I11:F' + Common.getCellNum(10, count)], 'alignment', {
            vertical: 'middle',
            horizontal: 'right'
        })
        Common.setProps(
            worksheet,
            ['A4', 'A8', 'E2:E7', 'F2:F3', 'A10:J10', 'A' + Common.getCellNum(10, count)],
            'alignment',
            { vertical: 'middle', horizontal: 'center' }
        )

        Common.setProps(worksheet, ['A4', 'E4', 'F4'], 'alignment', { wrapText: true })

        let purchases = []

        list.forEach((row, index) => {
            purchases.push({ cellNm: 'A' + String(10 + Number(index + 1)), value: index + 1 })
            purchases.push({ cellNm: 'B' + String(10 + Number(index + 1)), value: row.brandNm })

            purchases.push({ cellNm: 'C' + String(10 + Number(index + 1)), value: row.origin })
            purchases.push({ cellNm: 'D' + String(10 + Number(index + 1)), value: row.custCategory })
            purchases.push({ cellNm: 'E' + String(10 + Number(index + 1)), value: row.material })

            purchases.push({ cellNm: 'C' + String(10 + Number(index + 1)), value: row.modelNo })
            purchases.push({ cellNm: 'D' + String(10 + Number(index + 1)), value: row.assortNm })
            purchases.push({
                cellNm: 'E' + String(10 + Number(index + 1)),
                value: row.optionNm1 + row.optionNm2 + row.optionNm3
            })
            purchases.push({ cellNm: 'F' + String(10 + Number(index + 1)), value: row.purchaseQty })
            purchases.push({ cellNm: 'G' + String(10 + Number(index + 1)), value: '€ ' + row.mdRrp })
            purchases.push({ cellNm: 'H' + String(10 + Number(index + 1)), value: row.buySupplyDiscount + ' %' })
            purchases.push({
                cellNm: 'I' + String(10 + Number(index + 1)),
                value: String('€ ' + Number(row.purchaseQty * row.mdRrp * (1 - row.buySupplyDiscount / 100)).toFixed(2))
            })
            purchases.push({ cellNm: 'J' + String(10 + Number(index + 1)), value: row.custNm })
        })
        
        const imageBuffer = await axios.get(LogoImage.default, { responseType: 'arraybuffer' })

        // 로고 이미지
        const signImage = workbook.addImage({
            buffer: imageBuffer.data,
            extension: 'png'
        })

        worksheet.addImage(signImage, {
            tl: { col: 0.8, row: 0.6 },
            br: { col: 2.4, row: 2.3 }
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
        saveAs(blob, 'CDF PO(발주서).xlsx')

        props.setSpin(false)
    }

    const printPOGermInvoice = async () => {
        let list = state.items
        let count = list.length + 1
        let vendorNm = ''
        let totalAmount = 0
        let totalPrice = 0

        purchaseVendorList.forEach(row => {
            if (row.value == state.vendorId) {
                vendorNm = row.label
            }
        })
        if (list.length > 0) {
            list.forEach(row1 => {
                totalAmount += row1.purchaseQty
                totalPrice += row1.purchaseQty * row1.mdRrp * (1 - row1.buySupplyDiscount / 100)
            })
        }

        // 엑셀에 입력되야 하는 내역
        let excelJson = [
            { cellNm: 'A1', value: 'High Home\r\nGmbH' },
            {
                cellNm: 'A4',
                value:
                    'Am Kronberger Hang 2\r\n65823 Schwalbach am taunus\r\nE-mail : buyer@high-home.com\r\nTel : (+49) 1525 2853375'
            },
            { cellNm: 'E2', value: 'Order Date.' },
            { cellNm: 'F2', value: Common.trim(state.purchaseDt) },
            { cellNm: 'H2', value: 'Company' },
            { cellNm: 'I2', value: Common.trim(vendorNm) },
            { cellNm: 'E3', value: 'Order No.' },
            { cellNm: 'F3', value: Common.trim(state.siteOrderNo) },
            { cellNm: 'H3', value: 'Sales Term' },
            { cellNm: 'I3', value: 'EXW' },
            { cellNm: 'E4', value: 'Payment\r\nTerms' },
            { cellNm: 'E6', value: 'Delivery' },
            { cellNm: 'E7', value: 'Carrier' },
            { cellNm: 'F4', value: '50% DEPOSIT AGAINST ORDER CONFIRMATION\r\n& 50% BALANCE BEFORE SHIPMENT' },
            { cellNm: 'F6', value: 'AS SOON AS POSSIBLE' },
            { cellNm: 'F7', value: 'TO BE NOMINATED BEFORE SHIPMENT' },
            { cellNm: 'A8', value: 'PURCHASE ORDER' },
            { cellNm: 'A10', value: 'NO.' },
            { cellNm: 'B10', value: 'Brand' },
            { cellNm: 'C10', value: 'Model No' },
            { cellNm: 'D10', value: 'Description' },
            { cellNm: 'E10', value: 'Color' },
            { cellNm: 'F10', value: 'Qty' },
            { cellNm: 'G10', value: 'RRP' },
            { cellNm: 'H10', value: 'Discount' },
            { cellNm: 'I10', value: 'Total' },
            { cellNm: 'J10', value: 'Name' },
            { cellNm: 'A' + Common.getCellNum(10, count), value: 'Total' },
            {
                cellNm: 'A' + Common.getCellNum(12, count),
                value: '※ PLEASE SPECIFY THE COUNTRY OF ORIGIN PER ITEM ON THE COMMERCIAL INVOICE FOR THE SHIPMENT.'
            },
            { cellNm: 'F' + Common.getCellNum(10, count), value: totalAmount },
            { cellNm: 'I' + Common.getCellNum(10, count), value: '€ ' + Number(totalPrice).toFixed(2) }
        ]

        props.setSpin(true)

        const workbook = new ExcelJS.Workbook()
        const worksheet = workbook.addWorksheet('HIGH HOME PO(발주서)') // sheet 이름이 My Sheet

        // 각각의 컬럼 너비 조절
        worksheet.getColumn(1).width = 4
        worksheet.getColumn(2).width = 7.5
        worksheet.getColumn(3).width = 9
        worksheet.getColumn(4).width = 60
        worksheet.getColumn(5).width = 9
        worksheet.getColumn(6).width = 6.5
        worksheet.getColumn(7).width = 6.5
        worksheet.getColumn(8).width = 8
        worksheet.getColumn(9).width = 6.5
        worksheet.getColumn(10).width = 6.5

        // 셀병합이 필요한 셀 병합
        // 셀병합 데이터
        let mergeCellArray = [
            'A1:C3',
            'A4:C7',
            'I2:J2',
            'I3:J3',
            'F2:G2',
            'F3:G3',
            'F4:J5',
            'F6:J6',
            'F7:J7',
            'A8:J9',
            'E4:E5',
            'A' + Common.getCellNum(10, count) + ':E' + Common.getCellNum(10, count)
        ]

        // border 설정을 위해 Json 합쳐 주는 함수
        Common.setProps(
            worksheet,
            [
                'A10:J10',
                'A11:J11',
                'E2:J7',
                'A' + Common.getCellNum(10, count) + ':J' + Common.getCellNum(10, count),
                'A' + Common.getCellNum(11, count) + ':J' + Common.getCellNum(11, count)
            ],
            'border',
            { top: { style: 'thin' } }
        )
        Common.setProps(worksheet, ['E2:J7', 'A10:J10', 'A10:J' + Common.getCellNum(10, count)], 'border', {
            left: { style: 'thin' }
        })
        Common.setProps(worksheet, ['I2:I3', 'F4:F7', 'J10:J' + Common.getCellNum(10, count)], 'border', {
            right: { style: 'thin' }
        })
        Common.setProps(worksheet, ['E7:F7'], 'border', { bottom: { style: 'thin' } })

        // 폰트 관련
        Common.setProps(worksheet, ['A4', 'E2:J7', 'A28', 'A' + Common.getCellNum(12, count)], 'font', {
            name: '맑은 고딕',
            size: 8
        })
        Common.setProps(worksheet, 'A10:J10', 'font', { name: '맑은 고딕', size: 9 })
        Common.setProps(worksheet, 'A8', 'font', { name: '맑은 고딕', size: 20 })
        Common.setProps(worksheet, ['E2:E7', 'H2:H3', 'A10:J10', 'A' + Common.getCellNum(10, count), 'A8'], 'font', {
            bold: true
        })
        Common.setProps(worksheet, 'A' + Common.getCellNum(12, count), 'font', { color: '#FF0000' })

        if (list.length > 0) {
            Common.setProps(worksheet, 'A11:J' + Common.getCellNum(10, count), 'font', { name: '맑은 고딕', size: 8 })
        }

        // BACKGROUND 처리
        Common.setProps(worksheet, 'A11', 'fill', { type: 'pattern', pattern: 'solid', fgColor: { rgba: '#E2EFDA' } })

        // 정렬
        Common.setProps(worksheet, ['F4:J7'], 'alignment', { vertical: 'middle', horizontal: 'left' })
        Common.setProps(worksheet, ['I11:F' + Common.getCellNum(10, count)], 'alignment', {
            vertical: 'middle',
            horizontal: 'right'
        })
        Common.setProps(
            worksheet,
            ['A1', 'A4', 'A8', 'E2:E7', 'F2:F3', 'A10:J10', 'A' + Common.getCellNum(10, count)],
            'alignment',
            { vertical: 'middle', horizontal: 'center' }
        )

        Common.setProps(worksheet, ['A4', 'E4', 'F4'], 'alignment', { wrapText: true })

        let purchases = []

        list.forEach((row, index) => {
            purchases.push({ cellNm: 'A' + String(10 + Number(index + 1)), value: index + 1 })
            purchases.push({ cellNm: 'B' + String(10 + Number(index + 1)), value: row.brandNm })

            purchases.push({ cellNm: 'C' + String(10 + Number(index + 1)), value: row.origin })
            purchases.push({ cellNm: 'D' + String(10 + Number(index + 1)), value: row.custCategory })
            purchases.push({ cellNm: 'E' + String(10 + Number(index + 1)), value: row.material })

            purchases.push({ cellNm: 'C' + String(10 + Number(index + 1)), value: row.modelNo })
            purchases.push({ cellNm: 'D' + String(10 + Number(index + 1)), value: row.assortNm })
            purchases.push({
                cellNm: 'E' + String(10 + Number(index + 1)),
                value: row.optionNm1 + row.optionNm2 + row.optionNm3
            })
            purchases.push({ cellNm: 'F' + String(10 + Number(index + 1)), value: row.purchaseQty })
            purchases.push({ cellNm: 'G' + String(10 + Number(index + 1)), value: '€ ' + row.mdRrp })
            purchases.push({ cellNm: 'H' + String(10 + Number(index + 1)), value: row.buySupplyDiscount + ' %' })
            purchases.push({
                cellNm: 'I' + String(10 + Number(index + 1)),
                value: String('€ ' + Number(row.purchaseQty * row.mdRrp * (1 - row.buySupplyDiscount / 100)).toFixed(2))
            })
            purchases.push({ cellNm: 'J' + String(10 + Number(index + 1)), value: row.custNm })
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
        saveAs(blob, 'HIGH HOME PO(발주서).xlsx')

        props.setSpin(false)
    }

    // 컬럼 리사이즈
    const onFirstDataRendered = params => {
        var allColumnIds = []
        params.columnApi.getAllColumns().forEach(function(column) {
            allColumnIds.push(column.colId)
        })

        params.columnApi.autoSizeColumns(allColumnIds, false)
    }

    return (
        <Layout>
            <div className='notice-header'>
                <CustomBreadcrumb arr={['발주', '발주사후(발주관리)']}></CustomBreadcrumb>
            </div>

            <div className='notice-wrapper'>
                <Row type='flex' justify='end' gutter={[16, 16]}>
                    {/* <Col span={2}>
                            <Button className="fullWidth" onClick={showGoodsSearchList}>
                                상품추가
                            </Button>
                        </Col>
                        <Col span={2}>
                            <Button type='danger' className="fullWidth" onClick={deleteRowData}>
                                상품삭제
                            </Button>
                        </Col>
                        <Col span={2}>
                            <Button className="fullWidth" onClick={resetData}>
                                초기화
                            </Button>
                        </Col> */}
                    <Col span={2}>
                        <Button type='primary' ghost style={{ width: '100%' }} onClick={printPOCDFInvoice}>
                            CDF PO 발주서
                        </Button>
                    </Col>
                    <Col span={3}>
                        <Button type='primary' ghost style={{ width: '100%' }} onClick={printPOGermInvoice}>
                            HIGH HOME PO 발주서
                        </Button>
                    </Col>
                    <Col span={2}>
                        <Button type='primary' ghost style={{ width: '100%' }} onClick={printInvoice}>
                            PI 출력
                        </Button>
                    </Col>
                    <Col span={2}>
                        <Button type='primary' style={{ width: '100%' }} onClick={savePurchase}>
                            저장
                        </Button>
                    </Col>
                </Row>
                <Row gutter={[16, 16]} className='onVerticalCenter marginTop-10'>
                    <Col span={4}>
                        <Text className='font-15 NanumGothic-Regular' strong>
                            발주번호
                        </Text>
                    </Col>
                    <Col span={8}>
                        <Input name='purchaseId' value={state.purchaseId} onChange={handleChangeInput} />
                    </Col>
                    <Col span={4}>
                        <Text className='font-15 NanumGothic-Regular' strong>
                            발주상태
                        </Text>
                    </Col>
                    <Col span={8}>
                        <Select
                            name='purchaseStatus'
                            style={{ width: '100%' }}
                            showSearch
                            showArrow
                            onChange={handleChangePurchaseStatusOption}
                            optionFilterProp='children'
                            filterOption={(input, option) =>
                                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                            value={state.purchaseStatus != '' ? state.purchaseStatus : '01'}>
                            {Constans.PURCHASESTATUS.map(item => (
                                <Option key={item.value}>{item.label}</Option>
                            ))}
                        </Select>
                    </Col>
                </Row>
                <Row gutter={[16, 16]} className='onVerticalCenter marginTop-10'>
                    <Col span={4}>
                        <Text className='font-15 NanumGothic-Regular' strong>
                            구매처
                        </Text>
                    </Col>
                    <Col span={8}>
                        <Select
                            placeholder='구매처를 선택하세요'
                            name='vendorId'
                            style={{ width: '100%' }}
                            showSearch
                            showArrow
                            onChange={handleChangeVendorOption}
                            optionFilterProp='children'
                            filterOption={(input, option) =>
                                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                            value={state.vendorId}>
                            {purchaseVendorList.map(item => (
                                <Option key={item.value}>{item.label}</Option>
                            ))}
                        </Select>
                    </Col>
                    <Col span={4}>
                        <Text className='font-15 NanumGothic-Regular' strong>
                            발주일자
                        </Text>
                    </Col>
                    <Col span={8}>
                        <DatePicker
                            name='purchaseDt'
                            style={{ width: '100%' }}
                            showTime
                            format='YYYY-MM-DD HH:mm:ss'
                            // defaultValue={moment(today, 'YYYY-MM-DD HH:mm:ss')}

                            value={moment(
                                moment(state.purchaseDt).format('YYYY-MM-DD HH:mm:ss'),
                                'YYYY-MM-DD HH:mm:ss'
                            )}
                            placeholder='Start'
                            onChange={handleChangeDate}
                        />
                    </Col>
                </Row>
                <Row gutter={[16, 16]} className='onVerticalCenter marginTop-10'>
                    <Col span={4}>
                        <Text className='font-15 NanumGothic-Regular' strong>
                            입고창고
                        </Text>
                    </Col>
                    <Col span={8}>
                        <Select
                            name='storageId'
                            style={{ width: '100%' }}
                            showSearch
                            showArrow
                            onChange={handleChangeStorageOption}
                            optionFilterProp='children'
                            filterOption={(input, option) =>
                                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                            value={state.storageId}>
                            {storageList.map(item => (
                                <Option key={item.value}>{item.label}</Option>
                            ))}
                        </Select>
                    </Col>
                    <Col span={4}>
                        <Text className='font-15 NanumGothic-Regular' strong>
                            해외주문번호
                        </Text>
                    </Col>
                    <Col span={8}>
                        <Input name='siteOrderNo' value={state.siteOrderNo} onChange={handleChangeInput} />
                    </Col>
                </Row>
                <Row gutter={[16, 16]} className='onVerticalCenter marginTop-10'>
                    <Col span={4}>
                        <Text className='font-15 NanumGothic-Regular' strong>
                            PI 번호
                        </Text>
                    </Col>
                    <Col span={8}>
                        <Input name='piNo' value={state.piNo} onChange={handleChangeInput} />
                    </Col>
                    <Col span={4}>
                        <Text className='font-15 NanumGothic-Regular' strong>
                            특이사항메모
                        </Text>
                    </Col>
                    <Col span={8}>
                        <Input name='memo' value={state.memo} onChange={handleChangeInput} />
                    </Col>
                </Row>
                <Row gutter={[16, 16]} className='onVerticalCenter marginTop-10'>
                    <Col span={4}>
                        <Text className='font-15 NanumGothic-Regular' strong>
                            운송비
                        </Text>
                    </Col>
                    <Col span={8}>
                        <Input name='deliFee' value={state.deliFee} onChange={handleChangeInput} />
                    </Col>
                </Row>
                <div className='notice-condition marginTop-10' style={{ marginTop: '10px' }}>
                    <div className='ag-theme-alpine' style={{ height: '600px', width: '100%' }}>
                        <AgGridReact
                            columnDefs={columnDefs()}
                            rowData={state.items}
                            onCellClicked={onCellClicked}
                            suppressDragLeaveHidesColumns={true}
                            suppressRowClickSelection={true}
                            enableCellTextSelection={true}
                            // onFirstDataRendered={onFirstDataRendered}
                            // onBodyScroll={onFirstDataRendered}
                            defaultColDef={{ flex: 1, minWidth: 100, resizable: true }}
                            rowSelection={'multiple'}
                            onGridReady={onGridReady}></AgGridReact>
                    </div>
                </div>
            </div>

            <div>
                <GoodsSearchList
                    isModalVisible={isModalVisible}
                    setIsModalVisible={setIsModalVisible}
                    backState={state}
                    setSpin={props.setSpin}
                    setBackState={setState}></GoodsSearchList>
            </div>
        </Layout>
    )
}

//export default Create
export default withRouter(Edit)
