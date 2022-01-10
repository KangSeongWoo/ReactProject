import React from 'react';
import { HashRouter as Router, Route, Switch, Redirect } from 'react-router-dom'
import './style/base.css'
import './style/App.css'
import './style/common.css'
import loadable from '@loadable/component'

const LayoutTemplateContainer = loadable(() => import('./containers/template/LayoutTemplateContainer'));
const LoginContainer = loadable(() => import('./containers/Common/loginContainer'));

const App = () => {
  return (
    <Router>
      <Switch>
        <Route path='/' exact render={() => <Redirect to='/index' />} />
        <Route path='/login' component={LoginContainer} />
        <Route component={LayoutTemplateContainer} />
      </Switch>
    </Router>
  );
}

export default App;