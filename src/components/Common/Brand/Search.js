import React, { useState , useMemo, useEffect } from 'react'
import { Layout } from 'antd'
import { withRouter } from 'react-router-dom'
import { Input, Modal, Spin, Typography, Row, Col, Button } from 'antd'

import Https from '../../../api/http'
import { AgGridReact } from 'ag-grid-react'

import '../../../style/custom.css'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-alpine.css'
import * as Common from '../../../utils/Common.js'



const { Title, Text } = Typography

const Search = props => {
    const { isModalVisible, setIsModalVisible, backState, setBackState } = props

    const [loading, setLoading] = useState(false)
    const [gridApi, setGridApi] = useState(null)
    const [gridColumnApi, setGridColumnApi] = useState(null)
    const [state, setState] = useState({
        brandId: '',
        brandNm: '',
        rowData: [],
        
    })

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
        let rows = gridApi.getSelectedRows()

        if (rows.length == 0) {
            alert('브랜드를 선택해 주세요.')
            return false
        }

        setBackState({
            ...backState,
            brandId: rows[0].codeId,
            brandNm: rows[0].codeNm
        })

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

    const getBrandSearch = (codeId, codeNm) => {
        setLoading(true)
        let params = {}
        if (codeId != '') {
            params['codeId'] = codeId
        }

        if (codeNm != '') {
            params['codeNm'] = codeNm
        }

        const p = new URLSearchParams(params)

        return Https.getBrandSearchList(p)
            .then(response => {
                console.log(response)

                setState({
                    ...state,
                    rowData: response.data.data
                })
                setLoading(false)
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
                setLoading(false)
            }) // ERROR
    }

    // agGrid API 호출
    const onGridReady = params => {
        setGridApi(params.api)
        setGridColumnApi(params.columnApi)
    }

    const defaultColDef = useMemo(() => {
        return {
          sortable: true,
          editable: false, 
          flex: 1, 
          minWidth: 100, 
          resizable: true
        };
    }, []);

    return (
        <Spin spinning={loading} size='large'>
            <Modal
                title='브랜드검색'
                visible={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                footer={[
                    <Button key='back' onClick={handleCancel}>
                        취소
                    </Button>,
                    <Button key='submit' type='primary' loading={loading} onClick={handleOk}>
                        확인
                    </Button>
                ]}>
                <div className='notice-wrapper'>
                    <div className='notice-condition'>
                        <Row>
                            <Col span={16}>
                                <Row className='onVerticalCenter marginTop-10'>
                                    <Col span={8}>
                                        <Text className='font-15 NanumGothic-Regular' strong>
                                            브랜드
                                        </Text>
                                    </Col>
                                    <Col span={16}>
                                        <Input name='brandId' value={state.brandId} onChange={handleInputChange} />
                                    </Col>
                                </Row>
                                <Row className='onVerticalCenter marginTop-10'>
                                    <Col span={8}>
                                        <Text className='font-15 NanumGothic-Regular' strong>
                                            브랜드명
                                        </Text>
                                    </Col>
                                    <Col span={16}>
                                        <Input name='brandNm' value={state.brandNm} onChange={handleInputChange} />
                                    </Col>
                                </Row>
                            </Col>
                            <Col span={8}>
                                <Row type='flex' justify='end' align='middle'>
                                    <Button
                                        className='marginTop-10'
                                        type='primary'
                                        style={{ width: '72px', height: '72px' }}
                                        onClick={() => getBrandSearch(state.brandId, state.brandNm)}>
                                        조회
                                    </Button>
                                </Row>
                            </Col>
                        </Row>
                    </div>
                    <div>
                        <div className='ag-theme-alpine' style={{ height: props.height, width: '100%' }}>
                            <AgGridReact defaultColDef={defaultColDef} multiSortKey={'ctrl'}
                                className='marginTop-10'
                                columnDefs={columnDefs()}
                                rowData={state.rowData}
                                ensureDomOrder={true}
                                enableCellTextSelection={true}
                                rowSelection={'single'}
                                onGridReady={onGridReady}></AgGridReact>
                        </div>
                    </div>
                </div>
            </Modal>
        </Spin>
    )
}

//export default Create
export default withRouter(Search)
