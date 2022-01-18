export const menu = [
    {
        key: '/index',
        title: '홈',
        icon: 'home'
    },
    {
        title: '상품',
        key: '/goods',
        icon: 'form',
        subs: [
            { title: '상품리스트', key: '/Goods/list', icon: '' },
            { title: '상품등록', key: '/Goods/add', icon: '' }
        ]
    },
    {
        title: '재고관리',
        key: '/goodsStock',
        icon: 'form',
        subs: [{ title: '재고리스트', key: '/Goods/stockList', icon: '' }]
    },
    {
        title: '주문',
        key: '/order',
        icon: 'form',
        subs: [
            // { title: '주문별주문리스트', key: '/order/orderList', icon: '' },
            { title: '상품별주문리스트', key: '/order/orderList/byProducts', icon: '' },
            { title: '주문취소', key: '/order/orderList/forCancel', icon: '' }
        ]
    },
    {
        title: '발주',
        key: '/purchase',
        icon: 'form',
        subs: [
            { title: '발주등록(주문)', key: '/Purchase/addOrder', icon: '' },
            { title: '발주등록(상품)', key: '/Purchase/addProduct', icon: '' },
            { title: '발주리스트', key: '/Purchase/list', icon: '' }
        ]
    },
    {
        title: '해외입고',
        key: '/depositImport',
        icon: 'form',
        subs: [
            { title: '입고처리', key: '/DepositImport/depositGoods', icon: '' },
            { title: '입고리스트', key: '/DepositImport/depositList', icon: '' }
        ]
    },
    {
        title: '해외이동',
        key: '/move',
        icon: 'form',
        subs: [
            { title: '주문이동지시', key: '/Move/orderItemMoveOrder', icon: '' },
            { title: '상품이동지시', key: '/Move/productItemMoveOrder', icon: '' },
            { title: '이동지시리스트', key: '/Move/moveOrderList', icon: '' },
            { title: '이동처리', key: '/Move/moveProcess', icon: '' },
            { title: '이동리스트', key: '/Move/moveProcessList', icon: '' }
        ]
    },
    {
        title: '해외출고',
        key: '/releaseImport',
        icon: 'form',
        subs: [
            { title: '출고지시', key: '/ReleaseImport/releaseOrder', icon: '' },
            { title: '출고지시리스트', key: '/ReleaseImport/releaseOrderList', icon: '' },
            { title: '출고처리', key: '/ReleaseImport/releaseProcess', icon: '' },
            { title: '출고리스트', key: '/ReleaseImport/releaseProcessList', icon: '' }
        ]
    },
    {
        title: '국내입고',
        key: '/depositDomestic',
        icon: 'form',
        subs: [
            { title: '입고처리', key: '/DepositDomestic/depositGoods', icon: '' },
            { title: '입고리스트', key: '/DepositDomestic/depositList', icon: '' }
        ]
    },
    {
        title: '국내출고',
        key: '/releaseDomestic',
        icon: 'form',
        subs: [
            { title: '출고지시', key: '/ReleaseDomestic/releaseOrder', icon: '' },
            { title: '출고지시리스트', key: '/ReleaseDomestic/releaseOrderList', icon: '' },
            { title: '출고처리', key: '/ReleaseDomestic/releaseProcess', icon: '' },
            { title: '출고리스트', key: '/ReleaseDomestic/releaseProcessList', icon: '' }
        ]
    },
    {
        key: '/asManager',
        title: 'A/S관리',
        icon: 'form',
        view: 'list'
    },
    {
        title: '검색어',
        key: '/search',
        icon: 'form',
        subs: [{ title: '검색어', key: '/Search/Search', icon: '' }]
    },
    {
        title: '고도몰주문관리',
        key: '/orderstock',
        icon: 'form',
        subs: [{ title: '주문관리', key: '/OrderStock', icon: '' }]
    }
]
