import { connect } from 'react-redux'
import Login from '../../components/Common/login'
import * as actions from '../../store/actionCreators'

const mapDispatchToProps = (dispatch) => ({
    LOGIN: (user) => {
        dispatch(actions.setUserInfo(user.id))
    }
})


const mapReduxStateToReactProps = (state) => {
    return ({
        userId : state.user.userId
    })
}


export default connect(mapReduxStateToReactProps, mapDispatchToProps)(Login)