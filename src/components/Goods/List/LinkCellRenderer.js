import React, { Component , useMemo } from 'react'
import { withRouter } from 'react-router-dom'

class LinkCellRenderer extends Component {
    toGoods = assortId => {
        let url = '/Goods/' + assortId
        this.props.history.push(url)
    }

    render() {
        return (
            <a herf='#' onClick={e => this.toGoods(this.props.data.assortId)}>
                {this.props.value}
            </a>
        )
    }
}

export default withRouter(LinkCellRenderer)
