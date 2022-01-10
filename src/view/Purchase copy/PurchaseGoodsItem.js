import React from 'react'
import CreateContainer from '../../containers/Purchase/Item/CreateGoodsContainer'
import { withRouter } from 'react-router'

const PurchaseGoodsItem = (props) => {
    let { match } = props

    let id = match.params.id

    var viewContainer = null

    if (id == 'add') {
        viewContainer = <CreateContainer></CreateContainer>
    }

    return <div>{viewContainer}</div>
}

export default withRouter(PurchaseGoodsItem)
