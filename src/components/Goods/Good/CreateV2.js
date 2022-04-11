import React, { useCallback, useLayoutEffect, useState,useEffect , useMemo } from 'react'
import { withRouter } from 'react-router-dom'
import CustomBreadcrumb from '/src/utils/CustomBreadcrumb'
import * as Constans from '../../../utils/Constans'
import {
    Layout,
    Input,
    Icon,
    Cascader,
    Select,
    Row,
    Col,
    Button,
    Modal,
    DatePicker,
    InputNumber,
    Divider,
    Upload,
    Tabs,
    Card,
    Typography,
    Table,
    Radio,
} from 'antd'
import '/src/style/custom.css'
import * as moment from 'moment'
import Https from '../../../api/http'
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-alpine.css'
import BrandSearch from '../../Common/Brand/Search'
import PurchaseVendorSearch from '../../Common/Purchase/VendorList'
import OptionList from './OptionList'
import * as Common from '../../../utils/Common.js'
import SunEditor from 'suneditor-react'
import plugins from 'suneditor/src/plugins'
import { ko } from 'suneditor/src/lang'
import queryStirng from 'query-string'
import '/src/style/suneditor.min.css'

const { Option } = Select
const { RangePicker } = DatePicker
const { TabPane } = Tabs
const { Text } = Typography
const { TextArea } = Input

function getUUID() {
    // UUID v4 generator in JavaScript (RFC4122 compliant)
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (Math.random() * 16) | 0,
            v = c == 'x' ? r : (r & 3) | 8
        return v.toString(16)
    })
}

