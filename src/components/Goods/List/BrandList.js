import React, { useState, useLayoutEffect, useEffect } from 'react'
import CustomBreadcrumb from '/src/utils/CustomBreadcrumb'
import { withRouter } from 'react-router-dom'
import { Row, Col, Button, Input, Typography, Tree,Table,Select } from 'antd'
import GoodsSearchList from '../../Common/Purchase/GoodsSearchList'

import '/src/style/custom.css'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-alpine.css'
import * as Common from '../../../utils/Common.js'

const { Options } = Select;
const { TreeNode } = Tree;
const { Text } = Typography

const BrandList = props => {
    const { userId } = props;
    const [isModalVisible, setIsModalVisible] = useState(false)
    
    const [state, setState] = useState({
        selectedKeys: '',
        title: '',
        url : '',
        brandData: [
            { title: 'root', key: '1', seq: 0, url:'' },
            { title: '00', key: '10', seq: 0, url:''  },
            { title: '01', key: '11', seq: 1, url:''  },
            { title: '02', key: '12', seq: 2, url:''  },
            { title: '001', key: '101', seq: 0, url:''  },
            { title: '010', key: '110', seq: 0 , url:'' },
            { title: '011', key: '111', seq: 1, url:'www.naver.com'  },
            { title: '012', key: '112', seq: 2 , url:'' },
            { title: '03', key: '13', seq: 3, url:''  },
            { title: '030', key: '130', seq: 0, url:''  },
        ],
        rowData : [],
        brandTree : []
    })
    
    // 화면 그려지기 전에 호출
    useLayoutEffect(() => {
        window.addEventListener('resize', () => props.setHeight());
        props.setHeight();
        //setInit()
    }, [])
    
    useEffect(() => {
        let tempList = JSON.parse(JSON.stringify(state.brandData));
        
        let brandTree = makeBrandTree(tempList, [], 0, '');
        setState({
            ...state,
            brandTree : brandTree
        })
    },[state.brandData])
    
    const makeBrandTree = (inputList,outputList,index, key) => {
        let tempList = [];
        
        tempList = inputList.filter((row) => row.key.length === index + 1 && row.key.substr(0, index) === key);
        
        if (tempList.length == 0) {
            return outputList;
        }
        
        for (let i = 0; i < tempList.length; i++){
            if (tempList[i].children == undefined) {
                tempList[i].children = [];
            }
            makeBrandTree(inputList, tempList[i].children, index + 1,tempList[i].key)
            outputList.push(tempList[i]);
        }
        
        return outputList
    }

    const renderBrandItem = (item) => (
        <TreeNode key={item.key} {...item} />
    )

    const renderSubBrand = (item) => {
        return (
            <TreeNode title={item.title} key={item.key} dataRef={item}>
                {item.children &&
                    item.children.map(item => {
                        return item.children && item.children.length > 0 ? renderSubBrand(item) : renderBrandItem(item)
                    })}
            </TreeNode>
        )
    }
    
    const onSelect = (selectedKeys, info) => {
        setState({
            ...state,
            selectedKeys: selectedKeys[0],
            title: info.selectedNodes[0].props.title,
            url : info.selectedNodes[0].props.url
        })
    };
    
    // 메뉴 추가 하기
    const addBrand = () => {
        let tempList1 = [...state.brandData];
        
        let tempList2 = tempList1.filter((row) => row.key.length === state.selectedKeys.length + 1 && row.key.substr(0, state.selectedKeys.length) === state.selectedKeys);
        
        if (tempList2.length === 0) {
            tempList1.push({
                title: '새로운 브랜드',
                key: state.selectedKeys + '0',
                seq: 0
            })
        } else {
            tempList1.push({
                title: '새로운 브랜드',
                key: String(Number(tempList2.sort((a,b) => {return Number(b.key) - Number(a.key)})[0].key) + 1),
                seq: String(Number(tempList2.sort((a,b) => {return Number(b.seq) - Number(a.seq)})[0].seq) + 1)
            })
            
        }
        
        setState({
            ...state,
            brandData : tempList1
        })
    }
    
    // 메뉴 삭제 하기
    const removeBrand = () => {
        let tempList1 = [...state.brandData];
        
        let tempList2 = tempList1.filter((row) => row.key.substr(0, state.selectedKeys.length) === state.selectedKeys)
        
        if (tempList2.length !== 1) {
            alert("하위 메뉴가 존재 합니다. 하위메뉴를 삭제해 주세요")
            return false;
        } else {
            setState({
                ...state,
                brandData : tempList1.filter((row) => row.key.substr(0, state.selectedKeys.length) !== state.selectedKeys)
            })
        }
    }
    
    const handleInputChange = (event) => {
        let tempList1 = [...state.brandData];
        
        tempList1.forEach((row) => {
            if (row.key === state.selectedKeys) {
                row[event.target.name] = event.target.value
            }
        })
        
        setState({
            ...state,
            brandData: tempList1,
            [event.target.name] : event.target.value
        })
    }
    
    const openPopup = () => {
        if (state.selectedKeys !== '') {
            setIsModalVisible(true)
        } else {
            alert("카테고리를 먼저 선택해 주세요");
            return false
        }
    }
    
    const saveLists = () => {
        let tempList1 = [...state.brandData];
        
        tempList1.forEach((row) => {
            if (row.key === state.selectedKeys) {
                row.items = [...state.rowData];
                
            }
        })
        
        console.log(tempList1);
    }
    
    const removeGoods = () => {
        setState({
            ...state,
            rowData : []
        })
    }
    
    const columns = [
        {
            title: '상품명',
            dataIndex: 'assortNm',
            key: 'assortNm',
        },
        {
            title: '진열순서',
            dataIndex: 'seqNo',
            key: 'seqNo',
            render: (text,record) => (
                 <Input
                    name='seqNo'
                    value={record.seqNo != '' ? record.seqNo : 0}
                    onChange={(event) => {
                        let tempList1 = [...state.rowData];
                    
                        tempList1.forEach((row) => {
                            if (row.assortId === record.assortId) {
                                row.seqNo = event.target.value;
                            }
                        })
                        
                        setState({
                            ...state,
                            rowData : tempList1
                        })   
                    }}
                    className='fullWidth'
                />
            )
        },
        {
            title: 'PC 노출상태',
            dataIndex: 'PCStatus',
            key: 'PCStatus',
            render: (text, record) => {
                return (
                    <Select placeholder="모바일 노출상태" value={Common.trim(record.PCStatus) != '' ? record.PCStatus : '00'} style={{ width: 100 }} onChange={(value) => {
                        let tempList1 = [...state.rowData];
                    
                        tempList1.forEach((row) => {
                            if (row.assortId === record.assortId) {
                                row.PCStatus = value;
                            }
                        })
                        
                        setState({
                            ...state,
                            rowData : tempList1
                        })
                    }}>
                        <Option key='00'>노출안함</Option>
                        <Option key='01'>노출함</Option>
                    </Select>
                )
            }
        },
        {
            title: '모바일 노출상태',
            dataIndex: 'mBStatus',
            key: 'mBStatus',
            render: (text, record) => {
                return (
                    <Select placeholder="모바일 노출상태" value={Common.trim(record.mBStatus) != '' ? record.mBStatus : '00'} style={{ width: 100 }} onChange={(value) => {
                        let tempList1 = [...state.rowData];
                    
                        tempList1.forEach((row) => {
                            if (row.assortId === record.assortId) {
                                row.mBStatus = value;
                            }
                        })
                        
                        setState({
                            ...state,
                            rowData : tempList1
                        })
                    }}>
                        <Option key='00'>노출안함</Option>
                        <Option key='01'>노출함</Option>
                    </Select>
                )
            }
        },
        {
            title: '삭제',
            key: 'delete',
            render: (text, record) => (
            <span>
                <a onClick={() => {
                    let tempList1 = [...state.rowData];
                    
                    let tempList2 = tempList1.filter((row) => row.goodsKey !== record.goodsKey);
                        
                        setState({
                            ...state,
                            rowData : tempList2
                        })        
                }}>
                    Delete
                </a>
            </span>
            ),
        },
    ];
    
    return (
        <>
            <CustomBreadcrumb style={{ marginBottom: '0px' }} arr={['상품', '브랜드관리']}></CustomBreadcrumb>
            <Row gutter={[16, 16]}>
                <Col span={12}>
                    <Row type='flex' justify='start' gutter={[16, 8]}>
                        <Col style={{ width: '150px' }}>
                            <Button type='primary' className='fullWidth' onClick={addBrand}>
                                브랜드추가
                            </Button>
                        </Col>
                        <Col style={{ width: '150px' }}>
                            <Button type='primary' className='fullWidth' onClick={removeBrand}>
                                브랜드삭제
                            </Button>
                        </Col>
                    </Row>
                </Col>
                <Col span={12}>
                    <Row type='flex' justify='end' gutter={[16, 8]}>
                         <Col style={{ width: '150px' }}>
                            <Button type='primary' className='fullWidth' onClick={openPopup}>
                                상품추가
                            </Button>
                        </Col>
                        <Col style={{ width: '150px' }}>
                            <Button type='primary' className='fullWidth' onClick={saveLists}>
                                저장
                            </Button>
                        </Col>
                    </Row>
                </Col>
            </Row>
            <Row gutter={[16, 8]}>
                <Col span={8}>
                    <Row style={{backgroundColor:'#FFFFFF', width : '100%', overflowY:'scroll', height : props.height}}>
                        <Tree onSelect={onSelect}>
                            {state.brandTree &&
                                state.brandTree.map(item => {
                                    return item.children && item.children.length > 0 ? renderSubBrand(item) : renderBrandItem(item)
                                }
                            )}
                        </Tree>
                    </Row>
                </Col>
                <Col span={16}>
                    <Row gutter={[16, 8]}>
                        <Col span={20}>
                            <Row gutter={[16, 8]} className='onVerticalCenter marginTop-10'>
                                <Col span={4}>
                                    <Text className='font-15 NanumGothic-Regular' strong>
                                        브랜드명
                                    </Text>
                                </Col>
                                <Col span={20}>
                                    <Input
                                        name='title'
                                        value={state.title}
                                        onChange={handleInputChange}
                                        placeholder='brandNm'
                                        className='fullWidth'
                                    />
                                </Col>
                            </Row>
                            <Row gutter={[16, 8]} className='onVerticalCenter marginTop-10'>
                                <Col span={4}>
                                    <Text className='font-15 NanumGothic-Regular' strong>
                                        브랜드URL
                                    </Text>
                                </Col>
                                <Col span={20}>
                                    <Input
                                        name='url'
                                        value={state.url}
                                        onChange={handleInputChange}
                                        placeholder='brandUrl'
                                        className='fullWidth'
                                    />
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                    <Row gutter={[16, 16]}>
                        <Col span={24}>
                            <Row type='flex' justify='end' gutter={[16, 8]}>
                                <Col style={{ width: '150px' }}>
                                    <Button type='primary' className='fullWidth' onClick={removeGoods}>
                                        상품일괄삭제
                                    </Button>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                    <Row gutter={[16, 16]}>
                        <Col>
                            <Table columns={columns} dataSource={state.rowData}  style={{height : props.height - 100, overflowY : 'scroll'}}/>
                        </Col>
                    </Row>
                </Col>
            </Row>
            <div>
                <GoodsSearchList
                    rowSelection={'multiple'}
                    isModalVisible={isModalVisible}
                    setIsModalVisible={setIsModalVisible}
                    backState={state}
                    setSpin={props.setSpin}
                    setBackState={setState}></GoodsSearchList>
            </div>
        </>
    )
}

export default withRouter(BrandList)
