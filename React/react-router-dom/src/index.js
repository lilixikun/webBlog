import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter, Route, Switch, Link, Redirect,withRouter } from 'react-router-dom'
//import { HashRouter, Route, Link, Switch, Redirect } from './react-router-dom'
import App from './App';
import Home from './Home'
import User from './User'
import NavHeader from './NavHeader'
import './index.css';

ReactDOM.render(
  <HashRouter>
    <NavHeader title="返回首页"></NavHeader>
    <Link to='/home'> Home</Link>
    <Link to='/user'> User</Link>
    <Link to='/app'> App</Link>

    <Switch>
      <Route path="/app" component={App} />
      <Route path="/home" component={Home} />
      <Route path="/home/123" component={Home} />
      <Route path="/user" component={User} />
      <Redirect to='/app' />
    </Switch>
  </HashRouter>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA

