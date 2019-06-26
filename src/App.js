import React from 'react';
import { BrowserRouter as Router, Route } from "react-router-dom";
// import logo from './logo.svg';
import './App.css';
import Game from './components/Game';
import Login from './components/Login';

function App() {
    return (
        <Router>
            <div className="App">
                <Route exact path="/login" component={Login} />
                <Route path="/" component={Game} />
            </div>
        </Router>
    );
}

export default App;
