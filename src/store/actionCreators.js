/*
    action 객체를 만드는 액션 생성자들을 선언합니다. (action creators)
    여기서 () => ({}) 은, function() { return { } } 와 동일한 의미입니다.
    scope 이슈와 관계 없이 편의상 사용되었습니다.
*/

import * as types from './actionType'

export const setUserInfo = userId => ({
    type: types.SET_USER_INFO,
    userId
})

export const logout = () => ({
    type: types.LOGOUT
})

export const menuToggleAction = menuToggle => ({
    type: types.MENU_TOGGLE,
    menuToggle
})

export const spin = isSpin => ({
    type: types.SPIN,
    isSpin
})
