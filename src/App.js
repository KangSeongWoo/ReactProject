import React from 'react';
import { HashRouter as Router, Route, Switch, Redirect } from 'react-router-dom'
import './style/base.css'
import './style/App.css'
import './style/common.scss'
import loadable from '@loadable/component'
import { hot } from 'react-hot-loader/root'

const LayoutTemplateContainer = loadable(() => import('./containers/template/LayoutTemplateContainer'));
const LoginContainer = loadable(() => import('./containers/Common/loginContainer'));
const View404 = loadable(() => import('./containers/Others/404'))
const View500 = loadable(() => import('./containers/Others/500'))

const App = () => {
  return (
    <Router>
      <Switch>
        <Route path='/' exact render={() => <Redirect to='/index' />} />
        <Route path='/login' component={LoginContainer} />
        <Route path='/500' component={View500} />
        <Route path='/404' component={View404} />
        <Route component={LayoutTemplateContainer} />
      </Switch>
    </Router>
  );
}

export default hot(App);