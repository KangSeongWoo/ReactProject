import React, { useState, useLayoutEffect, useCallback } from 'react'
import CustomBreadcrumb from '/src/utils/CustomBreadcrumb'
import {
    Layout,
    Input,
    Select,
    Row,
    Col,
    Button,
    DatePicker,
    message,
    Typography,
    Divider,
    Table,
    InputNumber,
    Modal
} from 'antd'
import TrdstTable from '../Component/TrdstTable'
import '/src/style/custom.css'
import * as moment from 'moment'
import Https from '../../../api/http'
import * as Common from '../../../utils/Common.js'

const { Option } = Select
const { TextArea } = Input
const { Text } = Typography

const Create = props => {
    const { userId } = props

    const [ownerList, setOwnerList] = useState([])
    const [storageList, setStorageList] = useState([])
    const [isModalVisible, setIsModalVisible] = useState(false)
    const [orderList, setOrderList] = useState([])
    const [saveOrderList, setSaveOrderList] = useState([])
    const [stateRowkey, setStateRowkey] = useState([])
    const [selectedList, setSelectedList] = useState([])

    const [state, setState] = useState({
        assortId: '',
        assortNm: '',
        purchaseDt: moment(),
        vendorId: '',
        purchaseVendorNm: '',
        storageId: '',
        terms: '',
        delivery: '',
        payment: '',
        carrier: '',
        siteOrderNo: '',
        purchaseVendorList: [],
        selectedRowKeys: []
    })

    const [detailInfo, setDetailInfo] = useState({})

    const purchaseVendorColumns = [
        { title: '구매처', dataIndex: 'purchaseVendorId', key: 'purchaseVendorId' },
        { title: '구매처명', dataIndex: 'purchaseVendorName', key: 'purchaseVendorName' },
        { title: '주문수량', dataIndex: 'purchaseVendorQty', key: 'purchaseVendorQty' }
    ]

    const searchDetailInfo = async record => {
        let res = []

        try {
            res = await Https.getOrderOne(record)

            console.log('---------------------------------------------------')
            console.log(JSON.stringify(res))
        } catch (error) {
            console.error(error)
        } finally {
            setDetailInfo({
                ...record,
                ...res.data.data
            })
        }
    }

    const productListColumns = [
        {
            title: '주문번호',
            dataIndex: 'orderId',
            key: 'orderId',
            checkbox: true,
            render: row => {
                return (
                    <span>
                        <a
                            onClick={() => {
                                row.detailView = true
                                searchDetailInfo(row)
                            }}>
                            {row.orderId}
                        </a>
                    </span>
                )
            }
        },
        { title: '고도몰주문번호', dataIndex: 'channelOrderNo', key: 'channelOrderNo' },
        { title: '주문일시', dataIndex: 'orderDate', key: 'orderDate' },
        { title: '주문자명', dataIndex: 'custNm', key: 'custNm', searchField: true },
        {
            title: '이미지',
            dataIndex: 'imagePath',
            key: 'imagePath',
            render: record => {
                return (
                    <div style={{ width: '40px', textAlign: 'center' }}>
                        <img
                            style={{ maxWidth: '100%' }}
                            src={record.imagePath}
                            onClick={() => showImages(record.imagePath)}
                        />
                    </div>
                )
            }
        },
        { title: '상품명', dataIndex: 'assortNm', key: 'assortNm' },
        { title: '수량', dataIndex: 'purchaseQty', key: 'purchaseQty' }
    ]

    let index = 0

    const selectedListColumns = [
        {
            title: '번호',
            dataIndex: 'index',
            key: 'index',
            render: (text, record) => {
                return <div>{++index}</div>
            }
        },
        {
            title: '주문번호',
            dataIndex: 'orderId',
            key: 'orderId'
        },
        { title: '주문자명', dataIndex: 'custNm', key: 'custNm' },
        {
            title: '이미지',
            dataIndex: 'imagePath',
            key: 'imagePath',
            render: (text, record) => {
                return (
                    <div style={{ width: '40px', textAlign: 'center' }}>
                        <img
                            style={{ maxWidth: '100%' }}
                            src={record.imagePath}
                            onClick={() => showImages(record.imagePath)}
                        />
                    </div>
                )
            }
        },
        { title: '모델번호', dataIndex: 'modelNo', key: 'modelNo' },
        { title: '상품명', dataIndex: 'assortNm', key: 'assortNm' },
        { title: '옵션', dataIndex: 'optionNm', key: 'optionNm' },
        { title: '원산지', dataIndex: 'origin', key: 'origin' },
        { title: '카테고리', dataIndex: 'custCategory', key: 'custCategory' },
        { title: '재질', dataIndex: 'material', key: 'material' },
        { title: '발주수량', dataIndex: 'purchaseQty', key: 'purchaseQty' },
        { title: 'RRP', dataIndex: 'rrp', key: 'rrp' },
        { title: '할인율', dataIndex: 'discountRate', key: 'discountRate' },
        {
            title: '발주가',
            dataIndex: 'purchasePrice',
            key: 'purchasePrice',
            render: (text, record) => (
                <InputNumber
                    id='purchasePrice'
                    formatter={value => {
                        let regex = /^(\d{1,10})([.]\d{0,2}?)?$/

                        if (regex.test(value)) {
                            return value.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                        } else {
                            return String(record.purchasePrice).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                        }
                    }}
                    style={{
                        width: '80px'
                    }}
                    defaultValue={record.purchasePrice}
                    onChange={e => {
                        let regex = /^(\d{1,10})([.]\d{0,2}?)?$/

                        if (regex.test(e)) {
                            record.purchasePrice = e
                        }
                        return record
                    }}
                />
            )
        }
    ]

    // 화면 진입시 랜더링 하기 전에
    useLayoutEffect(() => {
        document.addEventListener('keyup', hotkeyFunction)
        setInit()
    }, [])

    const hotkeyFunction = useCallback(event => {
        if (event.key == 'F8') {
            document.querySelector('.search').click()
        }
    }, [])

    // 화면 초기화
    const setInit = async () => {
        try {
            props.setSpin(true)

            let res = await Https.getStorageList() // 구매처, 창고 데이터 호출
            console.log('---------------------------------------------------')
            console.log(res)

            let storageList = res.data.data.Storages
            storageList = storageList.filter(element => element.value != '000001')

            setStorageList(storageList) // 창고 관련 State
        } catch (error) {
            console.error(error)
        } finally {
            props.setSpin(false)
        }
    }

    // value Onchange
    const onValueChange = (field, value) => {
        setState({
            ...state,
            [field]: value
        })
    }
    const callGetPurchaseVendors = () => {
        getPurchaseVendors()
        setOrderList([])
        setSaveOrderList([])
        setState({
            ...state,
            vendorId: '',
            purchaseVendorNm: ''
        })
    }

    // 구매처 조회시 구매처 목록 가져오기
    const getPurchaseVendors = () => {
        props.setSpin(true)
        return Https.getPurchaseVendors()
            .then(response => {
                console.log(response)

                setOwnerList(response.data.data)

                props.setSpin(false)
            })
            .catch(error => {
                Common.commonNotification({
                    kind: 'error',
                    message: '에러 발생',
                    description: '잠시후 다시 시도해 주세요'
                })
                console.error(error)
                props.setSpin(false)
            }) // ERROR
    }

    const getPurchaseVendorsItem = (vendorId, ownerNm) => {
        props.setSpin(true)

        return Https.getPurchaseVendorsItem(vendorId)
            .then(response => {
                console.log(response)

                response.data.data.forEach(row => {
                    row.orderDate = moment(row.orderDate).format('YYYY-MM-DD HH:mm:ss')
                    row.purchasePrice = Number(
                        Number(row.purchaseQty) * (Number(row.rrp) * (1 - Number(row.discountRate) / 100)).toFixed(2)
                    )
                })

                setOrderList(response.data.data)

                setState({
                    ...state,
                    vendorId: vendorId,
                    purchaseVendorNm: ownerNm
                })

                props.setSpin(false)
                //document.getElementsByClassName('ant-input-number-handler-wrap')[0].remove()
            })
            .catch(error => {
                Common.commonNotification({
                    kind: 'error',
                    message: '에러 발생',
                    description: '잠시후 다시 시도해 주세요'
                })
                console.error(error)
                props.setSpin(false)
            }) // ERROR
    }

    const savePurchase = e => {
        const { vendorId, purchaseDt, storageId, siteOrderNo } = state

        if (vendorId == '' || vendorId == '000000') {
            alert('구매처를 선택해 주세요')
            e.target.disabled = false
            return false
        }

        if (purchaseDt == '') {
            alert('발주일자를 확인해 주세요')
            e.target.disabled = false
            return false
        }

        if (storageId == '') {
            alert('입고창고를 선택해 주세요')
            e.target.disabled = false
            return false
        }

        if (saveOrderList.length == 0) {
            alert('발주등록할 상품을 선택해 주세요.')
            e.target.disabled = false
            return false
        }

        let flag = false //발주가 관련 Flag
        saveOrderList.forEach(row => {
            if (row.purchasePrice == undefined) {
                flag = true
                return false
            }
        })

        if (flag) {
            alert('발주가를 확인해 주세요.')
            return false
        }

        props.setSpin(true)
        const config = { headers: { 'Content-Type': 'application/json' } }

        let items = []

        saveOrderList.map(item => {
            let o = {
                orderId: Common.trim(item.orderId),
                orderSeq: Common.trim(item.orderSeq),
                assortId: Common.trim(item.assortId),
                itemId: Common.trim(item.itemId),
                purchaseQty: Common.trim(item.purchaseQty),
                purchaseUnitAmt: Common.trim(item.purchasePrice)
            }

            items.push(o)
        })

        let purchase = {
            storageId: Common.trim(storageId),
            purchaseGb: '01',
            vendorId: Common.trim(vendorId),
            siteOrderNo: Common.trim(siteOrderNo),
            purchaseDt: Common.trim(purchaseDt.format('YYYY-MM-DD HH:mm:ss')),
            purchaseStatus: '01',
            items: items,
            dealtypeCd: '01',
            userId: Common.trim(userId)
        }

        console.log(purchase)

        return Https.postAddPurchase(purchase, config)
            .then(response => {
                message.success('저장 성공')
                console.log(response)

                let tempOrderList = orderList

                saveOrderList.forEach(element1 => {
                    tempOrderList = tempOrderList.filter(element2 => element2.orderCd != element1.orderCd)
                })

                setOrderList(tempOrderList)

                setState({
                    ...state,
                    siteOrderNo: ''
                })

                setStateRowkey([])
                setSaveOrderList([])
                getPurchaseVendors()
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

    const rowSelection1 = {
        type: 'radio',
        onChange: (selectedRowKeys, selectedRows) => {
            setSaveOrderList([])
            setStateRowkey([])
            console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows)
            getPurchaseVendorsItem(selectedRows[0].purchaseVendorId, selectedRows[0].purchaseVendorName)
        }
    }

    const showImages = imageAddress => {
        let data = imageAddress
        window
            .open(
                data,
                '이미지 미리보기' + new Date(),
                'toolbar=no,location=no,directories=no,status=no,scrollbars=yes,resizable=no,width=710,height=1502,top=, left= '
            )
            .focus()
    }

    return (
        <Layout>
            <Modal
                title='상세정보'
                visible={detailInfo != undefined ? detailInfo.detailView : false}
                onOk={() => {
                    setDetailInfo({
                        ...detailInfo,
                        detailView: false
                    })
                }}
                onCancel={() => {
                    setDetailInfo({
                        ...detailInfo,
                        detailView: false
                    })
                }}
                footer={[<></>]}>
                <Text className='font-15 NanumGothic-Regular' strong>
                    수령자명
                </Text>
                <span>
                    <p>{detailInfo.deliNm}</p>
                </span>
                <Text className='font-15 NanumGothic-Regular' strong>
                    수령자 주소
                </Text>
                <span>
                    <p>{detailInfo.deliAddr1}</p>
                </span>
                <Text className='font-15 NanumGothic-Regular' strong>
                    수령자 상세주소
                </Text>
                <span>
                    <p>{detailInfo.deliAddr2}</p>
                </span>
                <Text className='font-15 NanumGothic-Regular' strong>
                    수령자 우편번호
                </Text>
                <span>
                    <p>{detailInfo.custZipcode}</p>
                </span>
                <Text className='font-15 NanumGothic-Regular' strong>
                    전화번호 / 휴대폰번호
                </Text>
                <span>
                    <p>
                        {detailInfo.custTel} / {detailInfo.deliHp}
                    </p>
                </span>
                <Text className='font-15 NanumGothic-Regular' strong>
                    수령자 개인통관고유부호
                </Text>
                <span>
                    <p>{detailInfo.custPcode}</p>
                </span>
            </Modal>

            <div className='notice-header'>
                <CustomBreadcrumb arr={['발주', '발주등록(주문)']}></CustomBreadcrumb>
            </div>

            <div className='notice-wrapper' style={{ overflowY: 'scroll', height: '800px' }}>
                <Row style={{ marginTop: '14px' }}>
                    <Col span={7} style={{ paddingRight: '12px' }}>
                        <div className=''>
                            <div style={{ marginBottom: '4px' }}>
                                <Button type='primary' className='search' onClick={callGetPurchaseVendors}>
                                    조회
                                </Button>
                            </div>
                        </div>
                    </Col>
                    <Col span={17}>
                        <div style={{ marginBottom: '4px' }}>
                            {/* <Button onClick={showGoodsSearCh}>상품추가</Button> */}
                            <Button type='primary' onClick={savePurchase}>
                                저장
                            </Button>
                        </div>
                    </Col>
                </Row>
                <Row gutter={[16, 8]} className='onVerticalCenter marginTop-10'>
                    <Col span={4}>
                        <Text className='font-15 NanumGothic-Regular' strong>
                            구매처*
                        </Text>
                    </Col>
                    <Col span={8}>
                        <Select
                            placeholder='구매처를 선택하세요'
                            className='fullWidth'
                            showSearch
                            showArrow
                            onChange={v => onValueChange('vendorId', v)}
                            optionFilterProp='children'
                            filterOption={(input, option) =>
                                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                            value={state.vendorId != '' ? state.vendorId : undefined}>
                            {ownerList.map(item => (
                                <Option key={item.purchaseVendorId}>{item.purchaseVendorName}</Option>
                            ))}
                        </Select>
                    </Col>
                    <Col span={4}>
                        <Text className='font-15 NanumGothic-Regular' strong>
                            발주일자*
                        </Text>
                    </Col>
                    <Col span={8}>
                        <DatePicker
                            className='fullWidth'
                            showTimep
                            format='YYYY-MM-DD HH:mm:ss'
                            defaultValue={moment(state.purchaseDt)}
                            placeholder='Start'
                            onChange={(date, dateString) => {
                                onValueChange('purchaseDt', moment(dateString))
                            }}
                        />
                    </Col>
                </Row>
                <Row gutter={[16, 8]} className='onVerticalCenter marginTop-10'>
                    <Col span={4}>
                        <Text className='font-15 NanumGothic-Regular' strong>
                            입고창고*
                        </Text>
                    </Col>
                    <Col span={8}>
                        <Select
                            placeholder='입고창고를 선택하세요'
                            className='fullWidth'
                            showSearch
                            showArrow
                            onChange={v => onValueChange('storageId', v)}
                            optionFilterProp='children'
                            filterOption={(input, option) =>
                                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                            value={state.storageId != '' ? state.storageId : undefined}>
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
                        <Input
                            className='fullWidth'
                            value={state.siteOrderNo}
                            onChange={e => onValueChange('siteOrderNo', e.target.value)}
                        />
                    </Col>
                </Row>
                <Row style={{ marginTop: '14px' }}>
                    <Col span={7} style={{ paddingRight: '12px' }}>
                        <div className=''>
                            <Table
                                size='small'
                                pagination={false}
                                columns={purchaseVendorColumns}
                                rowKey={'purchaseVendorId'}
                                dataSource={ownerList}
                                rowSelection={rowSelection1}
                                style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: '500px' }}
                            />
                        </div>
                    </Col>
                    <Col span={17}>
                        {React.useMemo(() => {
                            return (
                                <TrdstTable
                                    name='productList'
                                    columns={productListColumns}
                                    rowKey={'orderKey'}
                                    dataSource={orderList}
                                    setDataSource={setOrderList}
                                    saveOrderList={saveOrderList}
                                    setSaveOrderList={setSaveOrderList}
                                    stateRowkey={stateRowkey}
                                    setStateRowkey={setStateRowkey}
                                />
                            )
                        }, [orderList, saveOrderList])}
                    </Col>
                </Row>

                <Row>
                    <Col span={24}>
                        <Divider style={{ margin: '10px 0' }} />
                        <Table
                            name='selectedList'
                            size='small'
                            rowKey={'orderKey'}
                            pagination={false}
                            columns={selectedListColumns}
                            dataSource={saveOrderList}
                            style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: '500px' }}
                        />
                    </Col>
                </Row>
            </div>
        </Layout>
    )
}

//export default Create
export default React.memo(Create)
