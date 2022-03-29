import React, { Component , useMemo } from 'react'
import { withRouter } from 'react-router-dom'
import queryStirng from 'query-string'

class LinkCellRenderer extends Component {
    toGo = purchaseNo => {
        let url = ''
        let param = []
        param.displayKd = 'POP'

        url = '/#/purchase/' + purchaseNo + '?' + queryStirng.stringify(param)
        window
            .open(
                url,
                '상세' + new Date(),
                'toolbar=no,location=no,directories=no,status=no,scrollbars=yes,resizable=no,width=1610,height=1402,top=, left= '
            )
            .focus()

        //this.props.history.push(url)
    }

    render() {
        return (
            <a herf={this.props.history.url} onClick={e => this.toGo(this.props.data.purchaseNo)}>
                {this.props.value}
            </a>
        )
    }
}

export default withRouter(LinkCellRenderer)
