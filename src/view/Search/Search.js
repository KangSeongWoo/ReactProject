import React from 'react'
import SearchContainer from '../../containers/Search/Item/SearchContainer'
import { withRouter } from 'react-router-dom'

const Search = () => {
    var viewContainer = null

    viewContainer = <SearchContainer></SearchContainer>

    return <div>{viewContainer}</div>
}

export default withRouter(Search);