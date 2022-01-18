import loadable from '@loadable/component'

const Index             = loadable(() => import('../view/Common/Index'))
const AfterService      = loadable(() => import('../view/AfterService/AfterService'))
const Order_OrderList   = loadable(() => import('../view/Order/OrderList'))
const Good              = loadable(() => import('../view/Goods/Good'))
const PurchaseItem      = loadable(() => import('../view/Purchase/PurchaseItem'))
const DepositDomestic   = loadable(() => import('../view/DepositDomestic/DepositDomestic')) // 국내입고
const DepositImport     = loadable(() => import('../view/DepositImport/DepositImport')) // 해외입고
const ReleaseDomestic   = loadable(() => import('../view/ReleaseDomestic/ReleaseDomestic')) // 출고(내수)
const ReleaseImport     = loadable(() => import('../view/ReleaseImport/ReleaseImport')) // 출고(수입)
const Move              = loadable(() => import('../view/Move/Move')) // 이동
const OrderStockList    = loadable(() => import('../view/OrderStock/OrderStock'))
const Search            = loadable(() => import('../view/Search/Search'));

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
    }
]

export default routes
