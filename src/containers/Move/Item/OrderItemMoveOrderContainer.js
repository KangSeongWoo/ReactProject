import { connect } from 'react-redux'
import * as actions from '../../../store/actionCreators'
import OrderItemMoveOrder from '../../../components/Move/Item/OrderItemMoveOrder'

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

export default connect(mapReduxStateToReactProps, mapDispatchToProps)(OrderItemMoveOrder)
