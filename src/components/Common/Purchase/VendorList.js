import React, { useCallback, useState, useEffect } from 'react'
import { withRouter } from 'react-router-dom'
import { Col, Row, Typography, Button } from 'antd'
import { Input, Modal, Spin } from 'antd'
import { AgGridReact } from 'ag-grid-react'
import Https from '../../../api/http'
import '../../../style/custom.css'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-alpine.css'
import * as Common from '../../../utils/Common.js'

const { Text } = Typography

const VendorList = props => {
    const { isModalVisible, setIsModalVisible, backState, setBackState } = props

    const [gridApi, setGridApi] = useState(null)
    const [gridColumnApi, setGridColumnApi] = useState(null)
    const [state, setState] = useState({
        vendorId: '',
        vendorNm: '',
        rowData: []
    })

    const hotkeyFunction = useCallback(event => {
        if (event.key == 'F8') {
            document.querySelector('.searchVendorPop').click()
        }
    }, [])

    useEffect(() => {
        if (isModalVisible) {
            document.addEventListener('keyup', hotkeyFunction)
        } else {
            document.removeEventListener('keyup', hotkeyFunction)
        }
    }, [isModalVisible])

    const columnDefs = () => {
        return [
            {
                headerName: '코드',
                field: 'codeId'
            },
            {
                headerName: '코드명',
                field: 'codeNm'
            }
        ]
    }

    const handleOk = () => {
        setIsModalVisible(false)
    }

    const handleCancel = () => {
        setIsModalVisible(false)
    }

    const handleInputChange = event => {
        const target = event.target

        let value = ''

        if (target.type === 'checkbox') {
            value = target.checked
        } else if (target.type === 'file') {
            value = target.files[0]
        } else {
            value = target.value
        }

        const name = target.name

        setState({
            ...state,
            [name]: value
        })
    }

    const getPurchaseVendorSearch = (codeId, codeNm) => {
        props.setSpin(true)

        let params = {}

        params['codeId'] = Common.trim(codeId)
        params['codeNm'] = Common.trim(codeNm)

        const p = new URLSearchParams(params)

        return Https.getPurchaseVendorSearch(p)
            .then(response => {
                console.log(response)

                setState({
                    ...state,
                    rowData: response.data.data
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

    // agGrid API 호출
    const onGridReady = params => {
        setGridApi(params.api)
        setGridColumnApi(params.columnApi)
    }

    //Row 선택하기
    const onSearchSelectedValue = () => {
        let rows = gridApi.getSelectedRows()

        setBackState({
            ...backState,
            vendorId: rows[0].codeId,
            vendorNm: rows[0].codeNm
        })

        return rows
    }

    return (
        <Modal
            title='구매처 검색'
            className='vendorList'
            visible={isModalVisible}
            onOk={handleOk}
            onCancel={handleCancel}>
            <Row>
                <Col span={16}>
                    <Row className='onVerticalCenter marginTop-10'>
                        <Col span={8}>
                            <Text className='font-15 NanumGothic-Regular' strong>
                                구매처
                            </Text>
                        </Col>
                        <Col span={16}>
                            <Input name='vendorId' value={state.vendorId} onChange={handleInputChange} />
                        </Col>
                    </Row>
                    <Row className='onVerticalCenter marginTop-10'>
                        <Col span={8}>
                            <Text className='font-15 NanumGothic-Regular' strong>
                                구매처명
                            </Text>
                        </Col>
                        <Col span={16}>
                            <Input name='vendorNm' value={state.vendorNm} onChange={handleInputChange} />
                        </Col>
                    </Row>
                </Col>
                <Col span={8}>
                    <Row type='flex' justify='end' align='middle'>
                        <Button
                            className='marginTop-10 searchVendorPop'
                            type='primary'
                            style={{ width: '72px', height: '72px' }}
                            onClick={() => getPurchaseVendorSearch(state.vendorId, state.vendorNm)}>
                            조회
                        </Button>
                    </Row>
                </Col>
            </Row>
            <div>
                <div className='ag-theme-alpine' style={{ height: 200, width: '100%' }}>
                    <AgGridReact
                        suppressDragLeaveHidesColumns={true}
                        className='marginTop-10'
                        columnDefs={columnDefs()}
                        rowData={state.rowData}
                        ensureDomOrder={true}
                        enableCellTextSelection={true}
                        onRowClicked={onSearchSelectedValue}
                        defaultColDef={{ editable: false, flex: 1, minWidth: 100, resizable: true }}
                        rowSelection={'single'}
                        onGridReady={onGridReady}></AgGridReact>
                </div>
            </div>
        </Modal>
    )
}

export default withRouter(VendorList)
