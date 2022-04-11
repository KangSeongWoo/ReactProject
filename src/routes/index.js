import loadable from '@loadable/component'

const Index                 = loadable(() => import('../views/Common/Index'))
const AfterService          = loadable(() => import('../views/AfterService/AfterService'))
const Order_OrderList       = loadable(() => import('../views/Order/OrderList'))
const Good                  = loadable(() => import('../views/Goods/Good'))
const PurchaseItem          = loadable(() => import('../views/Purchase/PurchaseItem'))
const DepositDomestic       = loadable(() => import('../views/DepositDomestic/DepositDomestic')) // 국내입고
const DepositImport         = loadable(() => import('../views/DepositImport/DepositImport')) // 해외입고
const ReleaseDomestic       = loadable(() => import('../views/ReleaseDomestic/ReleaseDomestic')) // 출고(내수)
const ReleaseImport         = loadable(() => import('../views/ReleaseImport/ReleaseImport')) // 출고(수입)
const Move                  = loadable(() => import('../views/Move/Move')) // 이동
const OrderStockList        = loadable(() => import('../views/OrderStock/OrderStock'))
const Search                = loadable(() => import('../views/Search/Search'));
const InventoryManagement   = loadable(() => import('../views/InventoryManagement/InventoryManagement'));

const routes = [
    { path: '/index', exact: true, name: 'Index', component: Index, auth: [1] },
    { path: '/asManager/:id', exact: false, name: 'A/S관리', component: AfterService, type: 'AfterService' },
    { path: '/asManager', exact: false, name: 'A/S관리', component: AfterService, type: 'AfterService' },
    {
        path: '/order/orderList/:id',
        exact: false,
        name: '주문리스트조회',
        component: Order_OrderList,
        type: 'Order_OrderList'
    },
    {
        path: '/order/orderList/',
        exact: false,
        name: '주문리스트조회',
        component: Order_OrderList,
        type: 'Order_OrderList'
    },
    {
        path: '/Goods/:id',
        exact: false,
        name: '상품관리',
        component: Good,
        type: 'Good'
    },
    {
        path: '/Goods',
        exact: false,
        name: '상품리스트',
        component: Good,
        type: 'Good'
    },
    {
        path: '/Purchase/:id',
        exact: false,
        name: '발주관리(주문)',
        component: PurchaseItem,
        type: 'PurchaseItem'
    },
    {
        path: '/Purchase/processOne/:id',
        exact: false,
        name: '발주진행관리(주문)',
        component: PurchaseItem,
        type: 'PurchaseItem'
    },
    {
        path: '/Purchase/completeOne/:id',
        exact: false,
        name: '발주완료관리(주문)',
        component: PurchaseItem,
        type: 'PurchaseItem'
    },
    {
        path: '/DepositDomestic/:id',
        exact: false,
        name: '국내입고관리',
        component: DepositDomestic,
        type: 'DepositDomestic'
    },
    {
        path: '/DepositImport/:id',
        exact: false,
        name: '국내입고관리',
        component: DepositImport,
        type: 'DepositImport'
    },
    {
        path: '/ReleaseDomestic/:id',
        exact: false,
        name: '출고(가구)',
        component: ReleaseDomestic,
        type: 'ReleaseDomestic'
    },
    {
        path: '/ReleaseImport/:id',
        exact: false,
        name: '출고(조명)',
        component: ReleaseImport,
        type: 'ReleaseImport'
    },
    {
        path: '/InventoryManagement/:id',
        exact: false,
        name: '기타입출고',
        component: InventoryManagement,
        type: 'InventoryManagement'
    },
    {
        path: '/Move/:id',
        exact: false,
        name: '이동',
        component: Move,
        type: 'Move'
    },
    {
        path: '/Search',
        exact: false,
        name: '검색어',
        component: Search,
        type: 'Search'
    },
    {
        path: '/OrderStock',
        exact: false,
        name: '고도몰주문관리',
        component: OrderStockList,
        type: 'OrderStockList'
    },
]

export default routes
