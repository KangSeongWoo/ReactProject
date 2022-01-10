import React from 'react'
import ReleaseOrderContainer from '../../containers/ReleaseImport/Item/ReleaseOrderContainer'
import ReleaseOrderListContainer from '../../containers/ReleaseImport/List/ReleaseOrderListContainer'
import ReleaseProcessContainer from '../../containers/ReleaseImport/Item/ReleaseProcessContainer'
import ReleaseProcessListContainer from '../../containers/ReleaseImport/List/ReleaseProcessListContainer'
import ReleaseProcessOneContainer from '../../containers/ReleaseImport/Item/ReleaseProcessOneContainer'
import ReleaseOrderOneContainer from '../../containers/ReleaseImport/Item/ReleaseOrderOneContainer'

import { withRouter } from 'react-router'

const ReleaseImport = (props) => {
    let { match, location } = props;

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

export default withRouter(ReleaseImport);
