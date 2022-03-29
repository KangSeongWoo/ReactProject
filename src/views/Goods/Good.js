import React from 'react'
import CreateContainer from '../../containers/Goods/Good/CreateContainer'
import EditContainer from '../../containers/Goods/Good/EditContainer'
import ListContainer from '../../containers/Goods/List/ListContainer'
import StockListContainer from '../../containers/Goods/List/StockListContainer'
import BrandListContainer from '../../containers/Goods/List/BrandListContainer'
import CategoryListContainer from '../../containers/Goods/List/CategoryListContainer'

import { withRouter } from 'react-router-dom'

const Good = (props) => {
    let { match,location } = props

    let id = match.params.id
    let params = location.search
    

    var viewContainer = null

    if (id == 'add') {
        viewContainer = <CreateContainer></CreateContainer>
    } else if (id == 'list') {
        viewContainer = <ListContainer></ListContainer>
    } else if (id == 'stockList') {
        viewContainer = <StockListContainer></StockListContainer>
    } else if (id == 'brandList') {
        viewContainer = <BrandListContainer></BrandListContainer>
    } else if (id == 'categoryList') {
        viewContainer = <CategoryListContainer></CategoryListContainer> 
    }  else {
        viewContainer = <EditContainer params={params}></EditContainer>
    }

    return <div>{viewContainer}</div>
}

export default withRouter(Good)
