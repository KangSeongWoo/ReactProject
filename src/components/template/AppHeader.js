import React, { useEffect } from 'react';
import { withRouter } from 'react-router-dom'
import { Menu, Dropdown, Icon, Avatar, Badge, Layout } from 'antd'

const { Header } = Layout

const AppHeader = ({ menuClick, avatar, menuToggle, logOut, host }) => {
    const menu = (
        <Menu>
            {/* <Menu.ItemGroup title='설정'>
                <Menu.Divider />
                <Menu.Item>
                    <Icon type='edit' />
                    개인정보
                </Menu.Item>
                <Menu.Item>
                    <Icon type='setting' theme='filled' />
                    환경설정
                </Menu.Item>
            </Menu.ItemGroup>
            <Menu.Divider /> */}
            <Menu.Item>
                <span onClick={logOut}>
                    <Icon type='logout' /> 로그아웃
                </span>
            </Menu.Item>
        </Menu>
    )
    return (
        <Header className='header'>
            <div className='left'>
                <Icon
                    style={{ fontSize: '2rem' }}
                    onClick={menuClick}
                    type={menuToggle ? 'menu-unfold' : 'menu-fold'}
                />
                <span style={{color: 'red', fontWeight: 'bold', fontSize: '18px',marginLeft: '30px'}}>{ host }</span>
            </div>
            <div className='right'>
                {/* <div className='mr15'>
                    <a rel='noopener noreferrer' href='/' target='_blank'>
                        <Icon type='github' style={{ color: '#000' }} />
                    </a>
                </div>
                <div className='mr15'>
                    <Badge dot={true} offset={[-2, 0]}>
                        <a href='/' style={{ color: '#000' }}>
                            <Icon type='bell' />
                        </a>
                    </Badge>
                </div> */}
                <div>
                    <Dropdown overlay={menu} overlayStyle={{ width: '20rem' }}>
                        <div className='ant-dropdown-link'>
                            <Avatar icon='user' alt='avatar' style={{ cursor: 'pointer' }} />
                        </div>
                    </Dropdown>
                </div>
            </div>
        </Header>
    )
}

export default withRouter(AppHeader)


