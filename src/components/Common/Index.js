import React from 'react';
import { Layout, Row, Col, Icon } from 'antd'
import screenfull from 'screenfull'
import { withRouter } from 'react-router-dom'

const Index = () => {
    const fullToggle = () => {
        if (screenfull.isEnabled) {
            screenfull.request(document.getElementById('bar'))
        }
    }
    return (
        <Layout className='index animated fadeIn'>
            <Row>
                <Col>
                    <div className='base-style'>
                        <div className='bar-header'>
                            <div>샘플페이지</div>
                            <Icon type='fullscreen' style={{ cursor: 'pointer' }} onClick={fullToggle} />
                        </div>
                    </div>
                </Col>
            </Row>
        </Layout>
    )
}

export default withRouter(Index)