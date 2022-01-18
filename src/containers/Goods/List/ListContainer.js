import { connect } from 'react-redux'
import * as actions from '../../../store/actionCreators'
import List from '../../../components/Goods/List/List'

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
export default connect(mapReduxStateToReactProps, mapDispatchToProps)(List)
