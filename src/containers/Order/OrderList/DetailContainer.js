import { connect } from 'react-redux'
import * as actions from '../../../store/actionCreators'
import Detail from '../../../components/Order/OrderList/Detail'

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
export default connect(mapReduxStateToReactProps, mapDispatchToProps)(Detail)
