import React from 'react'
import ListContainer from '../../containers/Order/OrderList/ListContainer'
import DetailContainer from '../../containers/Order/OrderList/DetailContainer'
import ListByProductsContainer from '../../containers/Order/OrderList/ListByProductsContainer'
import { withRouter } from 'react-router'

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
    } else {
        viewContainer = <ListContainer></ListContainer>
    }

    return <div>{viewContainer}</div>
}

export default withRouter(OrderList)