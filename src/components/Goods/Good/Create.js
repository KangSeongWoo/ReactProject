import React, { useCallback, useLayoutEffect, useState } from 'react'
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
    Radio
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
import 'suneditor/dist/css/suneditor.min.css' // Import Sun Editor's CSS File
import plugins from 'suneditor/src/plugins'
import { ko } from 'suneditor/src/lang'
import queryStirng from 'query-string'

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

const Create = props => {
    const { userId } = props

    const [isBrandVisible, setIsBrandVisible] = useState(false)
    const [isPurchaseVendorVisible, setIsPurchaseVendorVisible] = useState(false)
    const [previewVisible, setPreviewVisible] = useState(false)
    const [description, setDescription] = useState('')

    const [state, setState] = useState({
        categories: [],
        optionGbNm1: '',
        optionGbNm2: '',
        onfirmDirty: false,
        autoCompleteResult: [],
        nickName: '',
        optionValue1: '',
        optionValue2: '',
        optList: [],
        assortNm: '',
        optionUseYn: '02',
        assortColor: '',
        categoryId: [],
        categoryValue: [],
        removedRows: [],
        brandId: '',
        brandNm: '',
        assortModel: '',
        origin: '',
        taxGb: '',
        assortStatus: '',
        shortageYn: '',
        saleFromDt: moment().subtract(10, 'Y'),
        saleToDt: moment(),
        saleToDtOpen: false,
        origin: null,
        taxGb: '01',
        manufactureNm: '',
        assortState: '02',
        shortageYn: '01',
        localPrice: null,
        localSale: null,
        deliPrice: null,
        margin: null,
        mdYear: null,
        mdRrp: null,
        mdTax: '01',
        mdVatrate: null,
        mdDiscountRate: null,
        mdGoodsVatrate: null,
        mdMargin: null,
        buyWhere: null,
        buyTax: '01',
        buySupplyDiscount: null,
        buyRrpIncrement: null,
        buyExchangeRate: null,
        sDescription: '',
        asWidth: null,
        asLength: null,
        asHeight: null,
        weight: null,
        assortGb: '01',
        content: '',
        rowData: [],
        previewImage: '',
        fileList: [],
        mainImageList: [],
        addImageList: [],
        optionList1: [],
        optionList2: [],
        itemList: [],
        vendorId: '',
        purchaseVendorNm: '',
        categoryLabel: '',
        userId: userId
    })

    const hotkeyFunction = useCallback(event => {
        if (event.key == 'F2') {
            refresh()
        }
    }, [])

    useLayoutEffect(() => {
        setInit()
        document.addEventListener('keyup', hotkeyFunction)
    }, [])

    useEffect(() => {
        setState({
            ...state,
            content: description
        })
    }, [description])

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
        const {
            optionGbNm1,
            optionGbNm2,
            optionGbNm3,
            categoryValue,
            optionList1,
            optionList2,
            optionList3,
            itemList,
            mainImageList,
            addImageList,
            optionUseYn
        } = state

        props.setSpin(true)

        let cv = ''

        if (categoryValue.length > 0) {
            cv = categoryValue[categoryValue.length - 1]
        }

        // 옵션 스트링 만들기
        let optionGbName = ''

        if (optionGbNm1 != '') {
            optionGbName = optionGbNm1
            if (optionGbNm2 != '') {
                optionGbName = optionGbName + '^|^' + optionGbNm2
            }

            if (optionGbNm3 != '') {
                optionGbName = optionGbName + '^|^' + optionGbNm3
            }
        }

        let attributes = []

        let optionList = optionList1.concat(optionList2)
        optionList = optionList.concat(optionList3)
        attributes = []

        if (Common.trim(optionList) != '') {
            optionList.map(item => {
                let attribute = {
                    seq: item.status != 'i' ? Common.trim(item.seq) : '',
                    value: Common.trim(item.value),
                    variationGb: Common.trim(item.type)
                }

                attributes.push(attribute)
            })
        }

        let items = []
        items = []

        itemList.map(item => {
            let item1 = {
                itemId: item.status != 'i' ? Common.trim(item.itemId) : '',
                shortYn: Common.trim(item.shortageYn),
                addPrice: Common.trim(item.addPrice),

                variationSeq1: item.status1 != 'i' ? Common.trim(item.seq1) : '',
                variationValue1: Common.trim(item.value1),
                variationSeq2: item.status2 != 'i' ? Common.trim(item.seq2) : '',
                variationValue2: Common.trim(item.value2),
                variationSeq3: item.status2 != 'i' ? Common.trim(item.seq3) : '',
                variationValue3: Common.trim(item.value3)
            }

            items.push(item1)
        })

        let uploadMainImage = []

        let uploadAddImage = []

        console.log(mainImageList)

        mainImageList.map(item => {
            let obj = {
                uid: Common.trim(item.uid),
                name: Common.trim(item.name),
                url: Common.trim(item.url),
                imageGb: '01',
                status: Common.trim(item.status)
            }

            uploadMainImage.push(obj)
        })

        addImageList.map(item => {
            let obj = {
                uid: Common.trim(item.uid),
                name: Common.trim(item.name),
                url: Common.trim(item.url),
                imageGb: '02',
                status: Common.trim(item.status)
            }
            uploadAddImage.push(obj)
        })

        let goodsData = {
            assortNm: Common.trim(state.assortNm),
            assortColor: Common.trim(state.assortColor),
            dispCategoryId: Common.trim(cv),
            brandId: Common.trim(state.brandId),
            origin: Common.trim(state.origin),
            manufactureNm: Common.trim(state.manufactureNm),
            assortModel: Common.trim(state.assortModel),
            optionGbName: Common.trim(optionGbName),
            taxGb: Common.trim(state.taxGb),
            assortState: Common.trim(state.assortState),
            shortageYn: Common.trim(state.shortageYn),
            localPrice: Common.trim(state.localPrice),
            localSale: Common.trim(state.localSale),
            deliPrice: Common.trim(state.deliPrice),
            margin: Common.trim(state.margin),
            mdRrp: Common.trim(state.mdRrp),
            mdYear: Common.trim(state.mdYear),
            mdVatrate: Common.trim(state.mdVatrate),
            mdDiscountRate: Common.trim(state.mdDiscountRate),
            mdGoodsVatrate: Common.trim(state.mdGoodsVatrate),
            buyWhere: Common.trim(state.buyWhere),
            buySupplyDiscount: Common.trim(state.buySupplyDiscount),
            buyExchangeRate: Common.trim(state.buyExchangeRate),
            buyRrpIncrement: Common.trim(state.buyRrpIncrement),
            sellStaDt: Common.trim(state.saleFromDt.format('YYYY-MM-DD HH:mm:ss')),
            sellEndDt: Common.trim(state.saleToDt.format('YYYY-MM-DD HH:mm:ss')),
            asWidth: Common.trim(state.asWidth),
            asLength: Common.trim(state.asLength),
            asHeight: Common.trim(state.asHeight),
            weight: Common.trim(state.weight),
            assortGb: Common.trim(state.assortGb),
            mdTax: Common.trim(state.mdTax),
            mdMargin: Common.trim(state.mdMargin),
            mdGoodsVatrate: Common.trim(state.mdGoodsVatrate),
            buyTax: Common.trim(state.buyTax),
            mdDiscountRate: Common.trim(state.mdDiscountRate),
            description: [
                {
                    //상세
                    seq: '',
                    ordDetCd: '01',
                    textHtmlGb: '01',
                    memo: Common.trim(state.content)
                },
                {
                    //간략
                    seq: '',
                    ordDetCd: '02',
                    textHtmlGb: '02',
                    memo: Common.trim(state.sDescription)
                }
            ],
            optionUseYn: Common.trim(optionUseYn),
            attributes: Common.trim(attributes),
            items: Common.trim(items),
            uploadMainImage: Common.trim(uploadMainImage),
            uploadAddImage: Common.trim(uploadAddImage),
            vendorId: Common.trim(state.vendorId)
        }

        console.log(JSON.stringify(goodsData))

        const config = { headers: { 'Content-Type': 'application/json' } }

        Https.postSaveGoods(goodsData, config)
            .then(response => {
                props.setSpin(false)
                let url = '/Goods/edit?' + queryStirng.stringify(response.data.data)
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

                const { mainImageList } = state
                const { addImageList } = state

                if (imageGb == 'main') {
                    onValueChange(
                        'mainImageList',
                        mainImageList.filter(inFile => inFile.uid !== uid)
                    )
                } else if (imageGb == 'add') {
                    onValueChange(
                        'addImageList',
                        addImageList.filter(inFile => inFile.uid !== uid)
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

    const createOptionValue1 = () => {
        let tempList = state.optionList1

        let uuid = 'tmp' + getUUID()
        let item = {
            seq: uuid,
            value: '',
            type: '01',
            status: 'i'
        }

        tempList.push(item)

        setState({
            ...state,
            optionList1: tempList
        })
    }

    const createOptionValue2 = () => {
        let tempList = state.optionList2

        let uuid = 'tmp' + getUUID()
        let item = {
            seq: uuid,
            value: '',
            type: '02',
            status: 'i'
        }

        tempList.push(item)

        setState({
            ...state,
            optionList2: tempList
        })
    }

    const createOptionValue3 = () => {
        let tempList = state.optionList3

        let uuid = 'tmp' + getUUID()
        let item = {
            seq: uuid,
            value: '',
            type: '03',
            status: 'i'
        }

        tempList.push(item)

        setState({
            ...state,
            optionList3: tempList
        })
    }

    const combineOption1 = () => {
        const { itemList, optionList1, optionList2, optionList3 } = state

        let orirginalList = []

        itemList.map(item => {
            if (item.status1 == 'c') {
                if (item.value2 != undefined && item.value2 != null) {
                    if (item.value2.length > 0) {
                        if (item.status2 == 'c') {
                            orirginalList.push(item)
                        }
                    }
                } else {
                    orirginalList.push(item)
                }
            }
        })

        // 옵션 빈칸 제거
        for (var o1 in optionList1) {
            if (optionList1[o1].value == '' && optionList1[o1].status == 'i') {
                optionList1.splice(o1, 1)
            }
        }

        for (var o2 in optionList2) {
            if (optionList2[o2].value == '' && optionList2[o2].status == 'i') {
                optionList2.splice(o2, 1)
            }
        }

        for (var o3 in optionList3) {
            if (optionList3[o3].value == '' && optionList3[o3].status == 'i') {
                optionList3.splice(o3, 1)
            }
        }

        let list = []
        let obj = {}

        if (optionList1.length > 0) {
            for (var o1 in optionList1) {
                if (optionList2.length > 0) {
                    for (var o2 in optionList2) {
                        if (optionList3.length > 0) {
                            // 옵션1, 옵션2, 옵션3 존재
                            for (var o3 in optionList3) {
                                //옵션 1과 옵션2만 존재
                                obj = {}

                                obj.itemId = 'tmp' + Common.trim(getUUID())
                                obj.seq1 = Common.trim(optionList1[o1].seq)
                                obj.value1 = Common.trim(optionList1[o1].value)
                                obj.status1 = Common.trim(optionList1[o1].status)
                                obj.seq2 = Common.trim(optionList2[o2].seq)
                                obj.value2 = Common.trim(optionList2[o2].value)
                                obj.status2 = Common.trim(optionList2[o2].status)
                                obj.seq3 = Common.trim(optionList3[o3].seq)
                                obj.value3 = Common.trim(optionList3[o3].value)
                                obj.status3 = Common.trim(optionList3[o3].status)
                                obj.shortageYn = '01'
                                obj.addPrice = ''
                                obj.status = 'i'

                                list.push(obj)
                            }
                        } else {
                            //옵션 1과 옵션2만 존재
                            obj = {}

                            obj.itemId = 'tmp' + Common.trim(getUUID())
                            obj.seq1 = Common.trim(optionList1[o1].seq)
                            obj.value1 = Common.trim(optionList1[o1].value)
                            obj.status1 = Common.trim(optionList1[o1].status)
                            obj.seq2 = Common.trim(optionList2[o2].seq)
                            obj.value2 = Common.trim(optionList2[o2].value)
                            obj.status2 = Common.trim(optionList2[o2].status)
                            obj.shortageYn = '01'
                            obj.addPrice = ''
                            obj.status = 'i'

                            list.push(obj)
                        }
                    }
                } else {
                    if (optionList3.length > 0) {
                        // 옵션1과 옵션3 존재
                        for (var o3 in optionList3) {
                            obj = {}

                            obj.itemId = 'tmp' + Common.trim(getUUID())
                            obj.seq1 = Common.trim(optionList1[o1].seq)
                            obj.value1 = Common.trim(optionList1[o1].value)
                            obj.status1 = Common.trim(optionList1[o1].status)
                            obj.seq3 = Common.trim(optionList3[o3].seq)
                            obj.value3 = Common.trim(optionList3[o3].value)
                            obj.status3 = Common.trim(optionList3[o3].status)
                            obj.shortageYn = '01'
                            obj.addPrice = ''
                            obj.status = 'i'

                            list.push(obj)
                        }
                    } else {
                        // 옵션1만 존재
                        obj = {}

                        obj.itemId = 'tmp' + Common.trim(getUUID())
                        obj.seq1 = Common.trim(optionList1[o1].seq)
                        obj.value1 = Common.trim(optionList1[o1].value)
                        obj.status1 = Common.trim(optionList1[o1].status)
                        obj.shortageYn = '01'
                        obj.addPrice = ''
                        obj.status = 'i'

                        list.push(obj)
                    }
                }
            }
        }

        let newList = list.filter(item => item.status1 == 'i' || item.status2 == 'i')
        console.log(newList)
        let cList = orirginalList.concat(newList)

        console.log(cList)
        onValueChange('itemList', cList)
    }

    const sendImage = async file => {
        //동기처리예제

        const formData = new FormData()
        formData.append('imageGb', '03')
        formData.append('file', file)

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

    // 판매기간 날짜 및 시간 변경
    const handleChangeTimeRange = e => {
        setState({
            ...state,
            sellStaDt: e[0],
            sellEndDt: e[1]
        })
    }

    const onChangeCategory = (value, label) => {
        setState({
            ...state,
            categoryValue: value,
            categoryLabel: label.map(o => o.label).join(' > ')
        })
    }

    // 옵션으로 선택된 Row 삭제
    const removeOptionData = target => {
        setState({
            ...state,
            itemList: state.itemList.filter(rows => rows.itemId !== target)
        })
    }

    const refresh = () => {
        setState({
            ...state,
            categories: [],
            optionGbNm1: '',
            optionGbNm2: '',
            optionGbNm3: '',
            onfirmDirty: false,
            autoCompleteResult: [],
            nickName: '',
            optionValue1: '',
            optionValue2: '',
            optList: [],
            assortNm: '',
            optionUseYn: '02',
            assortColor: '',
            categoryId: [],
            categoryValue: [],
            removedRows: [],
            brandId: '',
            brandNm: '',
            assortModel: '',
            origin: '',
            taxGb: '',
            assortStatus: '',
            shortageYn: '',
            saleToDtOpen: false,
            origin: null,
            taxGb: '01',
            manufactureNm: '',
            assortState: '02',
            shortageYn: '01',
            localPrice: null,
            localSale: null,
            deliPrice: null,
            margin: null,
            mdYear: null,
            mdRrp: null,
            mdTax: '01',
            mdVatrate: null,
            mdDiscountRate: null,
            mdGoodsVatrate: null,
            mdMargin: null,
            buyWhere: null,
            buyTax: '01',
            buySupplyDiscount: null,
            buyRrpIncrement: null,
            buyExchangeRate: null,
            sDescription: '',
            saleFromDt: moment().subtract(1, 'M'),
            saleToDt: moment(),
            asWidth: null,
            asLength: null,
            asHeight: null,
            weight: null,
            assortGb: '01',
            content: '',
            rowData: [],
            previewImage: '',
            fileList: [],
            mainImageList: [],
            addImageList: [],
            optionList1: [],
            optionList2: [],
            itemList: [],
            vendorId: '',
            vendorNm: '',
            categoryLabel: ''
        })
    }

    const columns = [
        { title: '옵션1', dataIndex: 'value1', key: 'value1' },
        { title: '옵션2', dataIndex: 'value2', key: 'value2' },
        { title: '옵션3', dataIndex: 'value3', key: 'value3' },
        {
            title: '옵션추가금액',
            dataIndex: 'addPrice',
            key: 'addPrice',
            render: (index, target) => {
                return (
                    <Input
                        style={{ width: '100%' }}
                        value={state.itemList.filter(item => item.itemId === target.itemId)[0].addPrice}
                        onChange={e => {
                            let _pattern = /^(\d{1,10}([.]\d{0,2})?)?$/
                            if (!_pattern.test(e.target.value)) {
                                return false
                            }

                            let tempList = state.itemList

                            tempList.forEach(item => {
                                if (item.itemId === target.itemId) {
                                    item.addPrice = e.target.value
                                }
                            })

                            setState({
                                ...state,
                                itemList: tempList
                            })
                        }}
                    />
                )
            }
        },
        {
            title: '품절구분',
            dataIndex: 'shortageYn',
            key: 'shortageYn',
            render: (index, target) => {
                return (
                    <Select
                        style={{ width: '100%' }}
                        onChange={v => {
                            let tempList = state.itemList

                            tempList.forEach(item => {
                                if (item.itemId === target.itemId) {
                                    item.shortageYn = v
                                }
                            })

                            setState({
                                ...state,
                                itemList: tempList
                            })
                        }}
                        value={state.itemList.filter(item => item.itemId === target.itemId)[0].shortageYn}>
                        {Constans.SHORTAGEYN.map(item => (
                            <Option key={item.value}>{item.label}</Option>
                        ))}
                    </Select>
                )
            }
        },
        {
            title: '삭제',
            dataIndex: 'delete',
            key: 'delete',
            render: (text, record) => {
                return (
                    <Button
                        onClick={() => {
                            removeOptionData(record.itemId)
                        }}>
                        삭제
                    </Button>
                )
            }
        }
    ]

    const changeContent = event => {
        setDescription(event)
    }

    const simpleContentChange = event => {
        setState({
            ...state,
            sDescription: event.target.value
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

    return (
        <Layout>
            <div className='notice-header'>
                <CustomBreadcrumb arr={['상품', '상품등록']}></CustomBreadcrumb>
            </div>

            <div className='notice-wrapper'>
                <div className='notice-content'>
                    <Row type='flex' justify='end' gutter={16}>
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
                    <Divider style={{ margin: '10px 0' }} />
                    <div className='notice-condition'>
                        <Tabs defaultActiveKey='1' tabPosition={'left'}>
                            <TabPane tab={`상품기본설정`} key={1}>
                                <Row gutter={[16, 8]} className='onVerticalCenter'>
                                    <Col span={2}>
                                        <Text className='font-15 NanumGothic-Regular' strong>
                                            상품명
                                        </Text>
                                    </Col>
                                    <Col span={10}>
                                        <Input name='assortNm' value={state.assortNm} onChange={handleInputChange} />
                                    </Col>
                                    <Col span={2}>
                                        <Text className='font-15 NanumGothic-Regular' strong>
                                            상품타입
                                        </Text>
                                    </Col>
                                    <Col span={4}>
                                        <Select
                                            className='fullWidth'
                                            showArrow
                                            placeholder='상품타입을 선택하세요'
                                            onChange={v => handleSelectChange('assortGb', v)}
                                            value={state.assortGb}>
                                            {Constans.ASSORTGB.map(item => (
                                                <Option key={item.value}>{item.label}</Option>
                                            ))}
                                        </Select>
                                    </Col>
                                    <Col span={2}>
                                        <Text className='font-15 NanumGothic-Regular' strong>
                                            대표색상
                                        </Text>
                                    </Col>
                                    <Col span={4}>
                                        <Select
                                            className='fullWidth'
                                            showArrow
                                            placeholder='Select a color'
                                            onChange={v => handleSelectChange('assortColor', v)}
                                            value={state.assortColor}>
                                            {Constans.COLORS.map(item => (
                                                <Option key={item.value}>{item.label}</Option>
                                            ))}
                                        </Select>
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
                                                <Button onClick={showBrandModal}>브랜드검색</Button>
                                            </Col>
                                            <Col span={18}>
                                                <Input disabled name='brandNm' value={state.brandNm}></Input>
                                            </Col>
                                        </Row>
                                    </Col>
                                    <Col span={2}>
                                        <Text className='font-15 NanumGothic-Regular' strong>
                                            모델번호
                                        </Text>
                                    </Col>
                                    <Col span={4}>
                                        <Row>
                                            <Input
                                                name='assortModel'
                                                onChange={handleInputChange}
                                                value={state.assortModel}
                                            />
                                        </Row>
                                    </Col>
                                    <Col span={2}>
                                        <Text className='font-15 NanumGothic-Regular' strong>
                                            제조회사
                                        </Text>
                                    </Col>
                                    <Col span={4}>
                                        <Input
                                            name='manufactureNm'
                                            onChange={handleInputChange}
                                            value={state.manufactureNm}
                                        />
                                    </Col>
                                </Row>
                                <Row gutter={[16, 8]} className='onVerticalCenter marginTop-15'>
                                    <Col span={2}>
                                        <Text className='font-15 NanumGothic-Regular' strong>
                                            원산지
                                        </Text>
                                    </Col>
                                    <Col span={6}>
                                        <Select
                                            className='fullWidth'
                                            placeholder='원산지를 선택하세요'
                                            onChange={v => handleSelectChange('origin', v)}
                                            value={state.origin}>
                                            {Constans.ORIGINS.map(item => (
                                                <Option key={item.value}>{item.label}</Option>
                                            ))}
                                        </Select>
                                    </Col>
                                    <Col span={2}>
                                        <Text className='font-15 NanumGothic-Regular' strong>
                                            과세/면세
                                        </Text>
                                    </Col>
                                    <Col span={6}>
                                        <Select
                                            className='fullWidth'
                                            placeholder='선택하세요'
                                            onChange={v => handleSelectChange('taxGb', v)}
                                            value={state.taxGb}>
                                            {Constans.TAXGB.map(item => (
                                                <Option key={item.value}>{item.label}</Option>
                                            ))}
                                        </Select>
                                    </Col>
                                    <Col span={2}>
                                        <Text className='font-15 NanumGothic-Regular' strong>
                                            판매상태
                                        </Text>
                                    </Col>
                                    <Col span={6}>
                                        <Select
                                            className='fullWidth'
                                            onChange={v => handleSelectChange('assortState', v)}
                                            value={state.assortState}>
                                            {Constans.ASSORTSTATE.map(item => (
                                                <Option key={item.value}>{item.label}</Option>
                                            ))}
                                        </Select>
                                    </Col>
                                </Row>
                                <Row gutter={[16, 8]} className='onVerticalCenter marginTop-15'>
                                    <Col span={2}>
                                        <Text className='font-15 NanumGothic-Regular' strong>
                                            상품상태
                                        </Text>
                                    </Col>
                                    <Col span={6}>
                                        <Select
                                            className='fullWidth'
                                            onChange={v => handleSelectChange('shortageYn', v)}
                                            value={state.shortageYn}>
                                            {Constans.SHORTAGEYN.map(item => (
                                                <Option key={item.value}>{item.label}</Option>
                                            ))}
                                        </Select>
                                    </Col>
                                    <Col span={2}>
                                        <Text className='font-15 NanumGothic-Regular' strong>
                                            판매기간
                                        </Text>
                                    </Col>
                                    <Col span={14}>
                                        <RangePicker
                                            defaultValue={[state.saleFromDt, state.saleToDt]}
                                            className='fullWidth'
                                            format='YYYY-MM-DD HH:mm:ss'
                                            showTime
                                            onChange={handleChangeTimeRange}
                                        />
                                    </Col>
                                </Row>
                                <Row gutter={[16, 8]} className='onVerticalCenter marginTop-15'>
                                    <Col span={2}>
                                        <Text className='font-15 NanumGothic-Regular' strong>
                                            너비
                                        </Text>
                                    </Col>
                                    <Col span={4}>
                                        <InputNumber
                                            className='fullWidth'
                                            value={state.asWidth}
                                            onChange={v => {
                                                var regex = /^[0-9]/g
                                                if (regex.test(v)) {
                                                    onValueChange('asWidth', v)
                                                }
                                            }}
                                        />
                                    </Col>
                                    <Col span={2}>
                                        <Text className='font-15 NanumGothic-Regular' strong>
                                            높이
                                        </Text>
                                    </Col>
                                    <Col span={4}>
                                        <InputNumber
                                            className='fullWidth'
                                            value={state.asHeight}
                                            onChange={v => {
                                                var regex = /^[0-9]/g
                                                if (regex.test(v)) {
                                                    onValueChange('asHeight', v)
                                                }
                                            }}
                                        />
                                    </Col>
                                    <Col span={2}>
                                        <Text className='font-15 NanumGothic-Regular' strong>
                                            깊이
                                        </Text>
                                    </Col>
                                    <Col span={4}>
                                        <InputNumber
                                            className='fullWidth'
                                            value={state.asLength}
                                            onChange={v => {
                                                var regex = /^[0-9]/g
                                                if (regex.test(v)) {
                                                    onValueChange('asLength', v)
                                                }
                                            }}
                                        />
                                    </Col>
                                    <Col span={2}>
                                        <Text className='font-15 NanumGothic-Regular' strong>
                                            무게
                                        </Text>
                                    </Col>
                                    <Col span={4}>
                                        <InputNumber
                                            className='fullWidth'
                                            value={state.weight}
                                            onChange={v => {
                                                var regex = /^[0-9]/g
                                                if (regex.test(v)) {
                                                    onValueChange('weight', v)
                                                }
                                            }}
                                        />
                                    </Col>
                                </Row>
                                <Row gutter={[16, 8]} className='onVerticalCenter marginTop-15'>
                                    <Col span={2}>
                                        <Text className='font-15 NanumGothic-Regular' strong>
                                            정가
                                        </Text>
                                    </Col>
                                    <Col span={4}>
                                        <InputNumber
                                            className='fullWidth'
                                            value={state.localPrice}
                                            formatter={value => `${value} ₩`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                            onChange={v => {
                                                var regex = /^[0-9]/g
                                                if (regex.test(v)) {
                                                    onValueChange('localPrice', v)
                                                }
                                            }}
                                        />
                                    </Col>
                                    <Col span={2}>
                                        <Text className='font-15 NanumGothic-Regular' strong>
                                            판매가
                                        </Text>
                                    </Col>
                                    <Col span={4}>
                                        <InputNumber
                                            className='fullWidth'
                                            value={state.localSale}
                                            formatter={value => `${value} ₩`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                            onChange={v => {
                                                var regex = /^[0-9]/g
                                                if (regex.test(v)) {
                                                    onValueChange('localSale', v)
                                                }
                                            }}
                                        />
                                    </Col>
                                    <Col span={2}>
                                        <Text className='font-15 NanumGothic-Regular' strong>
                                            매입가
                                        </Text>
                                    </Col>
                                    <Col span={4}>
                                        <InputNumber
                                            className='fullWidth'
                                            value={state.deliPrice}
                                            formatter={value => `${value} ₩`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                            onChange={v => {
                                                var regex = /^[0-9]/g
                                                if (regex.test(v)) {
                                                    onValueChange('deliPrice', v)
                                                }
                                            }}
                                        />
                                    </Col>
                                    <Col span={2}>
                                        <Text className='font-15 NanumGothic-Regular' strong>
                                            마진율
                                        </Text>
                                    </Col>
                                    <Col span={4}>
                                        <InputNumber
                                            className='fullWidth'
                                            value={state.margin}
                                            formatter={value => `${value} %`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                            onChange={v => {
                                                var regex = /^[0-9]/g
                                                if (regex.test(v)) {
                                                    onValueChange('margin', v)
                                                }
                                            }}
                                        />
                                    </Col>
                                </Row>
                            </TabPane>
                            <TabPane tab={`이미지설정`} key={2}>
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
                                                                'mainImageList',
                                                                state.mainImageList.concat(file)
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
                                                fileList={state.mainImageList}
                                                //   onPreview={this.handlePreview}
                                                onChange={handleChange}>
                                                {state.mainImageList.length >= 1 ? null : uploadButton}
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
                                                                'addImageList',
                                                                state.addImageList.concat(file)
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
                                                fileList={state.addImageList}
                                                //   onPreview={this.handlePreview}
                                                onChange={handleChange}>
                                                {state.mainImageList.length >= 8 ? null : uploadButton}
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
                            <TabPane tab={`상품 가격 관리(MD팀)`} key={3}>
                                <Row gutter={[16, 8]} className='onVerticalCenter'>
                                    <Col span={2}>
                                        <Text className='font-15 NanumGothic-Regular' strong>
                                            RRP
                                        </Text>
                                    </Col>
                                    <Col span={10}>
                                        <InputNumber
                                            className='fullWidth'
                                            value={state.mdRrp}
                                            onChange={v => {
                                                onValueChange('mdRrp', v)
                                            }}
                                        />
                                    </Col>
                                    <Col span={2}>
                                        <Text className='font-15 NanumGothic-Regular' strong>
                                            자료연도
                                        </Text>
                                    </Col>
                                    <Col span={4}>
                                        <Input
                                            name='mdYear'
                                            className='fullWidth'
                                            value={state.mdYear}
                                            onChange={handleInputChange}
                                        />
                                    </Col>
                                    <Col span={2}>
                                        <Text className='font-15 NanumGothic-Regular' strong>
                                            TAX(자료)
                                        </Text>
                                    </Col>
                                    <Col span={4}>
                                        <Select
                                            className='fullWidth'
                                            onChange={v => handleSelectChange('mdTax', v)}
                                            value={state.mdTax}>
                                            {Constans.TAXTYPE.map(item => (
                                                <Option key={item.value}>{item.label}</Option>
                                            ))}
                                        </Select>
                                    </Col>
                                </Row>
                                <Row gutter={[16, 8]} className='onVerticalCenter marginTop-15'>
                                    <Col span={2}>
                                        <Text className='font-15 NanumGothic-Regular' strong>
                                            부가세율
                                        </Text>
                                    </Col>
                                    <Col span={10}>
                                        <InputNumber
                                            className='fullWidth'
                                            value={state.mdVatrate}
                                            formatter={value => `${value}%`}
                                            parser={value => value.replace('%', '')}
                                            onChange={v => {
                                                onValueChange('mdVatrate', v)
                                            }}
                                        />
                                    </Col>
                                    <Col span={2}>
                                        <Text className='font-15 NanumGothic-Regular' strong>
                                            할인률
                                        </Text>
                                    </Col>
                                    <Col span={4}>
                                        <InputNumber
                                            className='fullWidth'
                                            value={state.mdDiscountRate}
                                            formatter={value => `${value}%`}
                                            parser={value => value.replace('%', '')}
                                            onChange={v => {
                                                onValueChange('mdDiscountRate', v)
                                            }}
                                        />
                                    </Col>
                                    <Col span={2}>
                                        <Text className='font-15 NanumGothic-Regular' strong>
                                            상품마진율
                                        </Text>
                                    </Col>
                                    <Col span={4}>
                                        <InputNumber
                                            className='fullWidth'
                                            value={state.mdGoodsVatrate}
                                            formatter={value => `${value}%`}
                                            parser={value => value.replace('%', '')}
                                            onChange={v => {
                                                onValueChange('mdGoodsVatrate', v)
                                            }}
                                        />
                                    </Col>
                                </Row>
                            </TabPane>
                            <TabPane tab={`상품 가격 관리(구매팀)`} key={4}>
                                <Row gutter={[16, 8]} className='onVerticalCenter'>
                                    <Col span={2}>
                                        <Text className='font-15 NanumGothic-Regular' strong>
                                            구매처
                                        </Text>
                                    </Col>
                                    <Col span={10}>
                                        <Row gutter={[16, 8]}>
                                            <Col span={6}>
                                                <Button
                                                    style={{ width: '100%' }}
                                                    onClick={showPurchaseVendorSearchModal}>
                                                    구매처 선택
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
                                    <Col span={2}>
                                        <Text className='font-15 NanumGothic-Regular' strong>
                                            공급할인율
                                        </Text>
                                    </Col>
                                    <Col span={4}>
                                        <InputNumber
                                            className='fullWidth'
                                            value={state.buySupplyDiscount}
                                            formatter={value => `${value}%`}
                                            parser={value => value.replace('%', '')}
                                            onChange={v => {
                                                onValueChange('buySupplyDiscount', v)
                                            }}
                                        />
                                    </Col>
                                    <Col span={2}>
                                        <Text className='font-15 NanumGothic-Regular' strong>
                                            RRP 인상율
                                        </Text>
                                    </Col>
                                    <Col span={4}>
                                        <InputNumber
                                            className='fullWidth'
                                            value={state.buyRrpIncrement}
                                            formatter={value => `${value}%`}
                                            parser={value => value.replace('%', '')}
                                            onChange={v => {
                                                onValueChange('buyRrpIncrement', v)
                                            }}
                                        />
                                    </Col>
                                </Row>
                                <Row gutter={[16, 8]} className='onVerticalCenter marginTop-15'>
                                    <Col span={2}>
                                        <Text className='font-15 NanumGothic-Regular' strong>
                                            TAX(구매)
                                        </Text>
                                    </Col>
                                    <Col span={10}>
                                        <Select
                                            className='fullWidth'
                                            onChange={v => handleSelectChange('buyTax', v)}
                                            value={state.buyTax}>
                                            {Constans.TAXTYPE.map(item => (
                                                <Option key={item.value}>{item.label}</Option>
                                            ))}
                                        </Select>
                                    </Col>
                                    <Col span={2}>
                                        <Text className='font-15 NanumGothic-Regular' strong>
                                            정기마진율
                                        </Text>
                                    </Col>
                                    <Col span={4}>
                                        <InputNumber
                                            className='fullWidth'
                                            value={state.mdMargin}
                                            formatter={value => `${value}%`}
                                            parser={value => value.replace('%', '')}
                                            onChange={v => {
                                                onValueChange('mdMargin', v)
                                            }}
                                        />
                                    </Col>
                                    <Col span={2}>
                                        <Text className='font-15 NanumGothic-Regular' strong>
                                            적용환율
                                        </Text>
                                    </Col>
                                    <Col span={4}>
                                        <InputNumber
                                            style={{ width: '80%' }}
                                            value={state.buyExchangeRate}
                                            onChange={v => {
                                                onValueChange('buyExchangeRate', v)
                                            }}
                                        />{' '}
                                        원/€
                                    </Col>
                                </Row>
                            </TabPane>
                            <TabPane tab={`옵션`} key={5}>
                                <Row gutter={[16, 8]} className='onVerticalCenter'>
                                    <Col span={3}>
                                        <Text className='font-15 NanumGothic-Regular' strong>
                                            옵션사용여부
                                        </Text>
                                    </Col>
                                    <Col span={10}>
                                        <Radio.Group
                                            onChange={e => {
                                                setState({
                                                    ...state,
                                                    optionUseYn: e.target.value,
                                                    optionGbNm1: '',
                                                    optionGbNm2: '',
                                                    optionGbNm3: '',
                                                    optionList1: [],
                                                    optionList2: [],
                                                    optionList3: [],
                                                    itemList: []
                                                })
                                            }}
                                            value={state.optionUseYn}>
                                            <Radio value={'01'}>사용함</Radio>
                                            <Radio value={'02'}>사용안함</Radio>
                                        </Radio.Group>
                                    </Col>
                                </Row>
                                {state.optionUseYn == '01' && (
                                    <>
                                        <Row gutter={[16, 8]} className='onVerticalCenter marginTop-15'>
                                            <Col span={8}>
                                                <Text className='font-15 NanumGothic-Regular' strong>
                                                    옵션명
                                                </Text>
                                            </Col>
                                            <Col span={8}>
                                                <Text className='font-15 NanumGothic-Regular' strong>
                                                    옵션값
                                                </Text>
                                            </Col>
                                        </Row>
                                        <Row gutter={[16, 8]} className='onVerticalCenter marginTop-15'>
                                            <Col span={8}>
                                                <Row>
                                                    <Col className='col-r-margin' span={19}>
                                                        <Input
                                                            width='100'
                                                            name='optionGbNm1'
                                                            value={state.optionGbNm1}
                                                            placeholder='ex)색상'
                                                            allowClear
                                                            onChange={handleInputChange}></Input>
                                                    </Col>
                                                    <Col span={4}>
                                                        <Button onClick={createOptionValue1}>추가</Button>
                                                    </Col>
                                                </Row>
                                            </Col>
                                            <Col span={8}>
                                                <OptionList
                                                    items={state.optionUseYn == '01' ? state.optionList1 : []}
                                                    onChangeItems={v => {
                                                        console.log(v)
                                                        setState({
                                                            ...state,
                                                            optionList1: v
                                                        })
                                                    }}
                                                    onPressEnter={createOptionValue1}></OptionList>
                                            </Col>
                                        </Row>
                                        <Row gutter={[16, 8]} className='onVerticalCenter marginTop-15'>
                                            <Col span={8}>
                                                <Row>
                                                    <Col className='col-r-margin' span={19}>
                                                        <Input
                                                            width='100'
                                                            name='optionGbNm2'
                                                            value={state.optionGbNm2}
                                                            placeholder='ex)색상'
                                                            allowClear
                                                            onChange={handleInputChange}></Input>
                                                    </Col>
                                                    <Col span={4}>
                                                        <Button onClick={createOptionValue2}>추가</Button>
                                                    </Col>
                                                </Row>
                                            </Col>
                                            <Col span={8}>
                                                <OptionList
                                                    items={state.optionUseYn == '01' ? state.optionList2 : []}
                                                    onChangeItems={v => {
                                                        console.log(v)

                                                        setState({
                                                            ...state,
                                                            optionList2: v
                                                        })
                                                    }}
                                                    onPressEnter={createOptionValue2}></OptionList>
                                            </Col>
                                        </Row>
                                        <Row gutter={[16, 8]} className='onVerticalCenter marginTop-15'>
                                            <Col span={8}>
                                                <Row>
                                                    <Col className='col-r-margin' span={19}>
                                                        <Input
                                                            width='100'
                                                            name='optionGbNm3'
                                                            value={state.optionGbNm3}
                                                            placeholder='ex)색상'
                                                            allowClear
                                                            onChange={handleInputChange}></Input>
                                                    </Col>
                                                    <Col span={4}>
                                                        <Button onClick={createOptionValue3}>추가</Button>
                                                    </Col>
                                                </Row>
                                            </Col>
                                            <Col span={8}>
                                                <OptionList
                                                    items={state.optionUseYn == '01' ? state.optionList3 : []}
                                                    onChangeItems={v => {
                                                        console.log(v)

                                                        setState({
                                                            ...state,
                                                            optionList3: v
                                                        })
                                                    }}
                                                    onPressEnter={createOptionValue3}></OptionList>
                                            </Col>
                                        </Row>
                                        <Row gutter={[16, 8]} className='onVerticalCenter marginTop-15'>
                                            <Col span={24}>
                                                <Button type='primary' className='fullWidth' onClick={combineOption1}>
                                                    적용
                                                </Button>
                                            </Col>
                                        </Row>
                                    </>
                                )}

                                {state.itemList.length > 0 && (
                                    <Table
                                        rowKey='itemId'
                                        pagination={false}
                                        columns={columns}
                                        dataSource={state.itemList}
                                        style={{ height: '300px', overflowY: 'auto' }}
                                    />
                                )}
                            </TabPane>
                            <TabPane tab={`설명`} key={6}>
                                <Row gutter={[16, 8]} className='onVerticalCenter marginTop-15'>
                                    <Col span={2}>
                                        <Text className='font-15 NanumGothic-Regular' strong>
                                            짧은설명
                                        </Text>
                                    </Col>
                                    <Col span={20}>
                                        <TextArea
                                            onChange={simpleContentChange}
                                            value={state.sDescription}
                                            name='sDescription'
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
                                            onChange={changeContent}
                                            setContents={state.content}
                                            name='content'
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
export default withRouter(Create)
