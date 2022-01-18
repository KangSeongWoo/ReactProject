import React, { useEffect, useLayoutEffect, useState } from 'react';
import { Route,withRouter, Switch, Redirect } from 'react-router-dom'
import { Layout, BackTop } from 'antd'
import '../../style/layout.css'
import routes from '../../routes/index'
import Https from '../../api/http'
import Loading from '../../components/Common/Loading/Loading'
import queryStirng from 'query-string'
import { menu } from '../../utils/menu'

import AppHeader from '../template/AppHeader'
import AppAside from '../template/AppAside'
import AppFooter from '../template/AppFooter'

const { Content } = Layout

const LayoutTemplate = (props) => {
    const { menuToggle, user, spin, menuClick, logOut, setUserInfo } = props;
    const { auth } = JSON.parse(localStorage.getItem('user')) ? JSON.parse(localStorage.getItem('user')) : ''
    const [state, setState] = useState({
        avatar : "",
        show: true,
    })

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
                        setUserInfo(response.data.user.id);
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
    
    if (queryStirng.parse(props.location.search).displayKd != 'POP') {
        return (
            <>
                <Loading spinning={spin} />
                <Layout className='app'>
                    <BackTop />
                    <AppAside menuToggle={menuToggle} menu={menu} />
                    <Layout style={{ marginLeft: menuToggle ? '80px' : '200px', minHeight: '100vh' }}>
                        <AppHeader
                            menuToggle={menuToggle}
                            menuClick={() => menuClick(menuToggle)}
                            logOut={logOut}
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
            </>
        )
    } else {
        return (
            <>
                <Loading spinning={spin} />
                <Layout className='app'>
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
            </>
        )
    }
}

export default withRouter(LayoutTemplate)