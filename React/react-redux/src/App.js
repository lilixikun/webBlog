import React from 'react';
import logo from './logo.svg';
import { connect } from './react-redux'
import './App.css';

function App(props) {
  console.log('重新渲染');

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p onClick={() => props.onChange('我自己改变了!')}>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          {props.name}
        </a>
      </header>
    </div>
  );
}

const mapStateToProps = state => ({
  name: state.name
})


const mapDispatchToProps = dispatch => {
  return {
    onChange: name => dispatch({
      type: 'CHANGE_NAME',
      name
    })
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
