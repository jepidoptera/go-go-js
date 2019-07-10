import React from 'react';
import { BrowserRouter as Router, Route } from "react-router-dom";
// import logo from './logo.svg';
import './App.css';
// import Welcome from './pages/Welcome';
// import HexaGame from './pages/HexaGame';
// import StandardGame from './pages/StandardGame';
import Game from "./pages/Game";
import Login from './pages/Login';
import GameOptions from './pages/GameOptions';
import GameLobby from './pages/GameLobby';
import Register from './pages/Register';

const Crapp = function() {
        return ( <Router>
            <Route exact path="/" render={() => <Login />} />
            <Route exact path="/game" component={Game} />
            <Route exact path="/gameoptions/offline" render={() => <GameOptions />} />
            <Route exact path="/gameoptions/online" render={() =>
                <GameOptions online={true} />} />
            <Route exact path="/game/lobby" render={() => <GameLobby />} />
            <Route exact path="/register" component={Register} />
        </Router>
        )
}

export default Crapp;
