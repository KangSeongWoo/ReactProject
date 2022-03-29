import React, { useState, useEffect , useMemo } from 'react'
import { ResponsivePie } from '@nivo/pie'
import { withRouter } from 'react-router-dom'
import CustomBreadcrumb from '/src/utils/CustomBreadcrumb'
import { Row, Col, Button, Input, Typography, Spin } from 'antd'
import Https from '../../../api/http'

import '/src/style/custom.css'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-alpine.css'
import * as Common from '../../../utils/Common.js'
import TestEditor from './TestEditor.js'
/*
    monthlyAvePcCtr : 모바일을 통해 클릭률
    monthlyAveMobileCtr : PC를 통해 클릭률
    monthlyAveMobileClkCnt : 모바일을 통해 클릭으로 해당 키워드로 진입하는 경우
    monthlyAvePcClkCnt : PC를 통해 클릭으로 해당 키워드로 진입하는 경우
    monthlyPcQcCnt : PC를 통해 검색 수
    monthlyMobileQcCnt : 모바일을 통해 검색 수
*/

const { Title } = Typography

let index = 0
const Search = props => {
    const [data, setData] = useState([])
    const [searchWord, setSearchWord] = useState(null)
    const [state, setState] = useState({
        rowData: []
    })

    useEffect(() => {
        if (searchWord != null) {
            let arr = searchWord.split(',')
            if (arr[index] != undefined) {
                getKeywords(arr[index])
            } else {
                orderByPCCount()
            }
        }
    }, [data])

    useEffect(() => {
        index = 0
        setData([])
    }, [searchWord])

    // 키워드 검색 결과 조회하기
    const getKeywords = async keyword => {
        props.setSpin(true)

        let param = {
            keyword: keyword.replace(/ /gi, '')
        }

        const p = new URLSearchParams(param)

        console.log(JSON.stringify(p))
        index = index + 1
        return Https.getKeywordsList(p)
            .then(response => {
                console.log(response)
                setData([
                    ...data,
                    {
                        ...param,
                        list: response.data.data.keywordList
                    }
                ])
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

    const handleChangeButton = () => {
        let searchWords = document.getElementsByName('searchKeyword')[0].value
        setSearchWord(searchWords)
    }

    //그래프 PC기준으로
    const orderByPCCount = () => {
        /*
            {
                "id": "men",
                "label": "men",
                "value": 18.056294388899527,
            },
        */

        let tempJson = []

        for (let i = 0; i < data.length; i++) {
            let innerJson = []
            let innerinnerJson = []
            let title = data[i].keyword
            let tempDate = data[i].list

            tempDate.sort(function(a, b) {
                return b.monthlyPcQcCnt - a.monthlyPcQcCnt
            })
            for (let j = 0; j < 10; j++) {
                if (tempDate[j] != undefined) {
                    let params = {}

                    params.id = tempDate[j].relKeyword
                    params.label = tempDate[j].relKeyword
                    params.value = tempDate[j].monthlyPcQcCnt

                    innerinnerJson.push(params)
                }
            }
            innerJson.title = title
            innerJson.list = innerinnerJson
            tempJson.push(innerJson)
        }

        setState({
            ...state,
            rowData: tempJson
        })
    }

    //그래프 mobile기준으로
    const orderByMobileCount = () => {
        /*
                    {
                        "id": "men",
                        "label": "men",
                        "value": 18.056294388899527,
                    },
                */

        let tempJson = []

        for (let i = 0; i < data.length; i++) {
            let innerJson = []
            let innerinnerJson = []
            let title = data[i].keyword
            let tempDate = data[i].list

            tempDate.sort(function(a, b) {
                return b.monthlyMobileQcCnt - a.monthlyMobileQcCnt
            })

            for (let j = 0; j < 10; j++) {
                if (tempDate[j] != undefined) {
                    let params = {}

                    params.id = tempDate[j].relKeyword
                    params.label = tempDate[j].relKeyword
                    params.value = tempDate[j].monthlyMobileQcCnt

                    innerinnerJson.push(params)
                }
            }
            innerJson.title = title
            innerJson.list = innerinnerJson
            tempJson.push(innerJson)
        }

        setState({
            ...state,
            rowData: tempJson
        })
    }

    const DrawTheGraph = props => {
        return (
            <div style={{ height: '550px', width: '830px' }}>
                <Title style={{ paddingLeft: '19px', paddingTop: '10px' }}>{props.title}</Title>
                <ResponsivePie
                    data={props.data}
                    margin={{ top: 40, right: 20, bottom: 80, left: 75 }}
                    innerRadius={0.5}
                    padAngle={0.7}
                    cornerRadius={3}
                    activeOuterRadiusOffset={8}
                    borderWidth={1}
                    borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
                    arcLinkLabelsSkipAngle={10}
                    arcLinkLabelsTextColor='#333333'
                    arcLinkLabelsThickness={2}
                    arcLinkLabelsColor={{ from: 'color' }}
                    arcLabelsSkipAngle={10}
                    arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
                    legends={[
                        {
                            anchor: 'top-left',
                            direction: 'column',
                            justify: false,
                            translateX: -60,
                            translateY: 0,
                            itemsSpacing: 0,
                            itemWidth: 100,
                            itemHeight: 40,
                            itemTextColor: '#999',
                            itemDirection: 'left-to-right',
                            itemOpacity: 1,
                            symbolSize: 18,
                            symbolShape: 'circle',
                            effects: [
                                {
                                    on: 'hover',
                                    style: {
                                        itemTextColor: '#000'
                                    }
                                }
                            ]
                        }
                    ]}
                />
            </div>
        )
    }

    return (
        <>
            <CustomBreadcrumb style={{ marginBottom: '0px' }} arr={['검색어', '검색어']}></CustomBreadcrumb>
            <Row gutter={[16, 8]}>
                <Col span={20}>
                    <Input
                        name='searchKeyword'
                        placeholder='검색어를 입력하세요'
                        className='fullWidth'
                        defaultValue={searchWord}
                    />
                </Col>
                <Col span={4}>
                    <Button type='primary' className='fullWidth' onClick={handleChangeButton}>
                        조회
                    </Button>
                </Col>
            </Row>
            <Row gutter={[16, 8]}>
                <Col span={4}>
                    <Button type='primary' className='fullWidth' onClick={orderByPCCount} ghost>
                        PC기준
                    </Button>
                </Col>
                <Col span={4}>
                    <Button type='primary' className='fullWidth' onClick={orderByMobileCount} ghost>
                        모바일기준
                    </Button>
                </Col>
            </Row>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                {state.rowData.map(item => (
                    <DrawTheGraph title={item.title} data={item.list} />
                ))}
            </div>
        </>
    )
}

export default withRouter(Search)
