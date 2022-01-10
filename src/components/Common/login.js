import React from 'react';
import { Layout, Form, Input, Button, Icon, Divider } from 'antd';
import Https from '../../api/http'
import { withRouter } from 'react-router-dom'

import '../../style/login.css'

const Login = (props) => {
    const { LOGIN } = props;

    const handleLogin = (e) => {
        e.preventDefault();
        let params = {};

        params.email = e.target[0].value;
        params.password = e.target[1].value;

        return Https.login(params)
            .then(response => {
                console.log(response)
                if (response.status === 200) {
                    let user = response.data.data.user;

                    LOGIN(user);

                    localStorage.setItem('user', JSON.stringify(user))
                    localStorage.setItem('token', user.token)
                    localStorage.setItem('refreshToken', user.refreshToken)
                    localStorage.setItem('auth', '')
                    props.history.push('/')
                } else {

                }
            })
            .catch(error => {
                console.error(error)

            }) // ERROR
    }
    return (
        <Layout className='login animated fadeIn'>
            <div className='model'>
                <div className='login-form'>
                    <h3>로그인</h3>
                    <Divider />
                    <Form onSubmit={(e) => handleLogin(e)}>
                        <Form.Item>
                            <Input
                                prefix={<Icon type='user' style={{ color: 'rgba(0,0,0,.25)' }} />}
                                placeholder='이메일'
                            />
                        </Form.Item>
                        <Form.Item>
                            <Input
                                prefix={<Icon type='lock' style={{ color: 'rgba(0,0,0,.25)' }} />}
                                type='password'
                                placeholder='패스워드'
                            />
                        </Form.Item>
                        <Form.Item>
                            <Button
                                type='primary'
                                htmlType='submit'
                                className='login-form-button'>
                                로그인
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            </div>
        </Layout>
    )
}

export default withRouter(Login)