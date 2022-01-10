import React, { useEffect, useLayoutEffect } from 'react';
import { Route,withRouter, Switch, Redirect } from 'react-router-dom'
import { Layout, BackTop } from 'antd'
import '../../style/layout.css'
import routes from '../../routes/index'
import Https from '../../api/http'

import AppHeader from '../template/AppHeader'
import AppAside from '../template/AppAside'
import AppFooter from '../template/AppFooter'

const { Content } = Layout

const LayoutTemplate = (props) => {
    const { menuToggle, avatar, menu, auth, LOGIN, LOGOUT, MENU_CLICK } = props;

    useLayoutEffect(() => {
        isLogin();
    }, [])

    // 로그인 여부 확인
    const isLogin = async () => {
        try {
            if (!localStorage.getItem('user')) {
                props.history.push('/login')
            } else {
                return Https.getCurrentUser()
                    .then(response => {
                        console.log(response)
                        localStorage.setItem('user', JSON.stringify(response.data.user))

                        let user = localStorage.getItem('user')
                        LOGIN(user);
                    })
                    .catch(error => {
                        console.error(error)
                        
                    }) // ERROR
            }
        } catch (e) {
            console.error(e)
            localStorage.clear()
            window.location.reload()
        }
    }

    return (
        <Layout className='app'>
            <BackTop />
            <AppAside menuToggle={menuToggle} menu={menu} />
            <Layout style={{ marginLeft: menuToggle ? '80px' : '200px', minHeight: '100vh' }}>
                <AppHeader
                    menuToggle={menuToggle}
                    menuClick={MENU_CLICK}
                    avatar={avatar}
                    logOut={LOGOUT}
                />
                <Content className='content'>
                    <Switch>
                        {routes.map(item => {
                            return (
                                <Route
                                    key={item.path}
                                    path={item.path}
                                    exact={item.exact}
                                    render={props =>
                                        !auth ? (
                                            <item.component {...props} />
                                        ) : item.auth && item.auth.indexOf(auth) !== -1 ? (
                                            <item.component {...props} />
                                        ) : (
                                            <Redirect to='/404' {...props} />
                                        )
                                    }></Route>
                            )
                        })}
                        <Redirect to='/404' />
                    </Switch>
                </Content>
                <AppFooter />
            </Layout>
        </Layout>
    )
}

export default withRouter(LayoutTemplate)