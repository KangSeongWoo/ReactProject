import React, { useState, useLayoutEffect, useCallback, useEffect } from 'react'
import { withRouter } from 'react-router-dom'
import moment from 'moment'
import { Row, Col, Button, Typography, DatePicker, Modal, Select, Divider, Input } from 'antd'
import { AgGridReact } from 'ag-grid-react'
import Https from '/src/api/http'
import axios from 'axios'
import { saveAs } from 'file-saver'
import * as ExcelJS from 'exceljs'
import JsBarcode from 'jsbarcode'
import { DOMImplementation, XMLSerializer } from 'xmldom'
import * as Helpers from '/src/utils/Helpers'
import * as Constans from '/src/utils/Constans'
import * as Common from '/src/utils/Common.js'
import qz from 'qz-tray'

import '/src/style/custom.css'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-alpine.css'
import '/src/js/sign-message.js'

const { Text } = Typography
const { Option } = Select

// 발주구분 JSON
let newDealtypecd = {}
for (let i = 0; i < Constans.DEALTYPECD.length; i++) {
    newDealtypecd[Constans.DEALTYPECD[i].value] = Constans.DEALTYPECD[i].label
}

//발주 상태 JSON
let newPurchasestatus = {}
for (let i = 0; i < Constans.PURCHASESTATUS.length; i++) {
    newPurchasestatus[Constans.PURCHASESTATUS[i].value] = Constans.PURCHASESTATUS[i].label
}

