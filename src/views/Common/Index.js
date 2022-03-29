import React from 'react'
import { withRouter } from 'react-router-dom';
import IndexContainer from '../../containers/Common/IndexContainer';

const Index = (props) => {
    let { match,location } = props

    let viewContainer = null;

    

    viewContainer = <IndexContainer></IndexContainer>;
        
    return <div>{viewContainer}</div>
}

export default withRouter(Index)
