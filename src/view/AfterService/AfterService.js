import React from 'react'
import { withRouter } from 'react-router-dom'
import ListContainer from '../../containers/AfterService/ListContainer'

const AfterService = () => {
    var viewContainer = null

    viewContainer = <ListContainer></ListContainer>

    return <div>{viewContainer}</div>
}

export default withRouter(AfterService);

