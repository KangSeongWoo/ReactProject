import React from 'react'
import DepositGoodsContainer from '../../containers/InventoryManagement/Item/DepositGoodsContainer'
import ReleaseGoodsContainer from '../../containers/InventoryManagement/Item/ReleaseGoodsContainer'
import DepositGoodsListContainer from '../../containers/InventoryManagement/List/DepositGoodsListContainer'
import ReleaseGoodsListContainer from '../../containers/InventoryManagement/List/ReleaseGoodsListContainer'
import DepositOneContainer from '../../containers/InventoryManagement/Item/DepositOneContainer'
import ReleaseOneContainer from '../../containers/InventoryManagement/Item/ReleaseOneContainer'

import { withRouter } from 'react-router-dom'

const InvertoryManagement = (props) => {
	let { match,location } = props

	let id = match.params.id
	let params = location.search

	

    var viewContainer = null
	
	if (id == 'depositgoods') {
		viewContainer = <DepositGoodsContainer></DepositGoodsContainer>
	} else if (id == 'releasegoods') {
		viewContainer = <ReleaseGoodsContainer></ReleaseGoodsContainer>
	} else if (id == 'depositgoodslist') {
		viewContainer = <DepositGoodsListContainer></DepositGoodsListContainer>
	} else if (id == 'releasegoodslist') {
		viewContainer = <ReleaseGoodsListContainer></ReleaseGoodsListContainer>
	} else if (id == 'depositOne') {
    viewContainer = <DepositOneContainer params={params}></DepositOneContainer>
  } else if (id == 'releaseOne') {
    viewContainer = <ReleaseOneContainer params={params}></ReleaseOneContainer>
  } else {
		viewContainer = <DepositGoodsContainer></DepositGoodsContainer>
	}
  	return <div>{viewContainer}</div>
}

export default withRouter(InvertoryManagement)
