import { connect } from 'react-redux'

import AppHeader from '../../components/template/AppHeader'
import * as actions from '../../store/actionCreators'

const mapDispatchToProps = (dispatch) => ({

})


const mapReduxStateToReactProps = (state) => {
    return ({
        menuToggle: state.webState.menuToggle,
        menuClick: actions.menuToggle(),
        avatar: state.user.avartar,
        logOut: actions.logout()
    })
}


export default connect(mapReduxStateToReactProps, mapDispatchToProps)(AppHeader)