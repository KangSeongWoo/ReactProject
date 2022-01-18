import React, { useState } from 'react'
import CustomBreadcrumb from '/src/utils/CustomBreadcrumb'
import { Layout, Input, Row, Col, Select, DatePicker, Button, Typography, Divider, Spin } from 'antd'
import '/src/style/custom.css'
import '/src/style/table.css'
import * as moment from 'moment'

const { Option } = Select
const { RangePicker } = DatePicker
const { Title, Text } = Typography

const List = () => {
    const [state, setState] = useState({
        type: '1',
        title: '',
        is_display: 'ALL',
        start_date: moment().subtract(30, 'd'),
        end_date: moment(),
        type: 1,
        uploadingdhsmf: false
    })

    // 검색일자 범위 변경
    const handleChangeDateRange = e => {
        setState({
            ...state,
            start_date: e[0],
            end_date: e[1]
        })
    }

    // 노출 여부 변경
    const handleChangeDisplayYn = e => {
        setState({
            ...state,
            is_display: e
        })
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

    return (
        <Layout className='animated fadeIn'>
            <Row>
                <Col>
                    <div className='notice-wrapper'>
                        <div>
                            <CustomBreadcrumb arr={['A/S 관리', 'AS 리스트']}></CustomBreadcrumb>
                        </div>

                        <Title className='NanumGothic-Regular'>AS 내역 검색</Title>

                        <Row gutter={[16, 8]} className='onVerticalCenter marginTop-10'>
                            <Col span={2}>
                                <Text className='font-15 NanumGothic-Regular' strong>
                                    제목
                                </Text>
                            </Col>
                            <Col span={22}>
                                <Input
                                    name='title'
                                    value={state.title}
                                    placeholder='제목'
                                    onInput={handleInputChange}
                                />
                            </Col>
                        </Row>
                        <Row gutter={[16, 8]}>
                            <Col span={12}>
                                <Row gutter={[16, 8]} className='onVerticalCenter marginTop-10'>
                                    <Col span={4}>
                                        <Text className='font-15 NanumGothic-Regular' strong>
                                            노출여부
                                        </Text>
                                    </Col>
                                    <Col span={20}>
                                        <Select
                                            name='display'
                                            value={state.is_display}
                                            onChange={handleChangeDisplayYn}
                                            className='fullWidth'>
                                            <Option value='ALL'>전체</Option>
                                            <Option value='Y'>노출</Option>
                                            <Option value='N'>미노출</Option>
                                        </Select>
                                    </Col>
                                </Row>
                            </Col>
                            <Col span={12}>
                                <Row gutter={[16, 8]} className='onVerticalCenter marginTop-10'>
                                    <Col span={4}>
                                        <Text className='font-15 NanumGothic-Regular' strong>
                                            작성일
                                        </Text>
                                    </Col>
                                    <Col span={20}>
                                        <RangePicker
                                            value={[state.start_date, state.end_date]}
                                            onChange={handleChangeDateRange}
                                            className='fullWidth'
                                            ranges={{
                                                Today: [moment(), moment()],
                                                '3일': [moment().subtract(3, 'd'), moment()],
                                                '7일': [moment().subtract(7, 'd'), moment()],
                                                '1개월': [moment().subtract(1, 'M'), moment()],
                                                '3개월': [moment().subtract(3, 'M'), moment()],
                                                '1년': [moment().subtract(1, 'Y'), moment()]
                                            }}
                                        />
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    </div>
                </Col>
            </Row>
            <Row gutter={16} type='flex' justify='center' align='middle' className='marginTop-10'>
                <Col style={{ width: '150px' }}>
                    <Button type='primary' className='fullWidth' ghost>
                        초기화
                    </Button>
                </Col>
                <Col style={{ width: '150px' }}>
                    <Button type='primary' className='fullWidth'>
                        검색
                    </Button>
                </Col>
            </Row>
            <Divider style={{ margin: '10px 0' }} />
            <div className='clearfix'>
                <div className='notice-center-button-left'>
                    <Title level={4} style={{ display: 'none' }}>
                        총 {state.listSize} 개
                    </Title>
                </div>
                <div className='notice-center-button'>
                    <Button type='primary' className='fullWidth'>
                        게시글 등록
                    </Button>
                </div>
            </div>

            <div className='notice-list'></div>
        </Layout>
    )
}

export default List
