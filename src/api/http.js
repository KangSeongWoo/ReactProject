import instance from './index'

const baseUrl = process.env.REACT_APP_API_URL

class Https {
    // 로그인
    login = params => instance.post(baseUrl + '/users/login', params)

    // 카테고리 리스트 조회
    getFullCategories = () => instance.get(baseUrl + '/category/full_categories', {})

    // 브랜드 리스트 조회
    getBrandSearchList = param => instance.get(baseUrl + '/common/brand_search', { params: param })

    // 이미지 업로드
    postUploadImage = (params, config) => instance.post(baseUrl + '/file/uploadFile', params, config)

    // 이미지 삭제
    postDeleteImage = id => instance.post(baseUrl + '/file/deleteFile/' + id)

    // 구매처 리스트 조회(거래처 없음 제외/수량 제외)
    getPurchaseVendorSearch = param => instance.get(baseUrl + '/common/purchase_vendor_search', { params: param })

    // 상품상세 정보 호출
    getGoodsDetail = id => instance.get(baseUrl + '/goods/' + id)
    
    // 상품상세 정보 호출 V2
    getGoodsDetailV2 = id => instance.get(baseUrl + '/goods/v2/items/' + id)

    // 상품 리스트 내역 호출(마스터 기준)
    getGoodsMasterList = param => instance.get(baseUrl + '/goods/items/master', { params: param })
    
    // 상품 리스트 내역 호출(마스터 기준) V2
    getGoodsMasterListV2 = param => instance.get(baseUrl + '/goods/v2/items', { params: param })

    // 구매처 리스트 조회(거래처 없음 포함 / 수량 포함)
    getPurchaseVendors = () => instance.get(baseUrl + '/purchase/vendors')

    // 구매처 리스트 조회
    getPurchaseVendorsItem = id => instance.get(baseUrl + '/purchase/vendors/' + id)

    // 발주 사후 저장하기
    postSavePurchase = (params, config) =>
        instance.post(baseUrl + '/purchase/' + params.purchaseId + '/update', params, config)

    // 발주 저장하기
    postAddPurchase = (params, config) => instance.post(baseUrl + '/purchase', params, config)

    // 상품 리스트 내역 호출(디테일 기준)
    getGoodsDetailList = param => instance.get(baseUrl + '/goods/items/detail', { params: param })

    // 현재 유저 확인
    getCurrentUser = () => instance.get(baseUrl + '/user')

    // 발주 사후 발주 목록
    getPurchase = id => instance.get(baseUrl + '/purchase/item/' + id)

    // 발주 리스트 발주 목록
    getPurchaseList = param => instance.get(baseUrl + '/purchase/items', { params: param })

    // 고도몰 주문관리 관련
    SaveOrderStock = (params, config) => instance.post(baseUrl + '/order/order-stock', params, config)

    // 고도몰 주문관리 관련
    getOrderStock = () => instance.get(baseUrl + '/order/order-stock')

    // 입고리스트 상세 수정(메모추가)
    postModifyDeposit = (params, config) =>
        instance.post(baseUrl + '/deposit/items/update/' + params.depositNo, params, config)

    // 주문 리스트 조회
    getOrderList = param => instance.get(baseUrl + '/order/items', { params: param })

    // 상품 등록
    postSaveGoods = (params, config) => instance.post(baseUrl + '/goods/save', params, config)
    
    // 상품 등록 V2
    postSaveGoodsV2 = (params, config) => instance.post(baseUrl + '/goods/v2/save', params, config)

    // 주문 리스트 조회
    getOrderList = param => instance.get(baseUrl + '/order/items', { params: param })

    //공통 - 주문상태조회
    getOrderStatusList = param => instance.get(baseUrl + '/common/order_status', { params: param })

    //공통 - 창고 목록 호출
    getStorageList = param => instance.get(baseUrl + '/common/storages', { params: param })

    //공통 - 구매처 목록 호출
    getVendorList = () => instance.get(baseUrl + '/common/vendors')

    //주문 - 주문단건내역
    getOrderOne = param => instance.get(baseUrl + '/order/items/' + param.orderId)

    //주문 - 상품별주문리스트
    getOrderListByProducts = param => instance.get(baseUrl + '/order/goods/items', { params: param })

    //상품 - 재고리스트 조회
    getStockList = param => instance.get(baseUrl + '/goods/stock/storage/' + param.get("storageId"), { params: param })

    //입고처리 메뉴 -> 조회버튼
    getPurchaseOneByPurchaseNo = params => instance.get(baseUrl + '/deposit/indicate/' + params.purchaseNo)

    //입고처리 메뉴 -> 입고수량 저장하기
    postSaveDeposit = (params, config) => instance.post(baseUrl + '/deposit', params, config)

    //입고처리 메뉴 -> 발주조회 -> 조회
    getPurchaseListByDeposit = param => instance.get(baseUrl + '/deposit/purchase/items', { params: param })

    //입고처리 메뉴 -> 입고리스트 조회
    getDepositList = param => instance.get(baseUrl + '/deposit/items', { params: param })

    //입고처리 메뉴 -> 입고리스트 단건조회
    getDepositOne = params => instance.get(baseUrl + '/deposit/items/' + params.depositNo)

