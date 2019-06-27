export default {
    board: {},
    passTurns: 0,
    turn: 0,
    Stone: { black: 0, white: 1 },
    playOffline: false,
    localPlayer: {},
 
    setupBoard : function (boardType, boardSize) {
        this.board.size = boardSize;
        this.board.nullStone = null;
        if (boardType = "square") {
            for (let i = 0; i < boardSize * boardSize; i++) {
                this.board.nodes[i] = null;
                this.board.nodes[i].neighbors = this.SquareNeighbors(i);
            }
        }
    },

    indexFromCoors : function (x, y) {
        return x * this.board.size + y;
    },

    coorsFromIndex : function (index) {
        return { x: Math.floor(index / this.board.size), y: index % this.board.size };
    },

    // for a square at certain coordinates, which other coordinates neighbor it?
    SquareNeighbors : function (index) {
        let { x, y } = this.coorsFromIndex(index);
        let neighbors = [];
        if (x > 0) neighbors.Add(this.indexFromCoors(x - 1, y ));
        if (y > 0) neighbors.Add(this.indexFromCoors(x, y - 1 ));
        if (x < this.board.size - 1) neighbors.Add(this.indexFromCoors(x + 1, y ));
        if (y < this.board.size - 1) neighbors.Add(this.indexFromCoors(x, y + 1));
        return neighbors;
    },

    TryPlayStone : function (location, color)
    {
        // gotta play in this.turn
        if (color != this.turn) return false;

        // only play on a square that isn't occupied
        if (this.board.nodes[location].stone != this.board.nullStone) return false;

        // fill that grid point with a placeholder stone
        this.board.nodes[location].stone = this.board.placeholderStone;
        this.board.placeholderStone.color = this.turn;

        // check for captured stones
        let captures = this.Captures(location);
        if (captures.Count > 0) {
            this.CaptureStones(captures);
        }

        // next this.turn...
        this.NextTurn();

        // if the stone that was just played would be captured, 
        // (by neighbor[0], for instance) it isn't a legal move
        // this works because a stone is captured by all neighbors at once
        if (this.Captures(this.board.nodes[location].neighbors[0]).Length > 0) {
            // take it back
            this.board.nodes[location].stone = this.board.nullStone;
            this.NextTurn();
            return false;
        }

        // todo: research and implement ko rule

        // played successfully
        return true;
    },

    CaptureStones : function (stones) {

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
        this.turn = (this.turn == this.Stone.white) ? this.Stone.black : this.Stone.white;
        // pass buttons cycle visibility
        // if (playOffline || localPlayer.stoneColor == this.turn) {
        //     if (this.turn == Stone.white) {
        //         whitePassButton.SetActive(true);
        //         blackPassButton.SetActive(false);
        //     }
        //     else {
        //         whitePassButton.SetActive(false);
        //         blackPassButton.SetActive(true);
        //     }
        // }
        // else {
        //     // both invisible while network player plays
        //     whitePassButton.SetActive(false);
        //     blackPassButton.SetActive(false);
        // }
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
        // look at each neighbor of the placed stone
        for (let i = 0; i < this.board.nodes[location].neighbors.Length; i++)
        {
            let n = this.board.nodes[location].neighbors[i];
            // is there a stone here, and is it an enemy?
            if (this.board.nodes[n].stone && this.board.nodes[n].stone.color != this.turn &&
                !captiveGroup.includes(n)) {
                // enemy stone! attempt capture
                // get all enemy stones attached to that group, 
                // and all neighbors of that group
                let { group, neighbors } = this.GroupAlike(n);
                // do they have breathing room?
                breathingRoom = false;
                // check each neighbor space adjacent to the enemy group.
                // if vacant, the group is safe.
                for (let j = 0; j < neighbors.length; j++) {
                    let e = neighbors[j];
                    if (this.board.nodes[e].stone == this.board.nullStone) {
                        breathingRoom = true;
                        break;
                    }
                };
                if (!breathingRoom) {
                    // the whole group is captured.
                    captiveGroup.concat(group);
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

        let thisStone;

        while (searching.Length > 0) {
            searching.forEach(i =>
            {
                for (let j = 0; j < this.board.nodes[i].neighbors.Count; j++)
                {
                    // look at neighboring grid points to see if they match the given type (black, white, or empty)
                    thisStone = this.board.nodes[this.board.nodes[i].neighbors[j]].stone;
                    let index = this.board.nodes[i].neighbors[j];
                    if (thisStone.color == groupColor) {
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
            });
            // search the next group
            group.concat(searching);
            searching = [];
            searching.concat(newSearches);
            newSearches = [];
        }
        return { group: group, neighbors: neighbors };
    }

    // function Score()
    // {
    //     // find the score between two players on the given this.board
    //     let scored = [];
    //     let territory = [[], [], []];
    //     let nullTerritory = territory[0];
    //     let blackTerritory = territory[1];
    //     let whiteTerritory = territory[2];
    //     for (let i = 0; i < this.board.nodes.Length; i++)
    //     {
    //         if (this.board.owner[i] == 0) {
    //             // this may be an uncounted region of territory
    //             if (!this.board.nodes[i].stone) {
    //                 // empty, uncounted space
    //                 let surroundings = [];
    //                 let black = 0, white = 0;
    //                 let { group, neighbors } = GroupAlike(i);
    //                 nullTerritory = group;
    //                 // count white vs. black stones surrounding the territory
    //                 foreach(int p in neighbors)
    //                 {
    //                     if (this.board.nodes[p].stone.color == Stone.black) black += 1;
    //                     else white += 1;
    //                 }
    //                 // this is kinda crude, but should suffice in most circumstances
    //                 int winner = (black > white) ? Stone.black : Stone.white;
    //                 territory[winner].AddRange(nullTerritory);
    //                 // mark the whole region as scored
    //                 foreach(int p in nullTerritory)
    //                 {
    //                     this.board.nodes[p].owner = winner;
    //                 }
    //             }
    //         }
    //     }

    //     // capture stones which find themselves surrounded by enemy territory
    //     for (int i = 0; i < this.board.nodes.Length; i++)
    //     {
    //         if (this.board.nodes[i].owner == 0) {
    //             // a group of stones which hasn't been processed yet
    //             List < int > group;
    //             List < int > surroundings;
    //             bool safe = false;
    //             int groupColor = this.board.nodes[i].stone.color;
    //             int opponent = (groupColor == Stone.black) ? Stone.white : Stone.black;
    //             GroupAlike(i, out group, out surroundings);
    //             // does this group border on any friendly territory?
    //             foreach(int p in surroundings)
    //             {
    //                 if (this.board.nodes[p].owner == groupColor) {
    //                     safe = true;
    //                     break;
    //                 }
    //             }

    //             if (safe) {
    //                 // mark the whole group as scored
    //                 foreach(int p in group)
    //                 {
    //                     this.board.nodes[p].owner = groupColor;
    //                 }
    //             }
    //             else {
    //                 // score for opponent
    //                 territory[opponent].AddRange(group);
    //                 foreach(int p in group)
    //                 {
    //                     this.board.nodes[p].owner = opponent;
    //                 }
    //             }
    //         }
    //     }

    //     return new int[2] { blackTerritory.Count, whiteTerritory.Count };
    // }

}