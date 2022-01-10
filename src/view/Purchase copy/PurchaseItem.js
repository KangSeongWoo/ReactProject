import React from 'react'
import CreateContainer from '../../containers/Purchase/Item/CreateContainer'
import EditContainer from '../../containers/Purchase/Item/EditContainer'
import ListContainer from '../../containers/Purchase/List/ListContainer'

import { withRouter } from 'react-router'

const PurchaseItem = (props) => {
    let { match } = props

    let id = match.params.id

    var viewContainer = null

    if (id == 'add') {
        viewContainer = <CreateContainer></CreateContainer>
    } else if (id == 'list') {
        viewContainer = <ListContainer></ListContainer>
    } else {
        viewContainer = <EditContainer id={id}></EditContainer>
    }

    return <div>{viewContainer}</div>
}

export default withRouter(PurchaseItem);

