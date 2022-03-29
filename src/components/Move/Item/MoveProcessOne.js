import React, { useState, useEffect, useLayoutEffect , useMemo } from 'react'
import CustomBreadcrumb from '/src/utils/CustomBreadcrumb'
import { withRouter } from 'react-router-dom'
import moment from 'moment'
import queryStirng from 'query-string'
import { Row, Col, Input, Typography, DatePicker, Select, Spin } from 'antd'
import { AgGridReact } from 'ag-grid-react'
import Https from '../../../api/http'
import * as GridKeyValue from '../../../utils/GridKeyValue'
import * as Helpers from '../../../utils/Helpers'
import * as Constans from '../../../utils/Constans'
import '/src/style/custom.css'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-alpine.css'

const { Text } = Typography
const { Option } = Select

const MoveProcessOne = props => {
    const { userId } = props

    let params = queryStirng.parse(props.params)

    console.log('params : ' + JSON.stringify(params))
    console.log('유저 ID : ' + userId)

    const [gridApi, setGridApi] = useState(null)
    const [gridColumnApi, setGridColumnApi] = useState(null)
    const [storageList, setStorageList] = useState([])

    // API 호출 get state
    const [getData, setGetData] = useState({
        shipIndDt: moment(params.shipIndDt),
        shipDt: moment(params.shipDt),
        oStorageId: params.oStorageId,
        storageId: params.storageId,
        shipId: params.shipId,
        shipGb: params.shipGb,
        blNo: params.blNo,
        userId: userId
    })

    //화면에 노출되는 state
    const [state, setState] = useState({
        loading: false,
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

    // 조건에 따라 내역 조회
    const setView = async () => {
        try {
            let res = await Https.getMoveProcessOne(getData)

            console.log('---------------------------------------------------')
            console.log(JSON.stringify(res))

            setState({
                ...state,
                height: window.innerHeight - (document.querySelector('header') != undefined ? document.querySelector('header').clientHeight : 0) - (document.querySelector('footer') != undefined ? document.querySelector('footer').clientHeight : 0) - document.querySelector('.notice-condition').clientHeight - 100,
                rowData: res.data.data.moves
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

    const defaultColDef = useMemo(() => {
        return {
          sortable: true,
          flex: 1, minWidth: 100, resizable: true 
        };
    }, []);

    return (
        <>
            <CustomBreadcrumb style={{ marginBottom: '0px' }} arr={['이동', '이동처리내역']}></CustomBreadcrumb>
            <div className='notice-wrapper'>
                <div className='notice-condition'>
            <Row gutter={[16, 8]}>
                <Col span={20}>
                    <Row gutter={[16, 8]} className='onVerticalCenter marginTop-10'>
                        <Col span={4}>
                            <Text className='font-15 NanumGothic-Regular' strong>
                                이동지시번호
                            </Text>
                        </Col>
                        <Col span={12}>
                            <Input
                                placeholder='발주번호를 입력하세요'
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
                        <Col span={12}>
                            <Select
                                name='oStorageId'
                                className='fullWidth'
                                value={getData.oStorageId != '' ? getData.oStorageId : ''}
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
                        <Col span={12}>
                            <Select
                                name='storageId'
                                className='fullWidth'
                                value={getData.storageId != '' ? getData.storageId : ''}
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
                                name='shipIndDt'
                                className='fullWidth'
                                defaultValue={getData.shipIndDt != '' ? getData.shipIndDt : ''}
                                disabled
                            />
                        </Col>
                        <Col span={4}>
                            <Text className='font-15 NanumGothic-Regular' strong>
                                이동일자
                            </Text>
                        </Col>
                        <Col span={6}>
                            <DatePicker
                                name='depositDt'
                                className='fullWidth'
                                defaultValue={getData.shipDt != '' ? getData.shipDt : ''}
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
                                defaultValue={getData.shipGb != '' ? getData.shipGb : ''}
                                disabled>
                                {Constans.MOVEINBGB.map(item => (
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
                                placeholder='발주번호를 입력하세요'
                                className='width-80'
                                defaultValue={getData.blNo != '' ? getData.blNo : ''}
                                disabled
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
                        suppressRowClickSelection={true}
                        onFirstDataRendered={onFirstDataRendered}
                        rowSelection={'multiple'}
                        columnDefs={columnDefs()}
                        onGridReady={onGridReady}></AgGridReact>
                </div>
            </Row>
            </div>
        </>
    )
}

export default withRouter(MoveProcessOne)
