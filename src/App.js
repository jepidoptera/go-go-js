import React, {Component} from 'react';
import { BrowserRouter as Router, Route } from "react-router-dom";
// import logo from './logo.svg';
import './App.css';
// import Welcome from './pages/Welcome';
import HexaGame from './pages/HexaGame';
import StandardGame from './pages/StandardGame';
import Login from './pages/Login';
import GameOptions from './pages/GameOptions';

class App extends Component {
    state = {
        boardSize: 1
    }

    // componentDidMount() {

    // }
    
    startGame(self, boardType, boardSize) {
        // set board size state
        self.setState({ boardSize: boardSize });
        // alert("board size: " + boardSize);
    }

    render() {
        return (
            <Router>
                {/* <Route exact path="/login" component={Login} /> */}
                <Route exact path="/" component={Login} />
                <Route exact path="/game/3d" render={() => <HexaGame  boardSize={this.state.boardSize}/>} />
                <Route exact path="/game/standard" render={() => <StandardGame boardSize={this.state.boardSize} />}/>
                <Route exact path="/game/options" render={() => <GameOptions startGame={
                    // since this function will be called from another component,
                    // but needs to modify this component's state,
                    // it needs its originating component (this) passed as a parameter
                    (boardType, boardSize) => this.startGame(this, boardType, boardSize)
                } />} />
            </Router>
        );
    }
}

export default App;