const CreateV2 = props => {
    const { userId } = props

    const [isBrandVisible, setIsBrandVisible] = useState(false)
    const [isPurchaseVendorVisible, setIsPurchaseVendorVisible] = useState(false)
    const [previewVisible, setPreviewVisible] = useState(false)
    const [description, setDescription] = useState('')

    const [state, setState] = useState({
        masterId : '',
        productNm : '',
        productDnm : '',
        productEnm : '',
        productModel : '',
        supplierId : '',
        salePrice: '',
        offlineSalePrice : '',
        overseasSalePrice : '',
        optionValue1 : '빨강',
        optionValue2 : 'S',
        optionValue3 : '나무',
        optionValue4 : '등등',
        optionValue5 : '크크',
        goodsDescription : '',
        shortDescription : '',
        brandId : '',
        categoryId : '',
        stockCnt : '',
        saleYn : false,
        displayYn: false,
        optionKeys: {
            optionKey1: '색상',
            optionKey2: '사이즈',
            optionKey3: '재질',
            optionKey4: '옵션1',
            optionKey5: '옵션2',
        },
        addInfos: [],
        mainImage : [],
        addImage : [],
        userId: userId
    })

    const hotkeyFunction = useCallback(event => {
        if (event.key == 'F2') {
            refresh()
        }
    }, [])
    
    useEffect(() => {
        setState({
            ...state,
            goodsDescription: description
        })
    }, [description])

    useLayoutEffect(() => {
        window.addEventListener('resize', () => props.setHeight());
        props.setHeight();
        setInit()
        document.addEventListener('keyup', hotkeyFunction)
    }, [])
   
    // 화면 초기화
    const setInit = async () => {
        try {
            const res = await Https.getFullCategories() //카테고리 리스트 조회

            setState({
                ...state,
                categories: res.data.data.categoryList
            })
        } catch (error) {
            console.error(error)
        }
    }

    // 메인 이미지 프리뷰 종료
    const handlePreviewCancel = () => {
        previewVisible(false)
    }

    // 메인, 추가 이미지 변경시
    const handleChange = info => {
        const { fileList } = info

        console.log(info)

        setState({
            ...state,
            fileList
        })
    }

    // Input Handle Change
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

    // Select Box Handle Change
    const handleSelectChange = (name, value) => {
        setState({
            ...state,
            [name]: value
        })
    }

    // 브랜드 Modal Open
    const showBrandModal = () => {
        setIsBrandVisible(true)
    }

    // 구매자 검색 팝업 오픈
    const showPurchaseVendorSearchModal = () => {
        setIsPurchaseVendorVisible(true)
    }

    const onValueChange = (field, value) => {
        console.log(field)
        console.log(value)
        setState({
            ...state,
            [field]: value
        })
    }

    const createGoods = () => {
        const config = { headers: { 'Content-Type': 'application/json' } }

        Https.postSaveGoodsV2(state, config)
            .then(response => {
                props.setSpin(false)
                let url = '/Goods/editV2?' + queryStirng.stringify(response.data.data)
                props.history.push(url)
            }) // SUCCESS
            .catch(error => {
                props.setSpin(false)
                Common.commonNotification({
                    kind: 'error',
                    message: '에러 발생',
                    description: '잠시후 다시 시도해 주세요'
                })
                console.error(error)
            }) // ERROR
    }

    const deleteImage = (imageGb, uid) => {
        console.log(imageGb)
        Https.postDeleteImage(uid)
            .then(res => {
                console.log(res)

                const { mainImage } = state
                const { addImage } = state

                if (imageGb == 'main') {
                    onValueChange(
                        'mainImage',
                        mainImage.filter(inFile => inFile.uid !== uid)
                    )
                } else if (imageGb == 'add') {
                    onValueChange(
                        'addImage',
                        addImage.filter(inFile => inFile.uid !== uid)
                    )
                }
            })
            .catch(err => {
                console.error(err)
                Common.commonNotification({
                    kind: 'error',
                    message: '에러 발생',
                    description: '잠시후 다시 시도해 주세요'
                })
            })
    }

    const mainImageRemoveConfirm = file => {
        console.log('mainImageRemoveConfirm')
        let uid = file.uid

        Modal.confirm({
            title: 'Confirm',
            content: '삭제하시겠습니까?',
            okText: 'ok',
            cancelText: 'cancel',
            onOk: () => {
                deleteImage('main', uid)
            }
        })
    }

    const addImageRemoveConfirm = file => {
        console.log('addImageRemoveConfirm')
        let uid = file.uid

        Modal.confirm({
            title: 'Confirm',
            content: '삭제하시겠습니까?',
            okText: 'ok',
            cancelText: 'cancel',
            onOk: () => {
                deleteImage('add', uid)
            }
        })
    }

    const sendImage = async file => {
        //동기처리예제
        const formData = new FormData()
        formData.append('imageGb', '03')
        formData.append('file', file)
        formData.append('userId', userId)

        const config = { headers: { 'Content-Type': 'multipart/form-data' } }

        let apiUrl = process.env.REACT_APP_API_URL + '/file/uploadFile'

        let url
        return await Https.postUploadImage(formData, config)
            .then(response => {
                let list = response.data.data
                console.log(list)
                return response.data.data.url
            }) // SUCCESS
            .catch(error => {
                console.error(error)
                Common.commonNotification({
                    kind: 'error',
                    message: '에러 발생',
                    description: '잠시후 다시 시도해 주세요'
                })
                url = ''
                return url
            }) // ERROR
    }

    // 메인, 추가 이미지가 올라가지 않았을때, 디폴트 이미지
    const uploadButton = (
        <div>
            <Icon type='plus' />
            <div className='ant-upload-text'>Upload</div>
        </div>
    )

    const onChangeCategory = (value, label) => {
        setState({
            ...state,
            categoryValue: value,
            categoryLabel: label.map(o => o.label).join(' > ')
        })
    }

    const refresh = () => {
        setState({
            ...state,
            masterId : '',
            productNm : '',
            productDnm : '',
            productEnm : '',
            productModel : '',
            salePrice : '',
            offlineSalePrice : '',
            overseasSalePrice : '',
            optionValue1 : '',
            optionValue2 : '',
            optionValue3 : '',
            optionValue4 : '',
            optionValue5 : '',
            goodsDescription : '',
            shortDescription : '',
            supplierId : '',
            vendorId : '',
            brandId : '',
            categoryId : '',
            stockCnt : '',
            saleYn : false,
            displayYn : false,
            mainImage : [],
            addImage : [],
        })
    }

    const changeGoodsDescription = event => {
        setDescription(event)
    }

    const simpleContentChange = event => {
        setState({
            ...state,
            shortDescription: event.target.value
        })
    }

    const onImageUploadBefore = async (files, info, uploadHandler) => {
        console.log('files : ' + JSON.stringify(files))
        console.log('info : ' + JSON.stringify(info))
        console.log('uploadHandler : ' + JSON.stringify(uploadHandler))

        let result = await sendImage(files[0])

        // result
        const response = {
            // The response must have a "result" array.
            result: [
                {
                    url: result,
                    name: files[0].name,
                    size: files[0].size
                }
            ]
        }

        uploadHandler(response)
    }
    
    // 마스터 팝업 화면 이동
    const masterPopup = e => {
        e.data = [];
        e.data.displayKd = 'POP'
        let url = '/#/Goods/masterPopup?' + queryStirng.stringify(e.data)

        window
            .open(
                url,
                '상세' + new Date(),
                'toolbar=no,location=no,directories=no,status=no,scrollbars=yes,resizable=no,width=1210,height=702,top=, left= '
            )
            .focus()
    }
    
    return (
        <Layout>
            <div className='notice-header'>
                <CustomBreadcrumb arr={['상품', '상품등록']}></CustomBreadcrumb>
            </div>

            <div className='notice-wrapper'>
                <div className='notice-content' style={{ width: '100%', overflowY: 'scroll', height: props.height }}>
                    <Row type='flex' justify='end' gutter={16}>
                         <Col style={{ width: '150px' }}>
                            <Button type='primary' className='fullWidth' onClick={masterPopup}>
                                마스터 등록
                            </Button>
                        </Col>
                        <Col style={{ width: '150px' }}>
                            <Button type='primary' className='fullWidth' onClick={refresh} ghost>
                                초기화
                            </Button>
                        </Col>
                        <Col style={{ width: '150px' }}>
                            <Button type='primary' className='fullWidth' onClick={createGoods}>
                                저장
                            </Button>
                        </Col>
                    </Row>
                    <div>
                        <Tabs defaultActiveKey='1' tabPosition={'top'}>
                            <TabPane tab={`상품기본설정`} key={1} style={{padding : '15px'}}>
                                <Row gutter={[16, 8]} className='onVerticalCenter'>
                                    <Col span={2}>
                                        <Text className='font-15 NanumGothic-Regular' strong>
                                            상품명
                                        </Text>
                                    </Col>
                                    <Col span={4}>
                                        <Input name='productNm' value={state.productNm} onChange={handleInputChange} />
                                    </Col>
                                    <Col span={2}>
                                        <Text className='font-15 NanumGothic-Regular' strong>
                                            제휴상품명
                                        </Text>
                                    </Col>
                                    <Col span={4}>
                                        <Input name='productDnm' value={state.productDnm} onChange={handleInputChange} />
                                    </Col>
                                    <Col span={2}>
                                        <Text className='font-15 NanumGothic-Regular' strong>
                                            영문상품명
                                        </Text>
                                    </Col>
                                    <Col span={4}>
                                        <Input name='productEnm' value={state.productEnm} onChange={handleInputChange} />
                                    </Col>
                                    <Col span={2}>
                                        <Text className='font-15 NanumGothic-Regular' strong>
                                            상품모델명
                                        </Text>
                                    </Col>
                                    <Col span={4}>
                                        <Input name='productModel' value={state.productModel} onChange={handleInputChange} />
                                    </Col>
                                </Row>
                                <Row gutter={[16, 8]} className='onVerticalCenter marginTop-15'>
                                    <Col span={2}>
                                        <Text className='font-15 NanumGothic-Regular' strong>
                                            카테고리
                                        </Text>
                                    </Col>
                                    <Col span={22}>
                                        <Text>{state.categoryLabel != '' ? state.categoryLabel : undefined}</Text>
                                        &nbsp;
                                        <Cascader
                                            name='categoryId'
                                            options={state.categories}
                                            onChange={onChangeCategory}>
                                            <a href='#'>카테고리 선택</a>
                                        </Cascader>
                                    </Col>
                                </Row>
                                <Row gutter={[16, 8]} className='onVerticalCenter marginTop-15'>
                                    <Col span={2}>
                                        <Text className='font-15 NanumGothic-Regular' strong>
                                            브랜드
                                        </Text>
                                    </Col>
                                    <Col span={10}>
                                        <Row gutter={[16, 8]}>
                                            <Col span={6}>
                                                <Button style={{ width: '100%' }} onClick={showBrandModal}>브랜드검색</Button>
                                            </Col>
                                            <Col span={18}>
                                                <Input disabled name='brandNm' value={state.brandNm}></Input>
                                            </Col>
                                        </Row>
                                    </Col>
                                    <Col span={2}>
                                        <Text className='font-15 NanumGothic-Regular' strong>
                                            공급사
                                        </Text>
                                    </Col>
                                    <Col span={4}>
                                        <Input
                                            name='supplierId'
                                            onChange={handleInputChange}
                                            value={state.supplierId}
                                        />
                                    </Col>
                                </Row>
                                <Row gutter={[16, 8]} className='onVerticalCenter marginTop-15'>
                                    <Col span={2}>
                                        <Text className='font-15 NanumGothic-Regular' strong>
                                            거래처
                                        </Text>
                                    </Col>
                                    <Col span={10}>
                                        <Row gutter={[16, 8]}>
                                            <Col span={6}>
                                                <Button
                                                    style={{ width: '100%' }}
                                                    onClick={showPurchaseVendorSearchModal}>
                                                    거래처 선택
                                                </Button>
                                            </Col>
                                            <Col span={9}>
                                                <Input name='vendorId' className='fullWidth' value={state.vendorId} />
                                            </Col>
                                            <Col span={9}>
                                                <Input name='vendorNm' className='fullWidth' value={state.vendorNm} />
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                                <Row gutter={[16, 8]} className='onVerticalCenter marginTop-15'>
                                    <Col span={2}>
                                        <Text className='font-15 NanumGothic-Regular' strong>
                                            판매여부
                                        </Text>
                                    </Col>
                                    <Col span={6}>
                                        <Select
                                            placeholder="판매여부를 선택해 주세요"
                                            className='fullWidth'
                                            onChange={v => handleSelectChange('saleYn', v)}
                                            value={state.saleYn != '' ? state.saleYn : undefined}>
                                            {Constans.ASSORTSTATE.map(item => (
                                                <Option key={item.value}>{item.label}</Option>
                                            ))}
                                        </Select>
                                    </Col>
                                </Row>
                                <Row gutter={[16, 8]} className='onVerticalCenter marginTop-15'>
                                    <Col span={2}>
                                        <Text className='font-15 NanumGothic-Regular' strong>
                                            판매가
                                        </Text>
                                    </Col>
                                    <Col span={4}>
                                        <InputNumber
                                            className='fullWidth'
                                            value={state.salePrice}
                                            formatter={value => `₩ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                            onChange={v => {
                                                var regex = /^[0-9]/g
                                                if (regex.test(v)) {
                                                    onValueChange('salePrice', v)
                                                }
                                            }}
                                        />
                                    </Col>
                                    <Col span={2}>
                                        <Text className='font-15 NanumGothic-Regular' strong>
                                            오프라인 판매가
                                        </Text>
                                    </Col>
                                    <Col span={4}>
                                        <InputNumber
                                            className='fullWidth'
                                            value={state.offlineSalePrice}
                                            formatter={value => `₩ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                            onChange={v => {
                                                var regex = /^[0-9]/g
                                                if (regex.test(v)) {
                                                    onValueChange('offlineSalePrice', v)
                                                }
                                            }}
                                        />
                                    </Col>
                                    <Col span={2}>
                                        <Text className='font-15 NanumGothic-Regular' strong>
                                            해외판매가
                                        </Text>
                                    </Col>
                                    <Col span={4}>
                                        <InputNumber
                                            className='fullWidth'
                                            value={state.overseasSalePrice}
                                            formatter={value => `₩ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                            onChange={v => {
                                                var regex = /^[0-9]/g
                                                if (regex.test(v)) {
                                                    onValueChange('overseasSalePrice', v)
                                                }
                                            }}
                                        />
                                    </Col>
                                </Row>
                                <Divider style={{marginBottom : '0px'}}/>
                                <Row gutter={[16, 8]} className='onVerticalCenter marginTop-15'>
                                    <Col span={2}>
                                        <Text className='font-30 NanumGothic-Regular' strong>
                                            옵션
                                        </Text>
                                    </Col>
                                    <Col span={2}>
                                        <Text className='font-15 NanumGothic-Regular' strong>
                                            옵션 마스터
                                        </Text>
                                    </Col>
                                    <Col span={6}>
                                        <Select
                                            placeholder="옵션 마스터를 선택하세요"
                                            className='fullWidth'
                                            onChange={v => handleSelectChange('saleYn', v)}
                                            value={state.masterId != '' ? state.masterId : undefined}>
                                            {Constans.ASSORTSTATE.map(item => (
                                                <Option key={item.value}>{item.label}</Option>
                                            ))}
                                        </Select>
                                    </Col>
                                </Row>
                                <Row gutter={[16, 8]} className='onVerticalCenter marginTop-15'>
                                    {Object.keys(state.optionKeys).map((item,index) => {
                                        return (
                                            <>
                                                <Col span={1}>
                                                    <Text className='font-15 NanumGothic-Regular' strong>
                                                        {state.optionKeys['optionKey' + Number(index+1)]}
                                                    </Text>
                                                </Col>
                                                <Col span={3}>
                                                    <Input name={'optionValue' + Number(index+1)} value={state['optionValue' + Number(index+1)]} onChange={handleInputChange} />
                                                </Col>  
                                            </>
                                        )
                                    })}
                                </Row>
                            </TabPane>
                            <TabPane tab={`이미지설정`} key={2} style={{padding : '15px'}}>
                                <Row gutter={[16, 8]}>
                                    <Col>
                                        <Card title='메인이미지'>
                                            <Upload
                                                name='mainImage'
                                                customRequest={options => {
                                                    if (options.file.type.indexOf('image') == -1) {
                                                        alert('이미지 파일만 업로드 가능합니다.')
                                                        return false
                                                    }

                                                    if (options.file.size > 10485760) {
                                                        alert('10Mb 이하의 이미지만 업로드 가능합니다.')
                                                        return false
                                                    }

                                                    const { onSuccess, onError, file, onProgress } = options

                                                    const fmData = new FormData()
                                                    const config = {
                                                        headers: { 'content-type': 'multipart/form-data' },
                                                        onUploadProgress: event => {
                                                            console.log((event.loaded / event.total) * 100)
                                                            onProgress(
                                                                { percent: (event.loaded / event.total) * 100 },
                                                                file
                                                            )
                                                        }
                                                    }
                                                    fmData.append('imageGb', '01')
                                                    fmData.append('file', file)
                                                    fmData.append('userId', userId)
                                                    Https.postUploadImage(fmData, config)
                                                        .then(res => {
                                                            //     onSuccess(file);
                                                            console.log(res)

                                                            let file = {
                                                                uid: res.data.data.uid,
                                                                name: res.data.data.fileName,
                                                                status: res.data.data.status,
                                                                url: res.data.data.url
                                                            }

                                                            onValueChange(
                                                                'mainImage',
                                                                state.mainImage.concat(file)
                                                            )
                                                        })
                                                        .catch(err => {
                                                            const error = new Error('Some error')
                                                            onError({ event: error })
                                                        })
                                                }}
                                                onRemove={mainImageRemoveConfirm}
                                                // action="http://localhost:8080/file/uploadMainImage"
                                                // action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
                                                listType='picture-card'
                                                fileList={state.mainImage}
                                                //   onPreview={this.handlePreview}
                                                onChange={handleChange}>
                                                {state.mainImage.length >= 1 ? null : uploadButton}
                                            </Upload>
                                            <Modal
                                                visible={previewVisible}
                                                footer={null}
                                                onCancel={handlePreviewCancel}>
                                                <img alt='example' className='fullWidth' src={state.previewImage} />
                                            </Modal>
                                        </Card>
                                    </Col>
                                    <Col>
                                        <Card title='추가이미지'>
                                            <Upload
                                                name='addImage'
                                                customRequest={options => {
                                                    if (options.file.type.indexOf('image') == -1) {
                                                        alert('이미지 파일만 업로드 가능합니다.')
                                                        return false
                                                    }

                                                    if (options.file.size > 10485760) {
                                                        alert('10Mb 이하의 이미지만 업로드 가능합니다.')
                                                        return false
                                                    }

                                                    const { onSuccess, onError, file, onProgress } = options

                                                    const fmData = new FormData()
                                                    const config = {
                                                        headers: { 'content-type': 'multipart/form-data' },
                                                        onUploadProgress: event => {
                                                            console.log((event.loaded / event.total) * 100)
                                                            onProgress(
                                                                { percent: (event.loaded / event.total) * 100 },
                                                                file
                                                            )
                                                        }
                                                    }
                                                    fmData.append('imageGb', '02')
                                                    fmData.append('file', file)
                                                    fmData.append('userId', userId)
                                                    Https.postUploadImage(fmData, config)
                                                        .then(res => {
                                                            //     onSuccess(file);
                                                            console.log(res)

                                                            let file = {
                                                                uid: res.data.data.uid,
                                                                name: res.data.data.fileName,
                                                                status: res.data.data.status,
                                                                url: res.data.data.url
                                                            }

                                                            onValueChange(
                                                                'addImage',
                                                                state.addImage.concat(file)
                                                            )
                                                        })
                                                        .catch(err => {
                                                            const error = new Error('Some error')
                                                            onError({ event: error })
                                                        })
                                                }}
                                                onRemove={addImageRemoveConfirm}
                                                // action="http://localhost:8080/file/uploadMainImage"
                                                // action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
                                                listType='picture-card'
                                                fileList={state.addImage}
                                                //   onPreview={this.handlePreview}
                                                onChange={handleChange}>
                                                {state.mainImage.length >= 8 ? null : uploadButton}
                                            </Upload>
                                            <Modal
                                                visible={previewVisible}
                                                footer={null}
                                                onCancel={handlePreviewCancel}>
                                                <img alt='example' className='fullWidth' src={state.previewImage} />
                                            </Modal>
                                        </Card>
                                    </Col>
                                </Row>
                            </TabPane>
                            <TabPane tab={`설명`} key={3} style={{padding : '15px'}}>
                                <Row gutter={[16, 8]} className='onVerticalCenter marginTop-15'>
                                    <Col span={2}>
                                        <Text className='font-15 NanumGothic-Regular' strong>
                                            간략설명
                                        </Text>
                                    </Col>
                                    <Col span={20}>
                                        <TextArea
                                            onChange={simpleContentChange}
                                            value={state.shortDescription}
                                            name='shortDescription'
                                        />
                                    </Col>
                                </Row>
                                <Row gutter={[16, 8]} className='onVerticalCenter marginTop-15'>
                                    <Col span={2}>
                                        <Text className='font-15 NanumGothic-Regular' strong>
                                            상세설명
                                        </Text>
                                    </Col>
                                    <Col span={20}>
                                        <SunEditor
                                            onChange={changeGoodsDescription}
                                            setContents={state.goodsDescription}
                                            name='goodsDescription'
                                            onImageUploadBefore={onImageUploadBefore}
                                            setOptions={{
                                                height: '500px',
                                                plugins: plugins,
                                                buttonList: [
                                                    ['undo', 'redo'],
                                                    ['font', 'fontSize', 'formatBlock'],
                                                    ['paragraphStyle', 'blockquote'],
                                                    [
                                                        'bold',
                                                        'underline',
                                                        'italic',
                                                        'strike',
                                                        'subscript',
                                                        'superscript'
                                                    ],
                                                    ['fontColor', 'hiliteColor', 'textStyle'],
                                                    ['removeFormat'],
                                                    '/', // Line break
                                                    ['outdent', 'indent'],
                                                    ['align', 'horizontalRule', 'list', 'lineHeight'],
                                                    ['table', 'link', 'image'], // You must add the 'katex' library at options to use the 'math' plugin. // You must add the "imageGalleryUrl".
                                                    /** ['imageGallery'] */ ['fullScreen', 'showBlocks', 'codeView'],
                                                    ['preview', 'print']
                                                ],
                                                lang: ko
                                            }}
                                        />
                                    </Col>
                                </Row>
                            </TabPane>
                        </Tabs>
                    </div>
                </div>
            </div>
            <div>
                <BrandSearch
                    isModalVisible={isBrandVisible}
                    setIsModalVisible={setIsBrandVisible}
                    backState={state}
                    setSpin={props.setSpin}
                    setBackState={setState}
                />
            </div>
            <div>
                <PurchaseVendorSearch
                    isModalVisible={isPurchaseVendorVisible}
                    setIsModalVisible={setIsPurchaseVendorVisible}
                    backState={state}
                    setSpin={props.setSpin}
                    setBackState={setState}
                />
            </div>
        </Layout>
    )
}

//export default Create
export default withRouter(CreateV2)
