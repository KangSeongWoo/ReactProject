import React from 'react'
import CreateContainer from '../../containers/Purchase/Item/CreateContainer'
import CreateGoodsContainer from '../../containers/Purchase/Item/CreateGoodsContainer'
import EditContainer from '../../containers/Purchase/Item/EditContainer'
import ListContainer from '../../containers/Purchase/List/ListContainer'

import { withRouter } from 'react-router-dom'

const PurchaseItem = (props) => {
    let { match } = props

    let id = match.params.id

    var viewContainer = null

    if (id == 'addOrder') {
        viewContainer = <CreateContainer></CreateContainer>
    } else if (id == 'addProduct') {
        viewContainer = <CreateGoodsContainer></CreateGoodsContainer>
    } else if (id == 'list') {
        viewContainer = <ListContainer></ListContainer>
    } else {
        viewContainer = <EditContainer id={id}></EditContainer>
    }

    return <div>{viewContainer}</div>
}

export default withRouter(PurchaseItem);

