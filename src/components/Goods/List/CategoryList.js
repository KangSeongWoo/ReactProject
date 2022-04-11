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

const CategoryList = props => {
    const { userId } = props;
    const [isModalVisible, setIsModalVisible] = useState(false)
    
    const [state, setState] = useState({
        selectedKeys: '',
        categoryNm: '',
        categoryId : '',
        categoryData: [
            {
                categoryId : "A00000000",
                upperCategoryId : "",
                categoryNm : "root",
                isBottonYn : "02"
            },
            {
                categoryId : "A00000001",
                upperCategoryId : "A00000000",
                categoryNm : "FURNITURE",
                isBottonYn : "02"
            },
            {
                categoryId : "A00000002",
                upperCategoryId : "A00000001",
                categoryNm : "SOFA",
                isBottonYn : "02"
            },
            {
                categoryId : "A00000003",
                upperCategoryId : "A00000002",
                categoryNm : "SOFA (1 seat)",
                isBottonYn : "01"
            },
            {
                categoryId : "A00000004",
                upperCategoryId : "A00000000",
                categoryNm : "LIGHTING",
                isBottonYn : "02"
            },
            {
                categoryId : "A00000005",
                upperCategoryId : "A00000004",
                categoryNm : "WALL / CEILING",
                isBottonYn : "02"
            },
            {
                categoryId : "A00000006",
                upperCategoryId : "A00000005",
                categoryNm : "다운 라이트",
                isBottonYn : "01"
            }
        ],
        rowData : [],
        menuTree : []
    })
    
    // 화면 그려지기 전에 호출
    useLayoutEffect(() => {
        window.addEventListener('resize', () => props.setHeight());
        props.setHeight();
        //setInit()
    }, [])
    
    useEffect(() => {
        let tempList = JSON.parse(JSON.stringify(state.categoryData));
        
        let categoryTree = makeCategoryTree(tempList, [], '');
        setState({
            ...state,
            categoryTree : categoryTree
        })
    },[state.categoryData])
    
    const makeCategoryTree = (inputList,outputList, upperId) => {
        let tempList = [];
        
        tempList = inputList.filter((row) => row.upperCategoryId === upperId);
        
        if (tempList.length == 0) {
            return outputList;
        }
        
        for (let i = 0; i < tempList.length; i++){
            if (tempList[i].children == undefined) {
                tempList[i].children = [];
            }
            makeCategoryTree(inputList, tempList[i].children, tempList[i].categoryId)
            outputList.push(tempList[i]);
        }
        
        return outputList
    }

    const renderCategoryItem = (item) => (
        <TreeNode title={item.categoryNm} key={item.categoryId} dataRef={item} />
    )

    const renderSubCategory = (item) => {
        return (
            <TreeNode title={item.categoryNm} key={item.categoryId} dataRef={item}>
                {item.children &&
                    item.children.map(item => {
                        return item.children && item.children.length > 0 ? renderSubCategory(item) : renderCategoryItem(item)
                    })}
            </TreeNode>
        )
    }
    
    const onSelect = (selectedKeys, info) => {
        setState({
            ...state,
            selectedKeys: selectedKeys[0],
            categoryNm: info.selectedNodes[0].props.dataRef.categoryNm,
            categoryId : info.selectedNodes[0].props.dataRef.categoryId
        })
        console.log('selected', selectedKeys, info);
    };
    
    // 메뉴 추가 하기
    const addCategory = () => {
        let tempList1 = [...state.categoryData];
        
        let tempList2 = tempList1.filter((row) => row.upperCategoryId === state.selectedKeys);
        
        if (tempList2.length === 0) {
            tempList1.push({
                categoryNm: '새로운 카테고리',
                categoryId: getNextCategoryId(getLastCategoryId()),
                upperCategoryId : state.selectedKeys,
                seq: 0
            })
        } else {
            tempList1.push({
                categoryNm: '새로운 카테고리',
                categoryId: getNextCategoryId(getLastCategoryId()),
                upperCategoryId : state.selectedKeys,
                seq: String(Number(tempList2.sort((a,b) => {return Number(b.seq) - Number(a.seq)})[0].seq) + 1)
            })
        }
        
        setState({
            ...state,
            categoryData : tempList1
        })
    }
    
    // 메뉴 삭제 하기
    const removeCategory = () => {
        let tempList1 = [...state.categoryData];
        
        let tempList2 = tempList1.filter((row) => row.upperCategoryId === state.selectedKeys)
        
        if (tempList2.length !== 0) {
            alert("하위 카테고리가 존재 합니다. 하위 카테고리가를 삭제해 주세요")
            return false;
        } else {
            setState({
                ...state,
                categoryData : tempList1.filter((row) => row.categoryId !== state.selectedKeys)
            })
        }
    }
    
    const handleInputChange = (event) => {
        let tempList1 = [...state.categoryData];
        
        tempList1.forEach((row) => {
            if (row.categoryId === state.selectedKeys) {
                row[event.target.name] = event.target.value
            }
        })
        
        setState({
            ...state,
            categoryData: tempList1,
            [event.target.name] : event.target.value
        })
    }
    
    const openPopup = () => {
        setState({
            ...state,
            rowData : []
        })
        if (state.selectedKeys !== '') {
            setIsModalVisible(true)
        } else {
            alert("카테고리를 먼저 선택해 주세요");
            return false
        }
    }
    
    const saveLists = () => {
        let tempList1 = [...state.categoryData];
        
        tempList1.forEach((row) => {
            if (row.categoryId === state.selectedKeys) {
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
    
    // 마지막 카테고리 번호 얻기
    const getLastCategoryId = () => {
        return state.categoryData.sort((a,b) => {
            return b.categoryId.substr(1,b.categoryId.length) - a.categoryId.substr(1,a.categoryId.length)
        })[0].categoryId
    }
    
    // 다음 카테고리 번호 얻기
    const getNextCategoryId = (target) => {
        return target.substr(0,1) + Common.leadingZeros(Number(target.substr(1,target.length)) + 1, 8)
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
            <CustomBreadcrumb style={{ marginBottom: '0px' }} arr={['상품', '카테고리관리']}></CustomBreadcrumb>
            <Row gutter={[16, 16]}>
                <Col span={12}>
                    <Row type='flex' justify='start' gutter={[16, 8]}>
                        <Col style={{ width: '150px' }}>
                            <Button type='primary' className='fullWidth' onClick={addCategory}>
                                카테고리추가
                            </Button>
                        </Col>
                        <Col style={{ width: '150px' }}>
                            <Button type='primary' className='fullWidth' onClick={removeCategory}>
                                카테고리삭제
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
                            {state.categoryTree &&
                                state.categoryTree.map(item => {
                                    return item.children && item.children.length > 0 ? renderSubCategory(item) : renderCategoryItem(item)
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
                                        카테고리명
                                    </Text>
                                </Col>
                                <Col span={20}>
                                    <Input
                                        name='categoryNm'
                                        value={state.categoryNm}
                                        onChange={handleInputChange}
                                        placeholder='categoryNm'
                                        className='fullWidth'
                                    />
                                </Col>
                            </Row>
                            {/* <Row gutter={[16, 8]} className='onVerticalCenter marginTop-10'>
                                <Col span={4}>
                                    <Text className='font-15 NanumGothic-Regular' strong>
                                        카테고리I
                                    </Text>
                                </Col>
                                <Col span={20}>
                                    <Input
                                        name='url'
                                        value={state.url}
                                        onChange={handleInputChange}
                                        placeholder='categoryUrl'
                                        className='fullWidth'
                                    />
                                </Col>
                            </Row> */}
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
                            <Table columns={columns} dataSource={state.rowData} style={{height : props.height - 100, overflowY : 'scroll'}} />
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

export default withRouter(CategoryList)
