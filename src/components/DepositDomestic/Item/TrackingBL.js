import React, { useState, useLayoutEffect, useEffect , useMemo } from 'react'
import CustomBreadcrumb from '/src/utils/CustomBreadcrumb'
import queryStirng from 'query-string'
import { withRouter } from 'react-router-dom'
import moment from 'moment'
import { Row, Col, Input, DatePicker, Select, Typography, Divider,Button } from 'antd'
import { AgGridReact } from 'ag-grid-react'
import Https from '/src/api/http'
import * as Helpers from '/src/utils/Helpers'
import * as Constans from '/src/utils/Constans'
import * as Common from '../../../utils/Common.js'

import '/src/style/custom.css'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-alpine.css'

const { Text } = Typography
const { Option } = Select

// 발주구분 JSON
let newDealtypecd = {}
for (let i = 0; i < Constans.DEALTYPECD.length; i++) {
    newDealtypecd[Constans.DEALTYPECD[i].value] = Constans.DEALTYPECD[i].label
}

const TrackingBL = props => {
    let params = queryStirng.parse(props.params)

    console.log('params : ' + JSON.stringify(params))

    const [gridApi, setGridApi] = useState(null)
    const [gridColumnApi, setGridColumnApi] = useState(null)

    //상세 이동
    const LinkCellRenderer = props => {
        return (
            <a herf='#' onClick={() => {
                window.location.href = '/#/Move/moveProcessList?' + queryStirng.stringify(props.data)
            }}>
                {props.value}
            </a>
        )
    }
    
    // API 호출 get state
    const [state, setState] = useState({
        staEstiArrvDt: moment().subtract(30, 'd'),
        endEstiArrvDt : moment(),
        blNo: '',
        rowData: [],
        columnDefs: [
            { field: 'blNo', headerName: 'BL 번호', editable: false, suppressMenu: true,cellRenderer: 'LinkCellRenderer'  },
            { field: 'shipmentDt', headerName: '선적일자', editable: false, suppressMenu: true },
            { field: 'estiArrvDt', headerName: '도착예정일자', editable: false, suppressMenu: true },
            { field: 'containerKd', headerName: '컨테이너 종류', editable: false, suppressMenu: true },
            { field: 'containerQty', headerName: '컨테이너 수량', editable: false, suppressMenu: true },
        ]
    })

    // 화면 그려지기 전에 호출
    useLayoutEffect(() => {
        window.addEventListener('resize', () => props.setHeight());
        props.setHeight();
    
    }, [])

    const onGridReady = params => {
        setGridApi(params.api)
        setGridColumnApi(params.columnApi)
    }

    // 컬럼 리사이즈
    const onFirstDataRendered = params => {
        var allColumnIds = []
        params.columnApi.getAllColumns().forEach(function(column) {
            allColumnIds.push(column.colId)
        })

        params.columnApi.autoSizeColumns(allColumnIds, false)
    }

    // 입항 시작 일자 선택
    const handleChangeStartDate = e => {
        setState({
            ...state,
            staEstiArrvDt: e
        })
    }
    
    // 입항 종료 일자 선택
    const handleChangeEndDate = e => {
        setState({
            ...state,
            endEstiArrvDt: e
        })
    }
    
    // Input 입력
    const handlechangeInput = e => {
        setState({
            ...state,
            [e.target.name]: e.target.value
        })
    }
    
    // 조건에 따라 주문이동 가능 내역 조회
    const checkTheValue = () => {
        props.setSpin(true)
        
        const { staEstiArrvDt, endEstiArrvDt, blNo } = state
    
        let params = {}
        
        params.staEstiArrvDt = Common.trim(staEstiArrvDt.format('YYYY-MM-DD'))
        params.endEstiArrvDt = Common.trim(endEstiArrvDt.format('YYYY-MM-DD'))
        params.blNo = Common.trim(blNo)

        console.log('params : ' + JSON.stringify(params))

        const p = new URLSearchParams(params)

        return Https.getMoveProcessList(p)
            .then(response => {
                console.log(response)

                let target = response.data.data
                setState({
                    ...state,
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

    const defaultColDef = useMemo(() => {
        return {
          sortable: true,flex: 1, minWidth: 100, resizable: true
        };
    }, []);

    return (
        <>
            <CustomBreadcrumb style={{ marginBottom: '0px' }} arr={['국내입고', 'BL 조회']}></CustomBreadcrumb>
            <div className='notice-wrapper'>
                <div className='notice-condition'>
            <Row type='flex' justify='end' gutter={[16, 8]}>
                <Col style={{ width: '150px' }}>
                    <Button type='primary' className='fullWidth search' onClick={checkTheValue}>
                        조회
                    </Button>
                </Col>
                {/* <Col style={{ width: '150px' }}>
                    <Button type='primary' className='fullWidth search' onClick={() => {
                        let params = {}
                        
                        params.blNo = '123123123'
                        
                        window.location.href = '/#/Move/moveProcessList?' + queryStirng.stringify(params)
                    }}>
                        테스트
                    </Button>
                </Col> */}
            </Row>
            <Divider style={{ margin: '10px 0' }} />
            <Row gutter={[16, 8]}>
                <Col span={20}>
                    <Row gutter={[16, 8]} className='onVerticalCenter marginTop-10'>
                        <Col span={4}>
                            <Text className='font-15 NanumGothic-Regular' strong>
                                입항일자
                            </Text>
                        </Col>
                        <Col span={6}>
                            <DatePicker
                                name='staEstiArrvDt'
                                className='fullWidth'
                                value={state.staEstiArrvDt}
                                onChange={handleChangeStartDate}
                            />
                        </Col>
                        <Col span={6}>
                            <DatePicker
                                name='endEstiArrvDt'
                                className='fullWidth'
                                value={state.endEstiArrvDt}
                                onChange={handleChangeEndDate}
                            />
                        </Col>
                    </Row>
                </Col>
            </Row>
            <Row gutter={[16, 8]}>
                <Col span={20}>
                    <Row gutter={[16, 8]} className='onVerticalCenter marginTop-10'>
                        <Col span={4}>
                            <Text className='font-15 NanumGothic-Regular' strong>
                                BL 번호
                            </Text>
                        </Col>
                        <Col span={6}>
                            <Input
                                name='blNo'
                                placeholder='BL 번호'
                                className='fullWidth'
                                value={state.blNo != '' ? state.blNo : undefined}
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
                        suppressDragLeaveHidesColumns={true}
                        rowData={state.rowData}
                        // rowSelection={'multiple'}
                        columnDefs={state.columnDefs}
                        onFirstDataRendered={onFirstDataRendered}
                        frameworkComponents={{ LinkCellRenderer: LinkCellRenderer }}
                        // colResizeDefault={'shift'}
                        onGridReady={onGridReady}></AgGridReact>
                </div>
            </Row>
            </div>
        </>
    )
}

//export default Create
export default withRouter(TrackingBL)
