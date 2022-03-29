import { connect } from 'react-redux'
import Index from '../../components/Common/Index'
import * as actions from '../../store/actionCreators'

const mapDispatchToProps = (dispatch) => ({

})


const mapReduxStateToReactProps = (state) => {
    return ({
        userId : state.user.userId
    })
}


export default connect(mapReduxStateToReactProps, mapDispatchToProps)(Index)