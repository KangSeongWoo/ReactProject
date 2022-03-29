import React from 'react';
import { Layout, Calendar } from 'antd'
import { withRouter } from 'react-router-dom'

const Index = (props) => {
    return (
        <Layout className='index animated fadeIn' style={{ border: '1px solid rgba(0,0,0,.25)'}}>
            <Calendar style={{height : props.height, overflowY : 'scroll'}}/>
        </Layout>
    )
}

export default withRouter(Index) 