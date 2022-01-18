import React from 'react'
import MoveOrderOneContainer from '../../containers/Move/Item/MoveOrderOneContainer'
import MoveProcessContainer from '../../containers/Move/Item/MoveProcessContainer'
import MoveProcessOneContainer from '../../containers/Move/Item/MoveProcessOneContainer'
import OrderItemMoveOrderContainer from '../../containers/Move/Item/OrderItemMoveOrderContainer'
import ProductItemMoveOrderContainer from '../../containers/Move/Item/ProductItemMoveOrderContainer'

import MoveOrderListContainer from '../../containers/Move/List/MoveOrderListContainer'
import MoveProcessListContainer from '../../containers/Move/List/MoveProcessListContainer'

import { withRouter } from 'react-router-dom'

const Move = (props) => {
    let { match, location } = props;

    let id = match.params.id
    let params = location.search

    var viewContainer = null

    if (id == 'moveOrderOne') {
        viewContainer = <MoveOrderOneContainer params={params}></MoveOrderOneContainer>
    } else if (id == 'moveProcess') {
        viewContainer = <MoveProcessContainer></MoveProcessContainer>
    } else if (id == 'moveProcessOne') {
        viewContainer = <MoveProcessOneContainer params={params}></MoveProcessOneContainer>
    } else if (id == 'orderItemMoveOrder') {
        viewContainer = <OrderItemMoveOrderContainer></OrderItemMoveOrderContainer>
    } else if (id == 'productItemMoveOrder') {
        viewContainer = <ProductItemMoveOrderContainer></ProductItemMoveOrderContainer>
    } else if (id == 'moveOrderList') {
        viewContainer = <MoveOrderListContainer></MoveOrderListContainer>
    } else if (id == 'moveProcessList') {
        viewContainer = <MoveProcessListContainer></MoveProcessListContainer>
    }

    return <div>{viewContainer}</div>
}

export default withRouter(Move)
