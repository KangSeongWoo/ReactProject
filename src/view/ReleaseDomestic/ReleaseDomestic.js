import React from 'react'
import ReleaseOrderContainer from '../../containers/ReleaseDomestic/Item/ReleaseOrderContainer'
import ReleaseOrderListContainer from '../../containers/ReleaseDomestic/List/ReleaseOrderListContainer'
import ReleaseProcessContainer from '../../containers/ReleaseDomestic/Item/ReleaseProcessContainer'
import ReleaseProcessListContainer from '../../containers/ReleaseDomestic/List/ReleaseProcessListContainer'
import ReleaseProcessOneContainer from '../../containers/ReleaseDomestic/Item/ReleaseProcessOneContainer'
import ReleaseOrderOneContainer from '../../containers/ReleaseDomestic/Item/ReleaseOrderOneContainer'

import { withRouter } from 'react-router'

const ReleaseDomestic = (props) => {
    let { match, location } = props

    let id = match.params.id
    let params = location.search

    var viewContainer = null

    if (id == 'releaseOrder') {
        viewContainer = <ReleaseOrderContainer></ReleaseOrderContainer> // 출고지시
    } else if (id == 'releaseOrderList') {
        viewContainer = <ReleaseOrderListContainer></ReleaseOrderListContainer> // 출고지시리스트
    } else if (id == 'releaseProcess') {
        viewContainer = <ReleaseProcessContainer></ReleaseProcessContainer> // 출고처리
    } else if (id == 'releaseProcessList') {
        viewContainer = <ReleaseProcessListContainer></ReleaseProcessListContainer> // 출고리스트
    } else if (id == 'releaseProcessOne') {
        viewContainer = <ReleaseProcessOneContainer params={params}></ReleaseProcessOneContainer> // 출고리스트 단건
    } else if (id == 'releaseOrderOne') {
        viewContainer = <ReleaseOrderOneContainer params={params}></ReleaseOrderOneContainer> // 출고지시리스트 단건
    }

    return <div>{viewContainer}</div>
}

export default withRouter(ReleaseDomestic);
