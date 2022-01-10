import React from 'react'
import { Layout } from 'antd'
import { withRouter } from 'react-router-dom'

const { Footer } = Layout

const AppFooter = () => {
    return (
        <Footer className='footer'>TRDST 어드민 &copy;2021 Created By TRDST</Footer>
    )
}

export default withRouter(AppFooter)