import React from 'react'
import CreateContainer from '../../containers/Purchase/Item/CreateContainer'
import CreateGoodsContainer from '../../containers/Purchase/Item/CreateGoodsContainer'
import EditContainer from '../../containers/Purchase/Item/EditContainer'
import ListContainer from '../../containers/Purchase/List/ListContainer'

import CreateV2Container from '../../containers/Purchase/Item/CreateV2Container'
import PurchaseProcessListContainer from '../../containers/Purchase/List/PurchaseProcessListContainer'
import PurchaseCompleteListContainer from '../../containers/Purchase/List/PurchaseCompleteListContainer'
import ProcessOneEditContainer from '../../containers/Purchase/Item/ProcessOneEditContainer'
import CompleteOneEditContainer from '../../containers/Purchase/Item/CompleteOneEditContainer'

import { withRouter } from 'react-router-dom'

const PurchaseItem = (props) => {
    let { match } = props

    let id = match.params.id
    let params = props.location.search
    var viewContainer = null

    if (id == 'addOrder') {
        viewContainer = <CreateContainer></CreateContainer>
    } else if (id == 'addProduct') {
        viewContainer = <CreateGoodsContainer></CreateGoodsContainer>
    } else if (id == 'list') {
        viewContainer = <ListContainer></ListContainer>
    } else if (id == 'addOrderV2') {
        viewContainer = <CreateV2Container></CreateV2Container>
    } else if (id == 'purchaseCompleteList') {
        viewContainer = <PurchaseCompleteListContainer></PurchaseCompleteListContainer>
    } else if (id == 'purchaseProcessList') {
        viewContainer = <PurchaseProcessListContainer></PurchaseProcessListContainer>
    } else if (id == 'processOne') {
        viewContainer = <ProcessOneEditContainer params={params}></ProcessOneEditContainer>
    } else if (id == 'completeOne') {
        viewContainer = <CompleteOneEditContainer params={params}></CompleteOneEditContainer>
    } else {
        viewContainer = <EditContainer id={id}></EditContainer>
    }

    return <div>{viewContainer}</div>
}

export default withRouter(PurchaseItem);

