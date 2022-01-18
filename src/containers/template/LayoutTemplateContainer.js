import { connect } from 'react-redux'

import LayoutTemplate from '../../components/template/LayoutTemplate'
import * as actions from '../../store/actionCreators'

const mapDispatchToProps = (dispatch) => ({
    menuClick: menuToggle => {
        dispatch(actions.menuToggleAction(menuToggle))
    },
    logOut: () => {
        dispatch(actions.logout())
    },
    setUserInfo: user => {
        dispatch(actions.setUserInfo(user))
    }
})


const mapReduxStateToReactProps = (state) => {
    return ({
        menuToggle: state.webState.menuToggle,
        user: state.user.userId,
        spin: state.webState.spin
    })
}


export default connect(mapReduxStateToReactProps, mapDispatchToProps)(LayoutTemplate)