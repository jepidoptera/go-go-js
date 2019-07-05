var go = {
    board: {},
    passTurns: 0,
    turn: 0,
    stone: { empty: -1, black: 0, white: 1 },
    playOffline: false,
    capturedStones: [],
    koStone: null,
    
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

    initialize: function (boardType, boardSize) {

        this.board.size = boardSize;
        this.nullStone = new this.Stone(-1);
        this.board.nodes = [];
        this.board.owner = [];
        this.turn = this.stone.black;

        // create some players
        this.player = [
            {},
            new this.Player(this.stone.black, "player1"),
            new this.Player(this.stone.white, "player2")
        ];

        // set each player as the other's opponent
        this.player[this.stone.white].opponent = this.player[this.stone.black];
        this.player[this.stone.black].opponent = this.player[this.stone.white];

        // set nullstone in each node
        // it's just easier this way - really
        // square board doesn't come with a json file
        if (boardType === "square") {
        // so we set up node neighbors programatically
            for (let i = 0; i < boardSize * boardSize; i++) {
                this.board.nodes[i] = { stone: this.nullStone };
                this.board.nodes[i].neighbors = this.SquareNeighbors(i);
            }
        }
        // else {
        //     for (let i = 0; i < this.board.nodes.length; i++) {
        //         this.board.nodes[i].stone = this.nullStone;
        //     }
        // }
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
    TryPlayStone: function (location, color) {
        // gotta play in this.turn
        if (color !== this.turn) return false;
        
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

    PlayStone(location, color) {
        if (!this.TryPlayStone(location, color)) {
            console.log("illegal move @", location, "by", ["black", "white"][color]);
            return;
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
        return true;
    },

    GameOver : function () {

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
        // find the score between two players on the given board
        let territory = [[], []];
        let nullTerritory = territory[0];
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
                    let winner = Math.max(...score);
                    territory[winner] = territory[winner].concat(contestedTerritory);
                    // mark the whole region as scored
                    for (let n in nullTerritory) {
                        this.board.nodes[n].owner = winner;
                    }
                }
                else { 
                    // we don't yet assign owners to nodes containing stones.
                    // that happens in the next part.
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

        return {
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
    }

}

export default go;