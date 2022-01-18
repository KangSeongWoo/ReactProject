import React from 'react'
import ListContainer from '../../containers/OrderStock/List/ListContainer'
import { withRouter } from 'react-router-dom'

const OrderStock = () => {
    var viewContainer = null

    viewContainer = <ListContainer></ListContainer>

    return <div>{viewContainer}</div>
}

export default withRouter(OrderStock);
