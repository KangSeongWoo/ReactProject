import React from 'react'
import CreateContainer from '../../containers/Goods/Good/CreateContainer'
import EditContainer from '../../containers/Goods/Good/EditContainer'
import ListContainer from '../../containers/Goods/List/ListContainer'
import StockListContainer from '../../containers/Goods/List/StockListContainer'

import { withRouter } from 'react-router-dom'

const Good = (props) => {
    let { match } = props

    let id = match.params.id

    var viewContainer = null

    if (id == 'add') {
        viewContainer = <CreateContainer></CreateContainer>
    } else if (id == 'list') {
        viewContainer = <ListContainer></ListContainer>
    } else if (id == 'stockList') {
        viewContainer = <StockListContainer></StockListContainer>
    } else {
        viewContainer = <EditContainer id={id}></EditContainer>
    }

    return <div>{viewContainer}</div>
}

export default withRouter(Good)