const PurchaseSearchM = props => {
    const { isModalVisible, setIsModalVisible, backData, setBackData } = props

    const [gridApi, setGridApi] = useState(null)
    const [gridColumnApi, setGridColumnApi] = useState(null)
    const [purchaseVendorList, setPurchaseVendorList] = useState([])
    const [purchaseVendorGridKey, setPurchaseVendorGridKey] = useState({})

    // API 호출 시 사용하는 state
    const [getData, setGetData] = useState({
        startDt: moment().subtract(7, 'day'),
        endDt: moment(),
        piNo: '',
        siteOrderNo: '',
        storageId: '000002',
        vendorId: '00'
    })

    // 화면 상태에 관련 한 state
    const [state, setState] = useState({
        loading: false,
        rowData: []
    })

    const columnDefs = () => {
        return [
            {
                field: 'purchaseNo',
                headerName: '발주번호',
                editable: false,
                suppressMenu: true,
                headerCheckboxSelection: false,
                headerCheckboxSelectionFilteredOnly: true,
                checkboxSelection: true
            },
            {
                field: 'dealtypeCd',
                headerName: '발주구분',
                editable: false,
                suppressMenu: true,
                cellEditor: 'select',
                cellEditorParams: {
                    values: Helpers.extractValues(newDealtypecd)
                },
                valueFormatter: function(params) {
                    return Helpers.lookupValue(newDealtypecd, params.value)
                },
                valueParser: function(params) {
                    return Helpers.lookupKey(newDealtypecd, params.newValue)
                }
            },
            { field: 'purchaseDt', headerName: '발주일자', editable: false, suppressMenu: true },
            {
                field: 'vendorId',
                headerName: '구매처',
                editable: false,
                suppressMenu: true,
                cellEditor: 'select',
                cellEditorParams: {
                    values: Helpers.extractValues(purchaseVendorGridKey)
                },
                valueFormatter: function(params) {
                    return Helpers.lookupValue(purchaseVendorGridKey, params.value)
                },
                valueParser: function(params) {
                    return Helpers.lookupKey(purchaseVendorGridKey, params.newValue)
                }
            },
            {
                field: 'purchaseStatus',
                headerName: '발주상태',
                editable: false,
                suppressMenu: true,
                cellEditor: 'select',
                cellEditorParams: {
                    values: Helpers.extractValues(newPurchasestatus)
                },
                valueFormatter: function(params) {
                    return Helpers.lookupValue(newPurchasestatus, params.value)
                },
                valueParser: function(params) {
                    return Helpers.lookupKey(newPurchasestatus, params.newValue)
                }
            },
            { field: 'siteOrderNo', headerName: '해외주문번호', editable: false, suppressMenu: true }
        ]
    }

    const handleOk = () => {
        setIsModalVisible(false)
    }

    const handleCancel = () => {
        setState({
            loading: false,
            rowData: []
        })

        setGetData({
            startDt: moment().subtract(7, 'day'),
            endDt: moment(),
            vendorId: '00',
            storageId: '000002'
        })

        setIsModalVisible(false)
    }

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

    useLayoutEffect(() => {
        setInit()

        /// Authentication setup ///
        qz.security.setCertificatePromise(function(resolve, reject) {
            resolve(
                '-----BEGIN CERTIFICATE-----\n' +
                    'MIIEvjCCAqigAwIBAgIHcHJlLTM3ODALBgkqhkiG9w0BAQUwgZgxCzAJBgNVBAYT\n' +
                    'AlVTMQswCQYDVQQIDAJOWTEbMBkGA1UECgwSUVogSW5kdXN0cmllcywgTExDMRsw\n' +
                    'GQYDVQQLDBJRWiBJbmR1c3RyaWVzLCBMTEMxGTAXBgNVBAMMEHF6aW5kdXN0cmll\n' +
                    'cy5jb20xJzAlBgkqhkiG9w0BCQEWGHN1cHBvcnRAcXppbmR1c3RyaWVzLmNvbTAe\n' +
                    'Fw0yMTAxMTkwNTAwMDBaFw0yMjAxMjAwNTAwMDBaMIGGMQswCQYDVQQGDAJrcjEO\n' +
                    'MAwGA1UECAwFc2VvdWwxDjAMBgNVBAcMBXNlb3VsMREwDwYDVQQKDAhDREYgQnJv\n' +
                    'czERMA8GA1UECwwIQ0RGIEJyb3MxETAPBgNVBAMMCENERiBCcm9zMR4wHAYJKoZI\n' +
                    'hvcNAQkBDA9yamI4MEB0cmRzdC5jb20wggEgMAsGCSqGSIb3DQEBAQOCAQ8AMIIB\n' +
                    'CgKCAQEA2Hql4SKVCgVUxF8fpOC2s2WpvU9GWqMI3OV7QaJ2POnvQHuFedEx2gxW\n' +
                    'WDW+bmiPAzlVuzWRAJFLQytWpYveAGnOCYKof8RnYtFR4SRuzpq/yszEackAZ1AO\n' +
                    'deX2J1TM+eNlmp9cn89CiJ/mcQ6ErdBu4pgmMipK5TtVZHqtCWXwhLnMk9+ewpaP\n' +
                    'iMdc0rMKoyMCT3ceSpB1uM8fakp8a5M957mjReNLT0qZjU860NhZ6M+P0xLXAbqY\n' +
                    '165xZR/b5PkkSFU804gh/xFwspAsIPHfBN08NxMifkNw8V8CrLuSdoblyQtBMKhr\n' +
                    '8k1Nnls+YONChEw9f1gZEPi3EA7p8wIDAQABoyMwITAfBgNVHSMEGDAWgBSQplC3\n' +
                    'hNS56l/yBYQTeEXoqXVUXDALBgkqhkiG9w0BAQUDggIBAKZsFnbx7dtY9HH1hBl1\n' +
                    'Z/t6zJ0JLUR0qhfGvsTN8GObQhzMbUWYOVu51y1r9hlY6NLq0fv7/I9DXmE5ngJk\n' +
                    'N+qwoBryb8G0T/h4W/Ii9BmCwZ3T8JttWOlTupSTBvYO0ETlnXmzhnBB4AADmYsW\n' +
                    '04ZnsfdssTPE9xvjJ8rOIvQgyKySiNrN6baPKmqBODwtqDCvbH9FZDHr+ssMpoVo\n' +
                    'QuRhrWF9cqsOCQNgW5RoIkBUw+lPeqQE6aZKnOsMsE+uoTvoxwn731kJ8b/g3PWF\n' +
                    'GhnulmQ33r5PK2+FVPTtLKqnBWuYN7seaVn9o8goasbyvraSIZTX7WD1Wp8HBIsZ\n' +
                    'UAAl+wQM/iJ73W93/w5c5OKjK8H2akpfRJj+dYVz/A/wNuIWmaZ1HAIItkD1HUm4\n' +
                    'g/iXBuhCkrfiFHYqOdh9wugcFdiTmUErlkEjFkpMe+OcRchB0CHECDWIVv2U+3As\n' +
                    'sqOY4KDpAXZh1STF+ChRY5pIeNDz7nTZZfnCIIcl3by75LOZrim6u4z82Io6H9S7\n' +
                    'qPppU56cRJced4D9p1arv/gEcAaeMdsyprWnW6VIyJg3X2/WLtpn0PDeU1zHKlMq\n' +
                    'dZwEzllghmxYGhu/rj1hNMqm579QBuVLwPvkqSdah2riha/ifEf8f83CBouNcIli\n' +
                    '2UmEu54gVRusYQyr4K0TbuLX\n' +
                    '-----END CERTIFICATE-----\n' +
                    '--START INTERMEDIATE CERT--\n' +
                    '-----BEGIN CERTIFICATE-----\n' +
                    'MIIFEjCCA/qgAwIBAgICEAAwDQYJKoZIhvcNAQELBQAwgawxCzAJBgNVBAYTAlVT\n' +
                    'MQswCQYDVQQIDAJOWTESMBAGA1UEBwwJQ2FuYXN0b3RhMRswGQYDVQQKDBJRWiBJ\n' +
                    'bmR1c3RyaWVzLCBMTEMxGzAZBgNVBAsMElFaIEluZHVzdHJpZXMsIExMQzEZMBcG\n' +
                    'A1UEAwwQcXppbmR1c3RyaWVzLmNvbTEnMCUGCSqGSIb3DQEJARYYc3VwcG9ydEBx\n' +
                    'emluZHVzdHJpZXMuY29tMB4XDTE1MDMwMjAwNTAxOFoXDTM1MDMwMjAwNTAxOFow\n' +
                    'gZgxCzAJBgNVBAYTAlVTMQswCQYDVQQIDAJOWTEbMBkGA1UECgwSUVogSW5kdXN0\n' +
                    'cmllcywgTExDMRswGQYDVQQLDBJRWiBJbmR1c3RyaWVzLCBMTEMxGTAXBgNVBAMM\n' +
                    'EHF6aW5kdXN0cmllcy5jb20xJzAlBgkqhkiG9w0BCQEWGHN1cHBvcnRAcXppbmR1\n' +
                    'c3RyaWVzLmNvbTCCAiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoCggIBANTDgNLU\n' +
                    'iohl/rQoZ2bTMHVEk1mA020LYhgfWjO0+GsLlbg5SvWVFWkv4ZgffuVRXLHrwz1H\n' +
                    'YpMyo+Zh8ksJF9ssJWCwQGO5ciM6dmoryyB0VZHGY1blewdMuxieXP7Kr6XD3GRM\n' +
                    'GAhEwTxjUzI3ksuRunX4IcnRXKYkg5pjs4nLEhXtIZWDLiXPUsyUAEq1U1qdL1AH\n' +
                    'EtdK/L3zLATnhPB6ZiM+HzNG4aAPynSA38fpeeZ4R0tINMpFThwNgGUsxYKsP9kh\n' +
                    '0gxGl8YHL6ZzC7BC8FXIB/0Wteng0+XLAVto56Pyxt7BdxtNVuVNNXgkCi9tMqVX\n' +
                    'xOk3oIvODDt0UoQUZ/umUuoMuOLekYUpZVk4utCqXXlB4mVfS5/zWB6nVxFX8Io1\n' +
                    '9FOiDLTwZVtBmzmeikzb6o1QLp9F2TAvlf8+DIGDOo0DpPQUtOUyLPCh5hBaDGFE\n' +
                    'ZhE56qPCBiQIc4T2klWX/80C5NZnd/tJNxjyUyk7bjdDzhzT10CGRAsqxAnsjvMD\n' +
                    '2KcMf3oXN4PNgyfpbfq2ipxJ1u777Gpbzyf0xoKwH9FYigmqfRH2N2pEdiYawKrX\n' +
                    '6pyXzGM4cvQ5X1Yxf2x/+xdTLdVaLnZgwrdqwFYmDejGAldXlYDl3jbBHVM1v+uY\n' +
                    '5ItGTjk+3vLrxmvGy5XFVG+8fF/xaVfo5TW5AgMBAAGjUDBOMB0GA1UdDgQWBBSQ\n' +
                    'plC3hNS56l/yBYQTeEXoqXVUXDAfBgNVHSMEGDAWgBQDRcZNwPqOqQvagw9BpW0S\n' +
                    'BkOpXjAMBgNVHRMEBTADAQH/MA0GCSqGSIb3DQEBCwUAA4IBAQAJIO8SiNr9jpLQ\n' +
                    'eUsFUmbueoxyI5L+P5eV92ceVOJ2tAlBA13vzF1NWlpSlrMmQcVUE/K4D01qtr0k\n' +
                    'gDs6LUHvj2XXLpyEogitbBgipkQpwCTJVfC9bWYBwEotC7Y8mVjjEV7uXAT71GKT\n' +
                    'x8XlB9maf+BTZGgyoulA5pTYJ++7s/xX9gzSWCa+eXGcjguBtYYXaAjjAqFGRAvu\n' +
                    'pz1yrDWcA6H94HeErJKUXBakS0Jm/V33JDuVXY+aZ8EQi2kV82aZbNdXll/R6iGw\n' +
                    '2ur4rDErnHsiphBgZB71C5FD4cdfSONTsYxmPmyUb5T+KLUouxZ9B0Wh28ucc1Lp\n' +
                    'rbO7BnjW\n' +
                    '-----END CERTIFICATE-----\n'
            )
        })

        qz.websocket.connect().then(function() {
            console.log('Connected!')
        })
    }, [])

    // 화면초기화
    const setInit = async () => {
        try {
            setState({
                ...state,
                loading: true
            })

            let res = await Https.getVendorList()
            console.log('---------------------------------------------------')
            console.log(res)
            setPurchaseVendorList(res.data.data.PurchaseVendors) // 구매처 State
            setPurchaseVendorGridKey(res.data.data.purchaseVendorsGridKey)
        } catch (error) {
            console.error(error)
        } finally {
            setState({
                ...state,
                loading: false
            })
        }
    }

    // agGrid API 호출
    const onGridReady = params => {
        setGridApi(params.api)
        setGridColumnApi(params.columnApi)
    }

    // 조건에 따라 입고처리 가능 내역 조회
    const checkTheValue = () => {
        const { vendorId, startDt, endDt, storageId, piNo, siteOrderNo } = getData

        if (vendorId == '') {
            alert('구매처를 입력하세요.')
            return false
        }

        if (startDt == '') {
            alert('시작날짜를 입력하세요.')
            return false
        }

        if (endDt == '') {
            alert('종료날짜를 입력하세요.')
            return false
        }

        let params = {}

        params.vendorId = vendorId != '00' ? Common.trim(vendorId) : ''
        params.startDt = Common.trim(startDt.format('YYYY-MM-DD'))
        params.endDt = Common.trim(endDt.format('YYYY-MM-DD'))
        params.storageId = Common.trim(storageId)
        params.piNo = Common.trim(piNo)
        params.siteOrderNo = Common.trim(siteOrderNo)

        console.log(JSON.stringify(params))

        const p = new URLSearchParams(params)
        props.setSpin(true)
        return Https.getPurchaseListByDeposit(p)
            .then(response => {
                console.log(JSON.stringify(response))

                setState({
                    ...state,
                    rowData: response.data.data.purchases
                })
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
            })
            .finally(() => {
                props.setSpin(false)
            })
    }

    // 시작일 변경
    const handleChangeStartDt = e => {
        if (e != null) {
            setGetData({
                ...getData,
                startDt: e
            })
        }
    }

    // 종료일 변경
    const handleChangeEndDt = e => {
        if (e != null) {
            setGetData({
                ...getData,
                endDt: e
            })
        }
    }

    // 구매처 선택
    const handleChangeOption = e => {
        setGetData({
            ...getData,
            vendorId: e
        })
    }

    // Input 입력
    const handlechangeInput = e => {
        setGetData({
            ...getData,
            [e.target.name]: e.target.value
        })
    }

    // 선택완료
    const selectThisValue = () => {
        var selectedRows = gridApi.getSelectedRows()

        if (selectedRows.length == 0) {
            alert('발주건을 선택해 주세요.')
            return false
        }

        setBackData({
            ...backData,
            purchaseNo: selectedRows[0].purchaseNo
        })

        setState({
            loading: false,
            rowData: []
        })

        setGetData({
            ...getData,
            startDt: moment().subtract(7, 'day'),
            endDt: moment(),
            storageId: '000002',
            vendorId: '00'
        })
        handleCancel()
    }

    // 컬럼 리사이즈
    const onFirstDataRendered = params => {
        var allColumnIds = []
        params.columnApi.getAllColumns().forEach(function(column) {
            allColumnIds.push(column.colId)
        })

        params.columnApi.autoSizeColumns(allColumnIds, true)
    }

    const printData = async () => {
        gridApi.selectAllFiltered()
        let selectedRows = gridApi.getSelectedRows()

        if (selectedRows.length == 0) {
            alert('발주건을 선택해 주세요.')
            return false
        }

        props.setSpin(true)

        let tempList = []
        selectedRows.forEach(row1 => {
            tempList = tempList.concat(row1.items)
        })

        // 엑셀에 입력되야 하는 내역
        let excelJson = [
            { cellNm: 'A1', value: 'NO.' },
            { cellNm: 'B1', value: '고도몰 주문 번호' },
            { cellNm: 'C1', value: '주문자 이름' },
            { cellNm: 'D1', value: '수취인 이름' },
            { cellNm: 'E1', value: '수취인 전화번호' },
            { cellNm: 'F1', value: '수취인 핸드폰 번호' },
            { cellNm: 'G1', value: '수취인 우편번호' },
            { cellNm: 'H1', value: '수취인 전체주소' },
            { cellNm: 'I1', value: '주문시 남기는 글' },
            { cellNm: 'J1', value: '상품명' },
            { cellNm: 'K1', value: '상품수량' },
            { cellNm: 'L1', value: '원산지' },
            { cellNm: 'M1', value: '사진' }
        ]

        const workbook = new ExcelJS.Workbook()

        const worksheet = workbook.addWorksheet('검수리스트')

        // 각각의 컬럼 너비 조절
        worksheet.getColumn(1).width = 9
        worksheet.getColumn(2).width = 16
        worksheet.getColumn(3).width = 10
        worksheet.getColumn(4).width = 10
        worksheet.getColumn(5).width = 14
        worksheet.getColumn(6).width = 16
        worksheet.getColumn(7).width = 14
        worksheet.getColumn(8).width = 36
        worksheet.getColumn(9).width = 30
        worksheet.getColumn(10).width = 36
        worksheet.getColumn(11).width = 8
        worksheet.getColumn(12).width = 8
        worksheet.getColumn(13).width = 21

        let depositList = []
        let response = null
        let signImage = null

        for (let index = 0; index < tempList.length; index++) {
            let row2 = tempList[index]

            depositList.push({ cellNm: 'A' + (index + 2), value: index + 1 })
            depositList.push({ cellNm: 'B' + (index + 2), value: row2.channelOrderNo })
            depositList.push({ cellNm: 'C' + (index + 2), value: row2.custNm })
            depositList.push({ cellNm: 'D' + (index + 2), value: row2.receiverNm })
            depositList.push({ cellNm: 'E' + (index + 2), value: row2.receiverTel })
            depositList.push({ cellNm: 'F' + (index + 2), value: row2.receiverHp })
            depositList.push({ cellNm: 'G' + (index + 2), value: row2.receiverZonecode })
            depositList.push({ cellNm: 'H' + (index + 2), value: row2.receiverAddr1 + row2.receiverAddr2 })
            depositList.push({ cellNm: 'I' + (index + 2), value: row2.orderMemo })
            depositList.push({ cellNm: 'J' + (index + 2), value: row2.assortNm })
            depositList.push({ cellNm: 'K' + (index + 2), value: row2.purchaseQty })
            depositList.push({ cellNm: 'L' + (index + 2), value: row2.origin })

            worksheet.getRow(index + 2).height = 90

            let data = {
                url: row2.imgServerUrl + row2.imagePath //이미지 주소
            }

            response = await axios.post(process.env.REACT_APP_API_URL + '/file/godoImage', data)

            if (response.data != '') {
                signImage = workbook.addImage({
                    base64: response.data,
                    extension: 'jpeg'
                })
                worksheet.addImage(signImage, 'M' + (index + 2) + ':M' + (index + 2))
            }
        }

        Common.setProps(worksheet, 'A2:' + 'M' + Common.getCellNum(2, tempList.length), 'alignment', {
            vertical: 'middle',
            horizontal: 'center'
        })

        excelJson = excelJson.concat(depositList)
        Common.setJsonValues(worksheet, excelJson)

        const mimeType = {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }

        const buffer = await workbook.xlsx.writeBuffer()
        const blob = new Blob([buffer], mimeType)
        saveAs(blob, '검수리스트.xlsx')
        gridApi.deselectAll()
        props.setSpin(false)
    }

    const print1 = () => {
        gridApi.selectAllFiltered()
        let selectedRows = gridApi.getSelectedRows()

        if (selectedRows.length == 0) {
            alert('발주건을 선택해 주세요.')
            return false
        }

        let tempList = []
        selectedRows.forEach(row1 => {
            tempList = tempList.concat(row1.items)
        })

        tempList.forEach(row2 => {
            let tempHtml = ''

            tempHtml +=
                "<table style='border: 1px solid black; border-collapse: collapse; width: 370px; height: 370px;' >"
            tempHtml += '<tr>'
            tempHtml += "    <td style='text-align: center; border: 1px solid black; width : 18%'>판매처</td>"
            tempHtml += "    <td style='text-align: center; border: 1px solid black; width : 40%'>TRDST</td>"
            tempHtml += "    <td style='text-align: center; border: 1px solid black;'>이미지</td>"
            tempHtml += '</tr>'
            tempHtml += '<tr>'
            tempHtml += "   <td style='text-align: center; border: 1px solid black;'>수령인</td>"
            tempHtml += "   <td style='text-align: center; border: 1px solid black;'>" + row2.receiverNm + '</td>'
            tempHtml += "   <td style='text-align: center; border: 1px solid black;' rowspan='4'>"
            tempHtml += "       <img style='max-width: 160px;' src='" + row2.imgServerUrl + row2.imagePath + "'/>"
            tempHtml += '   </td>'
            tempHtml += '</tr>'
            tempHtml += '<tr>'
            tempHtml += "   <td style='text-align: center; border: 1px solid black;'>주문번호</td>"
            tempHtml += "   <td style='text-align: center; border: 1px solid black;'>" + row2.channelOrderNo + '</td>'
            tempHtml += '</tr>'
            tempHtml += '<tr>'
            tempHtml += "   <td style='text-align: center; border: 1px solid black;'>주소</td>"
            tempHtml +=
                "       <td style='text-align: center; border: 1px solid black;'>" +
                row2.receiverAddr1 +
                row2.receiverAddr2 +
                '</td>'
            tempHtml += '</tr>'
            tempHtml += '<tr>'
            tempHtml += "   <td style='text-align: center; border: 1px solid black;'>수량</td>"
            tempHtml += "   <td style='text-align: center; border: 1px solid black;'>" + row2.purchaseQty + '</td>'
            tempHtml += '</tr>'
            tempHtml += '</table>'

            var config = qz.configs.create('Bar Code Printer TT027-50', {
                units: 'in',
                size: { width: 4.1, height: 4.1 },
                margins: { top: 0.12, right: 0.07, left: 0.07, bottom: 0.07 }
            })
            var data = [
                {
                    type: 'pixel',
                    format: 'html',
                    flavor: 'plain', // or 'plain' if the data is raw HTML
                    data: tempHtml
                }
            ]
            qz.print(config, data).catch(function(e) {
                console.error(e)
            })
        })

        gridApi.deselectAll()
    }

    const print2 = () => {
        gridApi.selectAllFiltered()
        let selectedRows = gridApi.getSelectedRows()

        if (selectedRows.length == 0) {
            alert('발주건을 선택해 주세요.')
            return false
        }

        let tempList = []
        selectedRows.forEach(row1 => {
            tempList = tempList.concat(row1.items)
        })

        const xmlSerializer = new XMLSerializer()
        const document = new DOMImplementation().createDocument('http://www.w3.org/1999/xhtml', 'html', null)
        const svgNode = document.createElementNS('http://www.w3.org/2000/svg', 'svg')

        tempList.forEach(row2 => {
            JsBarcode(svgNode, row2.assortId + row2.itemId, {
                xmlDocument: document,
                width: 1,
                fontSize: 10,
                height: 20
            })

            const svgText = xmlSerializer.serializeToString(svgNode)

            let tempHtml = ''

            tempHtml +=
                '<div style="border : 1px solid black; position: relative; width: 188px; height:113px; overflow: hidden; ">'
            tempHtml += '   <div style="padding:5px;">'
            tempHtml += '       <div style="font-size: 8pt; font-weight: bold;">' + row2.brandNm + '</div>'
            tempHtml += '       <div style="font-size: 8pt;">' + row2.assortNm + '</div>'
            tempHtml += '       <div style="position: absolute; top: 60px; left: 43px;">'
            tempHtml += svgText
            tempHtml += '       </div>'
            tempHtml += '   </div>'
            tempHtml += '</div>'

            var config = qz.configs.create('Bar Code Printer TT027-50', {
                units: 'in',
                size: { width: 2.4, height: 1.2 },
                margins: { top: 0, right: 0, left: 0.3, bottom: 0 }
            })
            var data = [
                {
                    type: 'pixel',
                    format: 'html',
                    flavor: 'plain', // or 'plain' if the data is raw HTML
                    data: tempHtml
                }
            ]
            qz.print(config, data).catch(function(e) {
                console.error(e)
            })
        })
        gridApi.deselectAll()
    }

    return (
        <>
            <Modal
                title='발주조회'
                className='purchaseSearchM'
                visible={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                width={'70%'}
                footer={[<></>]}>
                <Row type='flex' justify='end' gutter={[16, 8]}>
                    <Col style={{ width: '150px' }}>
                        <Button type='primary' className='fullWidth' onClick={printData} ghost>
                            검수리스트 출력
                        </Button>
                    </Col>
                    <Col style={{ width: '150px' }}>
                        <Button type='primary' className='fullWidth' onClick={print2} ghost>
                            바코드 출력
                        </Button>
                    </Col>
                    <Col style={{ width: '150px' }}>
                        <Button type='primary' className='fullWidth' onClick={print1} ghost>
                            물류서식지 출력
                        </Button>
                    </Col>
                    <Col style={{ width: '150px' }}>
                        <Button type='primary' className='fullWidth searchPop' onClick={checkTheValue} ghost>
                            조회
                        </Button>
                    </Col>
                    <Col style={{ width: '150px' }}>
                        <Button type='primary' className='fullWidth' onClick={selectThisValue}>
                            선택완료
                        </Button>
                    </Col>
                </Row>
                <Divider style={{ margin: '10px 0' }} />
                <Row gutter={[16, 8]} className='onVerticalCenter marginTop-10'>
                    <Col span={4}>
                        <Text className='font-15 NanumGothic-Regular' strong>
                            발주일
                        </Text>
                    </Col>
                    <Col span={5}>
                        <DatePicker
                            name='startDt'
                            className='fullWidth'
                            onChange={handleChangeStartDt}
                            value={getData.startDt}
                        />
                    </Col>
                    <Col span={5}>
                        <DatePicker
                            name='endDt'
                            className='fullWidth'
                            onChange={handleChangeEndDt}
                            value={getData.endDt}
                        />
                    </Col>
                </Row>
                <Row gutter={[16, 8]} className='onVerticalCenter marginTop-10'>
                    <Col span={4}>
                        <Text className='font-15 NanumGothic-Regular' strong>
                            구매처
                        </Text>
                    </Col>
                    <Col span={10}>
                        <Select
                            defaultValue='구매처선택'
                            className='fullWidth'
                            onChange={handleChangeOption}
                            value={getData.vendorId}>
                            <Option key='00'>선택</Option>
                            {purchaseVendorList.map(item => (
                                <Option key={item.value}>{item.label}</Option>
                            ))}
                        </Select>
                    </Col>
                </Row>
                <Row gutter={[16, 8]} className='onVerticalCenter marginTop-10'>
                    <Col span={4}>
                        <Text className='font-15 NanumGothic-Regular' strong>
                            PI 번호
                        </Text>
                    </Col>
                    <Col span={10}>
                        <Input
                            name='piNo'
                            placeholder='PI 번호를 입력하세요'
                            className='width-80'
                            value={getData.piNo != '' ? getData.piNo : ''}
                            onInput={handlechangeInput}
                            autoComplete='off'
                        />
                    </Col>
                </Row>
                <Row gutter={[16, 8]} className='onVerticalCenter marginTop-10'>
                    <Col span={4}>
                        <Text className='font-15 NanumGothic-Regular' strong>
                            해외주문번호
                        </Text>
                    </Col>
                    <Col span={10}>
                        <Input
                            name='siteOrderNo'
                            placeholder='해외주문번호를 입력하세요'
                            className='width-80'
                            value={getData.siteOrderNo != '' ? getData.siteOrderNo : ''}
                            onInput={handlechangeInput}
                            autoComplete='off'
                        />
                    </Col>
                </Row>

                <Row className='marginTop-10'>
                    <div className='ag-theme-alpine' style={{ height: 400, width: '100%' }}>
                        <AgGridReact
                            enableCellTextSelection={true}
                            rowData={state.rowData}
                            defaultColDef={{ flex: 1, minWidth: 100, resizable: true }}
                            suppressRowClickSelection={true}
                            suppressDragLeaveHidesColumns={true}
                            columnDefs={columnDefs()}
                            rowSelection={'single'}
                            onFirstDataRendered={onFirstDataRendered}
                            onGridReady={onGridReady}></AgGridReact>
                    </div>
                </Row>
            </Modal>
        </>
    )
}

export default withRouter(PurchaseSearchM)
