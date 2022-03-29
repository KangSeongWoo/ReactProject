import React from 'react'
import ListContainer from '../../containers/Order/OrderList/ListContainer'
import DetailContainer from '../../containers/Order/OrderList/DetailContainer'
import ListByProductsContainer from '../../containers/Order/OrderList/ListByProductsContainer'
import ListForCancelContainer from '../../containers/Order/OrderList/ListForCancelContainer'
import ListBeforeOrderContainer from '../../containers/Order/OrderList/ListBeforeOrderContainer'
import ListBySelectiveContainer from '../../containers/Order/OrderList/ListBySelectiveContainer'
import { withRouter } from 'react-router-dom'

const OrderList = (props) => {
    let { match } = props
    let { location } = props

    

    var viewContainer = null

    let id = match.params.id
    let params = location.search

    if (id == 'detail') {
        viewContainer = <DetailContainer params={params}></DetailContainer>
    } else if (id == 'byProducts') {
        viewContainer = <ListByProductsContainer params={params}></ListByProductsContainer>
    } else if (id == 'forCancel') {
        viewContainer = <ListForCancelContainer params={params}></ListForCancelContainer>
    } else if (id == 'beforeOrderList') {
        viewContainer = <ListBeforeOrderContainer params={params}></ListBeforeOrderContainer>
    } else if (id == 'selectiveOrderList') {
        viewContainer = <ListBySelectiveContainer params={params}></ListBySelectiveContainer>
    } else {
        viewContainer = <ListContainer></ListContainer>
    }

    return <div>{viewContainer}</div>
}

export default withRouter(OrderList)