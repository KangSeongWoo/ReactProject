import { connect } from 'react-redux'
import * as actions from '../../../store/actionCreators'
import ProductItemMoveOrder from '../../../components/Move/Item/ProductItemMoveOrder'

const mapDispatchToProps = dispatch => ({
    setSpin: isSpin => {
        dispatch(actions.spin(isSpin))
    }
})

function mapReduxStateToReactProps(state) {
    return {
        userId: state.user.userId,
        spin: state.webState.spin
    }
}

export default connect(mapReduxStateToReactProps, mapDispatchToProps)(ProductItemMoveOrder)