    //출고지시 메뉴
    getReleaseOrder = param => instance.get(baseUrl + '/ship/deposit/items', { params: param })

    //출고지시 메뉴 -> 출고지시저장하기
    postOrderRelease = (params, config) => instance.post(baseUrl + '/ship/indicate', params, config)

    //출고지시 리스트
    getReleaseOrderList = param => instance.get(baseUrl + '/ship/indicate/items', { params: param })

    //출고지시 리스트 -> 출고지시리스트 단건조회
    getReleasOne = params => instance.get(baseUrl + '/ship/indicate/' + params.shipId)

    //출고처리 메뉴
    getReleaseProcess = param => instance.get(baseUrl + '/ship/items', { params: param })

    //출고처리 메뉴 -> 출고처리저장하기
    postOrderProcess = (params, config) => instance.post(baseUrl + '/ship', params, config)

    //출고리스트
    getReleaseProcessList = param => instance.get(baseUrl + '/ship/ship/items', { params: param })

    //출고리스트 메뉴 -> 입고리스트 단건조회
    getReleaseProcessOne = params => instance.get(baseUrl + '/ship/ship/' + params.shipId)

    //이동 -> 주문이동지시
    getOrderItemMoveOrder = param => instance.get(baseUrl + '/move/items/indicate/order', { params: param })

    //이동 -> 주문이동지시 -> 주문이동지시저장하기
    postOrderItemMoveOrder = (params, config) => instance.post(baseUrl + '/move/indicate/order', params, config)

    //이동 -> 상품이동지시 -> 상품선택창
    getProductItemMoveOrder = param => instance.get(baseUrl + '/move/items/goods', { params: param })

    //이동 -> 상품이동지시 -> 상품이동지시저장하기
    postProductItemMoveOrder = (params, config) => instance.post(baseUrl + '/move/indicate/goods', params, config)

    //이동 -> 이동지시리스트
    getMoveOrderList = param => instance.get(baseUrl + '/move/items/indicate', { params: param })

    //이동 -> 이동지시리스트 단건
    getMoveOrderOne = params => instance.get(baseUrl + '/move/item/' + params.shipId)

    //이동 -> 이동처리 조회
    getMoveProcess = param => instance.get(baseUrl + '/move/move/items', { params: param })

    //이동 -> 이동처리 저장
    postMoveProcess = (params, config) => instance.post(baseUrl + '/move/move', params, config)

    //이동 -> 이동리스트
    getMoveProcessList = param => instance.get(baseUrl + '/move/items', { params: param })

    //이동 -> 이동지시리스트 단건
    getMoveProcessOne = params => instance.get(baseUrl + '/move/moved/item/' + params.shipId)

    //네이버 검색어 3.35.25.1:8080/napi/keyword?keyword=카카오
    getKeywordsList = param => instance.get(baseUrl + '/napi/keyword', { params: param })

    //이동 -> 이동지시리스트 단건
    getOrderStockOne = params => instance.get(baseUrl + '/order/order-stock/items/' + params.orderStockId)

    //발주, 이동 출력관련
    getPrintDt = params => instance.get(baseUrl + '/purchase/update/printdt', { params: params })

    //주문 -> 주문취소리스트
    getOrderCancelList = param => instance.get(baseUrl + '/order/cancel/items', { params: param })

    //주문 -> 주문취소
    postCancelOrder = (params, config) => instance.post(baseUrl + '/order/items/cancel', params, config)

    //이동리스트 엑셀 업로드 내용 DB 저장
    uploadExcelDB = (params, config) => instance.post(baseUrl + '/move/excel', params, config)
    
    //기타입고
    postSaveDepositEtc = (params, config) => instance.post(baseUrl + '/deposit/etc', params, config)
    
    //기타출고
    postOrderReleaseEtc = (params, config) => instance.post(baseUrl + '/ship/etc', params, config)
    
    //기타입고리스트
    getDepositListEtc = param => instance.get(baseUrl + '/deposit/etc/items', { params: param })
        
    //가타출고리스트
    getReleaseListEtc = param => instance.get(baseUrl + '/ship/etc/items', { params: param })
    
    //기타입고 단건
    getDepositOneEtc = params => instance.get(baseUrl + '/deposit/etc/items/' + params.depositNo)
    
    //기타출고 단건
    getReleasOneEtc = params => instance.get(baseUrl + '/ship/etc/items/' + params.depositNo)
    
    //미발주내역조회
    getListBeforeOrder = param => instance.get(baseUrl + '/order/waitStatus/items', { params: param })
    
    //관리상품주문리스트
    getSelectiveList = param => instance.get(baseUrl + '/order/goods/special-items', { params: param })
    
    //상품정보 단건 변경
    postProductInfoUpdate = param => instance.get(baseUrl + '/goods/change/vendor', { params: param })
    
    //상품 옵션 마스터 관리
    manageOptionMaster = (params, config) => instance.post(baseUrl + '/goods/v3/master', params, config)
    
    //발주건 삭제
    removePurchaseRows = (params, config) => instance.post(baseUrl + '/purchase/cancel/', params, config)
}

export default new Https()
