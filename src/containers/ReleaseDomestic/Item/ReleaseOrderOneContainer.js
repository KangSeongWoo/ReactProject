import { connect } from 'react-redux'
import ReleaseOrderOne from '../../../components/ReleaseDomestic/Item/ReleaseOrderOne'
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

export default connect(mapReduxStateToReactProps, mapDispatchToProps)(ReleaseOrderOne)
