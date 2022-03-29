import * as Common from '../utils/Common';
import * as types from './actionType';

// 초기 상태를 정의합니다.
const initialState = {
    user: {
        userId  : '',       // 로그인한 userId
        avatar  : '',       // 로그인한 user Image
        auth    : '',       // 계정 권한
        menu    : []        // 계정 권한에 따른 메뉴
    },
    webState: {
        menuToggle: Common.isMobile(),  // 메뉴 토글
        spin: false,                    // 로딩바
        height : 0,
    }
}

const modifyState = (state = initialState, action) => {
    switch (action.type) {
        case types.SET_HEIGHT:
            let height = window.innerHeight 
            - (document.querySelector('header') != undefined ? document.querySelector('header').clientHeight : 0) 
            - (document.querySelector('footer') != undefined ? document.querySelector('footer').clientHeight : 0) - 100

            for(let i = 0; i < document.querySelectorAll('.notice-condition').length; i++){
                height -= document.querySelectorAll('.notice-condition')[i].clientHeight
            }
            return {
                ...state,
                webState: {
                    ...state.webState,
                    height: height
                }
            }
        case types.SET_USER_INFO:
            return {
                ...state,
                user: {
                    ...state.user,
                    userId: action.userId
                }
            }
        case types.LOGOUT:
            return {
                ...state,
                user: {
                    ...state.user,
                    userId: ''
                }
            }
        case types.MENU_TOGGLE:
            return {
                ...state,
                webState: {
                    ...state.webState,
                    menuToggle: !action.menuToggle
                }
            }
        case types.SPIN:
            return {
                ...state,
                webState: {
                    ...state.webState,
                    spin: action.isSpin
                }
            }
        default:
            return state
    }
}

export default modifyState