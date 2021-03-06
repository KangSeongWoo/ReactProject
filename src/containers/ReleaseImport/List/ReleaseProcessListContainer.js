import { connect } from 'react-redux'
import ReleaseProcessList from '../../../components/ReleaseImport/List/ReleaseProcessList'
import * as actions from '../../../store/actionCreators'

const mapDispatchToProps = dispatch => ({
    setSpin: isSpin => {
        dispatch(actions.spin(isSpin))
    },
    setHeight: () => {
        dispatch(actions.setHeight())
    }
})

function mapReduxStateToReactProps(state) {
    return {
        userId: state.user.userId,
        spin: state.webState.spin,
        height : state.webState.height
    }
}

export default connect(mapReduxStateToReactProps, mapDispatchToProps)(ReleaseProcessList)
