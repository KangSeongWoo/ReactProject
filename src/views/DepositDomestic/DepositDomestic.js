import React from 'react'
import { withRouter } from 'react-router-dom'
import DepositGoodsContainer from '../../containers/DepositDomestic/Item/DepositGoodsContainer'
import DepositOneContainer from '../../containers/DepositDomestic/Item/DepositOneContainer'
import DepositListContainer from '../../containers/DepositDomestic/List/DepositListContainer'
import TrackingBLContainer from '../../containers/DepositDomestic/Item/TrackingBLContainer'

const DepositDomestic = (props) => {
    let { match, location } = props

    let id = match.params.id
    let params = location.search

    

    var viewContainer = null

    if (id == 'depositGoods') {
        viewContainer = <DepositGoodsContainer></DepositGoodsContainer>
    } else if (id == 'depositList') {
        viewContainer = <DepositListContainer></DepositListContainer>
    } else if (id == 'depositOne') {
        viewContainer = <DepositOneContainer params={params}></DepositOneContainer>
    } else if (id == 'trackingBL') {
        viewContainer = <TrackingBLContainer></TrackingBLContainer>
    }

    return <div>{viewContainer}</div>
}

export default withRouter(DepositDomestic);