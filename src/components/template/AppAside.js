import React, { useEffect, useLayoutEffect, useState } from 'react';
import { Layout, Icon, Menu } from 'antd'
import { Link, withRouter } from 'react-router-dom'
import Logo from '../../img/logo.png'

const { Sider } = Layout

const AppAside = (props) => {
    let { menuToggle, menu } = props

    const [state, setState] = useState({
        openKeys: [],
        selectedKeys: []
    });

    useLayoutEffect(() => {
        let { pathname } = props.location;
        setState({
            selectedKeys: [pathname],
            openKeys: getOpenKeys(pathname)
        })
    }, []);

    const getOpenKeys = string => {
        let newStr = '',
            newArr = [],
            arr = string.split('/').map(i => '/' + i)
        for (let i = 1; i < arr.length - 1; i++) {
            newStr += arr[i]
            newArr.push(newStr)
        }
        return newArr
    }

    const renderMenuItem = ({ key, icon, title }) => (
        <Menu.Item key={key}>
            <Link to={key}>
                {icon && <Icon type={icon} />}
                <span>{title}</span>
            </Link>
        </Menu.Item>
    )

    const renderSubMenu = ({ key, icon, title, subs }) => {
        return (
            <Menu.SubMenu
                key={key}
                title={
                    <span>
                        {icon && <Icon type={icon} />}
                        <span>{title}</span>
                    </span>
                }>
                {subs &&
                    subs.map(item => {
                        return item.subs && item.subs.length > 0 ? renderSubMenu(item) : renderMenuItem(item)
                    })}
            </Menu.SubMenu>
        )
    }

    return (
        <Sider className='aside' collapsed={menuToggle}>
            <div className='logo'>
                <a rel='noopener noreferrer' href='/' target='_blank'>
                    <img src={Logo} />
                </a>
            </div>
            <Menu
                mode='inline'
                theme='light'
                defaultOpenKeys={state.openKeys}
                defaultSelectedKeys={state.selectedKeys}
                onClick={({ key }) =>
                    setState({
                        ...state,
                        selectedKeys: [key],
                        openKeys: getOpenKeys(key)
                    })
                }
            >
                {menu &&
                    menu.map(item => {
                        return item.subs && item.subs.length > 0 ? renderSubMenu(item) : renderMenuItem(item)
                    })}
            </Menu>
        </Sider>
    )
}

export default withRouter(AppAside)