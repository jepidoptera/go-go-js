import React from 'react';
import { BrowserRouter as Router, Route } from "react-router-dom";
// import logo from './logo.svg';
import './App.css';
import Welcome from './pages/Welcome';
import HexaGame from './pages/HexaGame';
import StandardGame from './pages/StandardGame';
import Login from './pages/Login';

function App() {
    return (
        <Router>
            <div className="App">
                <Route exact path="/login" component={Login} />
                <Route exact path="/" component={Welcome} />
                <Route exact path="/game/3d" component={HexaGame} />
                <Route exact path="/game/standard" component={StandardGame} />
            </div>
        </Router>
    );
}

export default App;
