import { connect } from 'react-redux'

import LayoutTemplate from '../../components/template/LayoutTemplate'
import * as actions from '../../store/actionCreators'

const mapDispatchToProps = (dispatch) => ({
    LOGIN: (user) => {
        dispatch(actions.setUserInfo(user));
    },
    MENU_CLICK: dispatch(actions.menuToggle()),
    LOGOUT: () => {
        localStorage.clear();
        dispatch(actions.logout());
    },
})


const mapReduxStateToReactProps = (state) => {
    return ({
        menuToggle: state.webState.menuToggle,
        avatar: state.user.avartar,
        auth: state.user.auth,
        menu: state.user.menu,
    })
}


export default connect(mapReduxStateToReactProps, mapDispatchToProps)(LayoutTemplate)