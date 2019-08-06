var go = {
    board: {},
    passTurns: 0,
    turn: 0,
    turnsPlayed: 0,
    lastTurnScored: 0,
    computedScore: {},
    stone: { empty: -1, black: 0, white: 1 },
    playOffline: false,
    capturedStones: [],
    nodes: [],
    koStone: null,
    nullStone: null,
    
    Player: class {
        constructor(color, name) {
            this.color = color;
            this.name = name;
            this.captives = 0;
            this.score = 0;
            this.territory = [];
        }
    },
    
    Stone: class {
        constructor(color, location) {
            this.color = color;
            this.location = location;
        }
    },

    Opcodes:
    {
        black: 0,
        white: 1,
        pass: 2,
        lake: 3,
        illegal: 9,
        gameover: 10,
        joingame: 11,
        ping: 15
    },

    initialize: function (nodemap) {

        this.nullStone = new this.Stone(-1);
        this.board.owner = [];
        // set nullstone in each node
        // it's just easier this way - really
        this.board.nodes = nodemap.map(node => { return { ...node, stone: this.nullStone } });
        // black always starts
        this.turn = this.stone.black;

        // create some players
        this.player = [
            new this.Player(this.stone.black, "player1"),
            new this.Player(this.stone.white, "player2")
        ];

        // set each player as the other's opponent
        this.player[this.stone.white].opponent = this.player[this.stone.black];
        this.player[this.stone.black].opponent = this.player[this.stone.white];

        // play the game on this node set
        console.log("game nodes are:", go.board.nodes);
    },

    createSquareBoard: function (boardSize) {
        // we will need this again...
        this.board.size = boardSize;
        // so we set up node neighbors programatically
        let nodes = [];
        for (let i = 0; i < boardSize * boardSize; i++) {
            nodes.push ({ neighbors: this.SquareNeighbors(i) });
        }
        return nodes;
    },

    indexFromCoors: function (x, y) {
        let index = x * this.board.size + y;
        // console.log("index = ", index);
        return index;
    },

    coorsFromIndex: function (index) {
        let coors = { x: Math.floor(index / this.board.size), y: index % this.board.size };
        // console.log("coordinates: ", coors);
        return coors;
    },

    // for a square at certain coordinates, which other coordinates neighbor it?
    SquareNeighbors: function (index) {
        let { x, y } = this.coorsFromIndex(index);
        let neighbors = [];
        if (x > 0) neighbors.push(this.indexFromCoors(x - 1, y));
        if (y > 0) neighbors.push(this.indexFromCoors(x, y - 1));
        if (x < this.board.size - 1) neighbors.push(this.indexFromCoors(x + 1, y));
        if (y < this.board.size - 1) neighbors.push(this.indexFromCoors(x, y + 1));
        return neighbors;
    },

    /// returns true/false depending on whether "location" is a legal move for "color"
    /// but leaves the game state just as it was when finished.
    TryPlayStone: function (location, opcode) {
        // non-playable opcodes
        if (opcode === this.Opcodes.pass || opcode === this.Opcodes.ping) return true;

        // otherwise, gotta play in turn
        if (opcode !== this.turn) return false;
        
        // only play on a square that isn't occupied
        if ([this.stone.white, this.stone.black]
            .includes(this.board.nodes[location].stone.color)) return false;

        // with those basic checks out of the way, let's see if this move is allowable
        let allowMove = true;
        
        // we'll reset turn after this is done
        let originalTurn = this.turn;

        // fill the grid point with a placeholder stone
        this.board.nodes[location].stone = new this.Stone(this.turn, location);

        // check for captures
        let captures = this.Captures(location);

        // applying ko rule here...
        if (captures.length === 1 && captures[0] === this.koStone) {
            // take it back
            console.log("no go (ko)");
            allowMove = false;
        }

        else if (captures.length > 0) {
            // legal move. capturing is only even illegal in a ko situation
        }

        // check for self-captures.  In other words,
        // if the stone that was just played would be captured where it stands,
        // it isn't a legal move
        else {
            // we do this "capture" without adding any additional stones,
            // so it returns a value only if the stone is already surrounded
            if (this.NextTurn() &&
                this.Captures(this.board.nodes[location].neighbors[0]).length > 0) {

                allowMove = false;
            }
        }
        // undo all changes
        this.board.nodes[location].stone = this.nullStone;
        this.turn = originalTurn;
        // return result
        return allowMove;
    },

    PlayStone(location, opcode) {
        // don't ask if this is legal, just trust that it's already been tested
        // if (!this.TryPlayStone(location, color)) {
        //     console.log("illegal move @", location, "by", ["black", "white"][color]);
        //     return;
        // }
        if (opcode === this.Opcodes.pass) {
            // they player passed
            this.PassTurn();
        }

        // place the stone
        this.board.nodes[location].stone = new this.Stone(this.turn, location);

        // check for captures
        let captures = this.Captures(location);

        // capture them, if there are any
        if (captures) this.CaptureStones(captures);

        // ko rule
        if (captures.length === 1) {
            console.log("ko stone at: ", location);
            this.koStone = location;
        }

        // clear captures if there were none this turn
        if (captures.length === 0) {
            this.capturedStones = [];
        }
        // ko only applies when a single stone is captured
        if (captures.length !== 1) {
            this.koStone = null;
        }

        // played successfully
        console.log("played at: ", location);
        if (captures.length > 0) console.log("stones captured: ", this.capturedStones);

        // reset passTurns
        this.passTurns = 0;

        // next turn
        this.NextTurn();
        
        return true;
    },

    CaptureStones: function (stones) {
        // console.log("stones captured: ", stones)
        // export the captures array
        this.capturedStones = stones.map(i => this.board.nodes[i].stone);
        // clear the stones
        for (let i = 0; i < stones.length; i++) {
            // clear these stones.  other player gains captives.
            this.player[this.board.nodes[stones[i]].stone.color].opponent.captives += 1;
            this.board.nodes[stones[i]].stone = this.nullStone;
        }
    },

    PassTurn : function ()
    {
        this.passTurns += 1;
        if (this.passTurns > 1) {
            // two consecutive passes = game over!
            this.GameOver();
        }
        // next player's this.turn
        this.NextTurn();
    },

    // it's the next player's this.turn.
    // change whatever needs to change to reflect that
    NextTurn : function ()
    {
        // switch turns
        this.turn = (this.turn === this.stone.white) ? this.stone.black : this.stone.white;
        // remember how many have been played
        this.turnsPlayed++;
        return true;
    },

    GameOver : function () {
        // TODO
    },

    // create a list of points which contain stones which would be captured 
    // if current player moves at location
    Captures : function (location)
    {
        // this is much simpler than my original code...
        let captiveGroup = [];
        let breathingRoom = false;

        // looking at each node adjacent to the starting location.
        // these are the initial set of locations at which a stone could be captured.
        for (let i = 0; i < this.board.nodes[location].neighbors.length; i++) {
            let n = this.board.nodes[location].neighbors[i];

            // if there is a stone here, and it is of the opposite color,
            // and it is not already captured:
            if ([this.stone.black, this.stone.white].includes(this.board.nodes[n].stone.color) &&
                this.board.nodes[n].stone.color !== this.board.nodes[location].stone.color &&
                !captiveGroup.includes(n)) {

                // find all stones of the same color which are connected to this one
                let { group, neighbors } = this.GroupAlike(n);

                breathingRoom = false;
                // check each neighbor space adjacent to the enemy group.
                // if vacant, the group is safe.
                for (let j = 0; j < neighbors.length; j++) {
                    let e = neighbors[j];
                    if (this.board.nodes[e].stone === this.nullStone) {
                        breathingRoom = true;
                        break;
                    }
                };
                if (!breathingRoom) {
                    // the whole group is captured.
                    captiveGroup = captiveGroup.concat(group);
                }
            }
        }

        return captiveGroup;
    },

    GroupAlike : function (start)
    {
        let groupColor = this.board.nodes[start].stone.color;
        let group = [];
        let neighbors = [];
        // start search from the given point
        let searching = [start];
        let newSearches = [];

        while (searching.length > 0) {
            for (let i = 0; i < searching.length; i++)
            {
                for (let j = 0; j < this.board.nodes[searching[i]].neighbors.length; j++)
                {
                    // look at neighboring grid points to see if they match the given type (black, white, or empty)
                    let index = this.board.nodes[searching[i]].neighbors[j];
                    if (this.board.nodes[index].stone.color === groupColor) {
                        // same color, add it to group and search from there next
                        if (!group.includes(index) && !searching.includes(index) && !newSearches.includes(index)) {
                            newSearches.push(index);
                        }
                    }
                    else {
                        // different color, add it to neighbors if it isn't there already
                        if (!neighbors.includes(index)) {
                            neighbors.push(index);
                        }
                    }
                }
            };
            // search the next group
            group = group.concat(searching);
            searching = [];
            searching = searching.concat(newSearches);
            newSearches = [];
        }
        return { group: group, neighbors: neighbors };
    },

    Score: function ()
    {
        // have we already computed the score this turn?
        if (this.lastTurnScored === this.turnsPlayed) return this.computedScore;
        // if not, we must calculate again
        this.lastTurnScored = this.turnsPlayed;
        // find the score between two players on the given board
        let territory = [[], []];
        // total stones on the board for each side
        // in Chinese scoring, these are worth 1 point each
        let liveStones = [[], []];
        // stones which are surrounded by enemy territory and are considered dead
        let deadStones = [[], []];

        for (let i = 0; i < this.board.nodes.length; i++)
        {
            // scan the whole board for empty nodes that haven't been scored yet
            if (this.board.nodes[i].owner !== undefined) {
                // found an unscored node. is it empty?
                if (!this.board.nodes[i].stone.color) {
                    // empty, uncounted space
                    // let us decide who it belongs to
                    let score = [0, 0];
                    let { group, neighbors } = this.GroupAlike(i);
                    let contestedTerritory = group;
                    // count white vs. black stones surrounding the territory
                    for (let n in neighbors) {
                        score[this.board.nodes[n].stone.color]++;
                    }
                    // are there more black stones or white stones bordering this territory?
                    // this is kinda crude, but should suffice in most (all?) circumstances
                    let winner = score.indexOf(Math.max(...score));
                    territory[winner] = territory[winner].concat(contestedTerritory);
                    // mark the whole region as scored
                    for (let n in contestedTerritory) {
                        this.board.nodes[n].owner = winner;
                    }
                }
                else { 
                    // we don't yet assign owners to nodes containing stones.
                    // that happens in the next part, where we determine
                    // if those stones are alive or dead.
                }
            }
        }

        // capture stones which find themselves surrounded by enemy territory
        for (let i = 0; i < this.board.nodes.length; i++)
        {
            if (this.board.nodes[i].owner === undefined) {
                // a group of stones which hasn't been processed yet
                let safe = false;
                let groupColor = this.board.nodes[i].stone.color;
                let opponent = (groupColor === this.stone.black) ? this.stone.white : this.stone.black;
                let {group, neighbors} = this.GroupAlike(i);
                // does this group border on any friendly territory?
                for (let p in neighbors)
                {
                    if (this.board.nodes[p].owner === groupColor) {
                        // found some friendly territory.
                        // even if it's just one node, the group is alive
                        safe = true;
                        break;
                    }
                }

                if (safe) {
                    // mark the whole group as alive
                    liveStones[groupColor] = liveStones[groupColor].concat(group);
                    // score the nodes they occupy as their own
                    for (let p in group) {
                        this.board.nodes[p].owner = groupColor;
                    }
                }

                else {
                    // the group is surrounded and captured
                    deadStones[groupColor] = deadStones[groupColor].concat(group);
                    // since these nodes are empty now, add territory for opponent
                    territory[opponent] = territory[opponent].concat(group);
                    // opponent owns all these nodes
                    for (let p in group) {
                        this.board.nodes[p].owner = opponent;
                    }
                }
            }
        }

        this.computedScore = {
            // empty regions surrounded by a majority of one color
            blackTerritory: territory[this.stone.black],
            whiteTerritory: territory[this.stone.white],
            // live stones which are still on the board
            blackStones: liveStones[this.stone.black],
            whiteStones: liveStones[this.stone.white],
            // stones which are surrounded by enemy territory and are considered dead
            deadWhiteStones: deadStones[this.stone.white],
            deadBlackstones: deadStones[this.stone.black],
        };
        return this.computedScore;
    },

    playThrough(history) {
        // sanity check
        if (!history) return;
        console.log("replaying: ", history);
        // replay history. take three bytes at a time
        for (let i = 0; i < history.length; i += 3) {
            let location = parseInt(history[i]) * 256 + parseInt(history[i + 1]);
            let opcode = parseInt(history[i+2]);
            // first two bytes are location.
            // third is opcode
            if (opcode === this.Opcodes.pass) {
                this.NextTurn();
            }
            if (opcode <= 2) {
                if(this.TryPlayStone(location, opcode)) {
                    // add a stone to the board
                    this.PlayStone(location, opcode);
                }
                else {
                    console.log("error at history [", i, "]: location", location, "opcode", opcode)
                }
            }
            else console.log("history [", i, "]: location", location, "opcode", opcode);
        }
    },

    compareState(stateArray) {
        // check if we are in sync with the server
        for (let i in stateArray) {
            if (stateArray[i] !== this.board.nodes[i].stone.color) {
                console.log("state mismatch at node [" + i + "].");
                console.log(stateArray, this.board.nodes.map(node => node.stone.color));
                return false;
            }
        }
        return true;
    }
}

export default go;