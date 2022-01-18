import React from 'react'
import { withRouter } from 'react-router-dom';
import IndexContainer from '../../containers/Common/IndexContainer';

const Index = () => {

    let viewContainer = null;

    viewContainer = <IndexContainer></IndexContainer>;
        
    return <div>{viewContainer}</div>
}

export default withRouter(Index)
