import { connect } from 'react-redux'

import LayoutTemplate from '../../components/template/LayoutTemplate'
import * as actions from '../../store/actionCreators'
import * as Common from '../../utils/Common'

const mapDispatchToProps = (dispatch) => ({
    menuClick: menuToggle => {
        if(menuToggle == false && Common.isMobile()){
            document.querySelector('.left').style.marginLeft = '0px';
            document.querySelector('.left').style.transition = 'all ease-in-out 0.2s';
        } else if(menuToggle == true && Common.isMobile()){
            document.querySelector('.left').style.marginLeft = '200px';
            document.querySelector('.left').style.transition = 'all ease-in-out 0.2s';
        }
        dispatch(actions.menuToggleAction(menuToggle))
    },
    logOut: () => {
        dispatch(actions.logout());
        window.location.href = '/#/login'
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("auth");
    },
    setUserInfo: user => {
        dispatch(actions.setUserInfo(user))
    }
})


const mapReduxStateToReactProps = (state) => {
    return ({
        menuToggle: state.webState.menuToggle,
        user: state.user.userId,
        spin: state.webState.spin,
        height : state.webState.height
    })
}


export default connect(mapReduxStateToReactProps, mapDispatchToProps)(LayoutTemplate)