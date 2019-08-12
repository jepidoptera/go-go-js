import go from './go';
import { Colors } from 'three';
let colorScore = [1, -1];
const AI = {
    assessBoard(nodes = go.board.nodes) {
        // first, find all groups. assign size, neighboring groups, and owner
        let groupOf = []; // maps nodes to groups
        let groups = []; // each group is an array of node indices
        let nodeControl = Array(nodes.length).fill(0); // how much is each node controlled by each player?

        for (let n = 0; n < nodes.length; n++) {
            if (groupOf[n] === undefined) {
                // group this node with others that share a color 
                let {group, neighbors} = go.GroupAlike(n, nodes);
                let owner = nodes[group[0]].stone.color;
                // assign each node in 'group' to this group index
                for (let i = 0; i < group.length; i++) {
                    groupOf[group[i]] = groups.length;
                }
                // create a group object
                groups.push({ members: group, neighborNodes: neighbors, owner: owner, eyes: 0, liberties: 0 });
            }
        }
        // associate each group with the other groups that it borders
        for (let g = 0; g < groups.length; g++) {
            groups[g].neighborGroups = []
            groups[g].territoryBalance = 0;
            for (let i = 0; i < groups[g].neighborNodes.length; i++) {
                // for each neighboring node
                let n = groups[g].neighborNodes[i];
                // calculate the color balance of its neighbors
                groups[g].territoryBalance += (colorScore[nodes[n].stone.color] || 0);
                let neighborGroup = groups[groupOf[n]];
                // does this node belong to a group that hasn't been cataloged yet?
                if (!groups[g].neighborGroups.includes(neighborGroup)) {
                    // found a new one
                    groups[g].neighborGroups.push(neighborGroup);
                }
            }
            if (groups[g].owner === go.nullStone.color) {
                // fill in territory balance as initial node score for empty zones
                for (let m = 0; m < groups[g].members.length; m++) {
                    nodeControl[groups[g].members[m]] = groups[g].territoryBalance;
                }
            }
        }

        // // process empty groups
        // for (let i = 0; i < groups.length; i++) {
        //     // find groups which exist, but are empty
        //     if (!groups[i]) continue
        //     // of those, find the ones which are 'eyes' (i.e., have only one neighbor group)
        //     else if (groups[i].owner === go.nullStone.color) {
        //         // empty group
        //         if (groups[i].neighborGroups.length === 1) {
        //             // this group is an eye, belonging to its only neighbor
        //             groups[i].neighborGroups[0].eyes += 1;
        //         }
                // // semi-edge case, if two non-neighboring groups are the same color and share two eyes,
                // // they can be considered as one safe "supergroup"
                // else if (groups[i].neighborGroups.length === 2) {
                //     // if they have already been associated, it's because they also share another eye
                //     if (groups[i].neighborGroups[0].associates.includes(groups[i].neighborGroups[1])) {
                //         // are they the same color?
                //         if (groups[i].neighborGroups[0].owner === groups[i].neighborGroups[1].owner) {
                //             // combine the two
                //             groups[i].neighborGroups[0].members = 
                //                 groups[i].neighborGroups[0].members.concat(groups[i].neighborGroups[1].members);
                //             groups[i].neighborGroups[0].eyes += 2 + groups[i].neighborGroups[1].eyes;
                //             // get rid of the second one after it's been absorbed
                //             groups[i].neighborGroups[1] = null
                //         }
                //     }
                // }
        //     }
        // }

        // count liberties for each live group
        for (let g = 0; g < groups.length; g++) {
            if (groups[g].owner !== go.nullStone.color) {
                // start with zero
                groups[g].liberties = 0;
                // look at each neighbor node - is it empty?
                for (let n = 0; n < groups[g].neighborNodes.length; n++) {
                    if (nodes[groups[g].neighborNodes[n]].stone === go.nullStone) {
                        // yes. breathing space
                        groups[g].liberties++;
                    }
                }
                // we now know how much breathing room this group has
                let penalty = 0;
                if (groups[g].liberties === 0) {                    
                    // capture! this group is owned by the other team
                    groups[g].owner = otherColor(groups[g].owner);
                    // score 100 points per stone - arbitrarily
                    penalty = 1000;
                }
                else if (groups[g].liberties < 2) {
                    // groups that are in Atari generate zero control
                    groups[g].owner = otherColor(groups[g].owner);
                    // also lose ten points per stone
                    penalty = 100;
                }
                // subtract a scoring penalty
                if (penalty) {
                    for (let m = 0; m < groups[g].members.length; m++) {
                        nodeControl[groups[g].members[m]] = penalty * colorScore[groups[g].owner];
                    }
                }
            }
        }

        // groups radiate control out into empty territory
        let nodeControlMask = [];
        for (let i = 0; i < 3; i++) {
            for (let g = 0; g < groups.length; g++) {
                if (groups[g].owner >= 0) {
                    // each group can radiate control
                    let groupPower = Math.min(groups[g].members.length, 6) + Math.min(groups[g].liberties, 7) + groups[g].eyes;
                    for (let n = 0; n < groups[g].neighborNodes.length; n++) {
                        if (nodes[groups[g].neighborNodes[n]].stone === go.nullStone) {
                            nodeControlMask[groups[g].neighborNodes[n]] =
                                (nodeControlMask[groups[g].neighborNodes[n]] || 0)
                                + groupPower * colorScore[groups[g].owner];
                        }
                    }
                }
            }
            // add mask to control array
            for (let n = 0; n < nodes.length; n++) {
                if (nodeControlMask[n]) {
                    nodeControl[n] = (nodeControl[n] || 0) + nodeControlMask[n];
                    nodeControlMask[n] = 0;
                }
            }
            // blur and fade
            if (i < 2) {
                for (let n = 0; n < nodes.length; n++) {
                    if (nodes[n].stone === go.nullStone) {
                        let avg = (nodes[n].neighbors.reduce((sum, node) =>
                            (nodes[node].stone === go.nullStone
                                ? nodeControl[node]
                                : nodeControl[n])
                            + sum, 0
                        ) + nodeControl[n]) / 5;
                        nodeControlMask[n] = avg - (nodeControl[n] || 0);
                    }
                }
            }
        }

        // score the stones of each group itself
        // baseline 50 points per stone, but less if their "air quality" is bad
        for (let g = 0; g < groups.length; g++) {
            if (groups[g].owner !== go.nullStone.color) {
                let airQuality = groups[g].neighborNodes.reduce((sum, n) =>
                    sum + Math.max(0, nodeControl[n] * colorScore[groups[g].owner])
                    , 0);
                // gonna set the magic number to 8
                // something less arbitrary would be preferrable, but with current settings...
                // this guarantees that a group with two eyes has enough to be declared "live"
                let scorePerStone = 50;
                if (airQuality < Math.min(groups[g].members.length, 8)) scorePerStone = 0;
                if (airQuality === 0) scorePerStone = -50;
                for (let m = 0; m < groups[g].members.length; m++) {
                    nodeControl[groups[g].members[m]] += scorePerStone * colorScore[groups[g].owner];
                }
            }
        }

        // let each stone 'radiate' control four times
        // for (let i = 0; i < 3; i++) {            
        //     // for each node on the board...
        //     for (let n = 0; n < nodes.length; n++) {
        //         // if there is an actual stone here
        //         if (nodes[n].stone !== go.nullStone) {
        //             let thisGroup = groups[groupOf[n]];
        //             // generate control force
        //             // (for the player who has been calculated to own this group)
        //             if (colorScore[thisGroup.owner])
        //                 nodeControl[n] = (thisGroup.liberties * thisGroup.members.length)
        //                     * colorScore[thisGroup.owner];
        //         }
        //         if (nodeControl[n]) {
        //             nodes[n].neighbors.forEach(neighbor => {
        //                 // radiate only into empty space (actual stones block)
        //                 if (nodes[neighbor].stone === go.nullStone) {
        //                     nodeControlMask[neighbor] = (nodeControlMask[n] || 0)
        //                         + nodeControl[n] - Math.sign(nodeControl[n]);
        //                 // if (Math.abs(nodeControl[neighbor] + nodeControlMask[neighbor]) <= Math.abs(nodeControl[n]) - 1
        //                     //     || Math.sign(nodeControl[neighbor] + nodeControlMask[neighbor]) != Math.sign(nodeControl[n])) {
        //                     //         nodeControlMask[neighbor] = (nodeControlMask[neighbor] || 0) + Math.sign(nodeControl[n]);
        //                     //     }
        //                 }
        //             });
        //         }
        //     }
        //     // add mask to control array
        //     for (let n = 0; n < nodes.length; n++) {
        //         if (nodeControlMask[n]) {
        //             nodeControl[n] = (nodeControl[n] || 0) + nodeControlMask[n];
        //             nodeControlMask[n] = 0;
        //         }
        //     }
        // }

        // let's see what we've got
        // console.log("board separated into: ", groups);

        // debug display
        // console.log("control array:");
        // let displayString = '';
        // for (let y = 0; y < go.board.size; y++) {
        //     for (let x = 0; x < go.board.size; x++) {
        //         let n = go.indexFromCoors(x, y);
        //         let nodeString = '';
        //         if (nodeControl[n]) nodeString += nodeControl[n].toString();
        //         else nodeString = '0';
        //         nodeString = ' '.repeat(4 - nodeString.length) + nodeString;
        //         displayString += nodeString;
        //         if (n % go.board.size === go.board.size - 1) {
        //         }
        //     }
        //     console.log(displayString);
        //     displayString = '';
        // }


        return nodeControl;
    },

    totalScore(nodes) {
        return this.assessBoard(nodes).reduce((sum, node) => {
            return sum + node;
        }, 0)
    },

    scoringOverlay(nodes) {
        let nodeControl = this.assessBoard(nodes);
        let colorScore = [1, -1];
        // erase marks from ndoes with actual stones
        for (let n = 0; n < nodes.length; n++) {
            if (nodes[n].stone !== go.nullStone) {
                if (Math.sign(colorScore[nodes[n].stone.color]) === Math.sign(nodeControl[n])) {
                    // no marker
                    nodeControl[n] = 0;
                }
            }
        }
        // done
        return nodeControl;
    },

    selectMove(nodes, color, levelsDeep = 1, returnWholeStack = false) {
        if (nodes === undefined) nodes = go.board.nodes;
        if (levelsDeep < 0) return -1;
        // let's not get crazy here
        levelsDeep = Math.min(levelsDeep, 3);
        // we will try to find the position which results in the lowest overall score
        // (i.e., most territory controlled by ai player)
        // technically, baseline score should be the expected score if we pass,
        // and the other player then makes the best available move
        let baselineScore = -Infinity * colorScore[color];
        let bestMoves = [];
        // start at -1 (pass)
        for (let n = -1; n < nodes.length; n++) {
            // let n = (i + randomOffset) % nodes.length;
            if (n < 0 || nodes[n].stone === go.nullStone) {
                // check if this move is legal
                if (n < 0) { }
                else if (!go.TryPlayStone(n, color, nodes)) {
                    continue;
                }
                // possible move, assess
                // add up the control score for the whole board
                // an overall negative score means white is winning
                // look ahead to see how other player might respond...
                let moves = [{
                    location: n,
                    color: color,
                }];
                let turn = color;
                // delve deeper into the myriad futures
                for (let r = 1; r < levelsDeep; r++) {
                    // other player's turn
                    let nexturn = turn;
                    turn = turn === go.stone.black ? go.stone.white : go.stone.black;
                    // discover the resulting sequence of "optimal" moves
                    moves = moves.concat(this.selectMove(
                        nodes.map((node, l) => 
                            (n === l ? { ...node, stone: new go.Stone(nexturn, l) } : node)),
                        turn,
                        levelsDeep - r,
                        'return whole stack'))
                    // console.log("exploring move", i);
                }
                let moveScore = 0;
                // now check the score after this sequence of moves has been done
                // making a whole copy of the board... this is not ideal
                let imaginaryBoard = nodes.map(node => {
                    return (node.stone === go.nullStone
                        ? { neighbors: node.neighbors, stone: go.nullStone }
                        : { neighbors: node.neighbors, stone: { color: node.stone.color } }
                    )
                });
                // apply moves
                moves.forEach(move => {
                    if (move.location > 0)
                        imaginaryBoard[move.location].stone =
                            { color: move.color }
                });
                // sum it up
                moveScore = this.assessBoard(imaginaryBoard).reduce(
                    (sum, value) => sum + value
                );
                // let's see if this is the best option so far
                if ((color === go.stone.white && moveScore < baselineScore)
                    || (color === go.stone.black && moveScore > baselineScore)) {
                    baselineScore = moveScore;
                    bestMoves = moves;
                }
            }
        }
        bestMoves[0].score = this.totalScore(nodes.map((node, i) =>
            (bestMoves[0].location === i
                ? { ...node, stone: new go.Stone(bestMoves[0].color, i) }
                : node))
        )
        
        if (bestMoves[0].location === -1) {
            console.log('ai chooses to pass');
        }
        // this is in theory the best move
        // either return just the one, or the whole stack, depending
        if (returnWholeStack) {
            return bestMoves
        }
        else {
            return bestMoves[0].location;
        }
    }
}

export default AI;

function otherColor(color) {
    if (color === go.stone.black) return go.stone.white;
    if (color === go.stone.white) return go.stone.black;
    throw({message: 'color has no opposite.'});
}