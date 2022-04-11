import React from 'react'
import CreateContainer from '../../containers/Goods/Good/CreateContainer'
import EditContainer from '../../containers/Goods/Good/EditContainer'
import ListContainer from '../../containers/Goods/List/ListContainer'
import CreateV2Container from '../../containers/Goods/Good/CreateV2Container'
import EditV2Container from '../../containers/Goods/Good/EditV2Container'
import ListV2Container from '../../containers/Goods/List/ListV2Container'
import StockListContainer from '../../containers/Goods/List/StockListContainer'
import BrandListContainer from '../../containers/Goods/List/BrandListContainer'
import CategoryListContainer from '../../containers/Goods/List/CategoryListContainer'
import MasterPopupContainer from '../../containers/Goods/Good/MasterPopupContainer'

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
    } else if(id == 'edit') {
        viewContainer = <EditContainer params={params}></EditContainer>
    } else if (id == 'stockList') {
        viewContainer = <StockListContainer></StockListContainer>
    } else if (id == 'brandList') {
        viewContainer = <BrandListContainer></BrandListContainer>
    } else if (id == 'categoryList') {
        viewContainer = <CategoryListContainer></CategoryListContainer> 
    } else if (id == 'addV2') {
        viewContainer = <CreateV2Container></CreateV2Container>
    } else if (id == 'listV2') {
        viewContainer = <ListV2Container></ListV2Container>
    } else if(id == 'editV2') {
        viewContainer = <EditV2Container params={params}></EditV2Container>
    } else if(id == 'masterPopup') {
        viewContainer = <MasterPopupContainer></MasterPopupContainer>
    } 

    return <div>{viewContainer}</div>
}

export default withRouter(Good)
