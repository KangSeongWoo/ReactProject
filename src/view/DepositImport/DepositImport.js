import React from 'react'
import { withRouter } from 'react-router'
import DepositGoodsContainer from '../../containers/DepositImport/Item/DepositGoodsContainer'
import DepositOneContainer from '../../containers/DepositImport/Item/DepositOneContainer'
import DepositListContainer from '../../containers/DepositImport/List/DepositListContainer'

const DepositImport = (props) => {
    let { match, location }   = props

    let id = match.params.id
    let params = location.search

    var viewContainer = null

    if (id == 'depositGoods') {
        viewContainer = <DepositGoodsContainer></DepositGoodsContainer>
    } else if (id == 'depositList') {
        viewContainer = <DepositListContainer></DepositListContainer>
    } else if (id == 'depositOne') {
        viewContainer = <DepositOneContainer params={params}></DepositOneContainer>
    }

    return <div>{viewContainer}</div>
}

export default withRouter(DepositImport)