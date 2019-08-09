var AI = {
    initialize(go) {
        this.go = go
    },
    assessBoard(nodes = this.go.board.nodes) {
        // first, find all groups. assign size, neighbors (other groups) and owner
        let groupOf = []; // maps nodes to groups
        let groups = []; // each group is an array of node indices
        for (let n = 0; n < nodes.length; n++) {
            if (groupOf[n] === undefined) {
                // group this.go node with others that share a color 
                let {group, neighbors} = this.go.GroupAlike(n, nodes);
                let owner = nodes[group[0]].stone.color;
                // assign each node in 'group' to this.go group index
                for (let i = 0; i < group.length; i++) {
                    groupOf[group[i]] = groups.length;
                }
                // create a group object
                groups.push({ members: group, neighborNodes: neighbors, owner: owner, eyes: 0, associates: [] });
            }
        }
        // associate each group with the other groups that it borders
        for (let n = 0; n < groups.length; n++) {
            groups[n].neighborGroups = []
            for (let i = 0; i < groups[n].neighborNodes; i++) {
                let neighborGroup = groups[groupOf[groups[n].neighborNodes[i]]];
                if (!groups[n].neighborGroups.includes(neighborGroup)) {
                    // found a new one
                    groups[n].neighborGroups.push(neighborGroup);
                }
            }
        }

        // process empty groups
        for (let n = 0; n < groups.length; n++) {
            // find groups which exist, but are empty
            if (!groups[n]) continue
            // of those, find the ones which are 'eyes' (i.e., have only one neighbor group)
            else if (groups[n].owner === this.go.nullStone.color) {
                // empty group
                if (groups[n].neighborGroups.length === 1) {
                    // this group has an eye
                    groups[groups[n].neighborGroups[0]].eyes += 1;
                }
                // semi-edge case, if two non-neighboring groups are the same color and share two eyes,
                // they can be considered as one safe "supergroup"
                else if (groups[n].neighborGroups.length === 2) {
                    // if they have already been associated, it's because they also share another eye
                    if (groups[n].neighborGroups[0].associates.includes(groups[n].neighborGroups[1])) {
                        // are they the same color?
                        if (groups[n].neighborGroups[0].owner === groups[n].neighborGroups[1].owner) {
                            // combine the two
                            groups[n].neighborGroups[0].members = 
                                groups[n].neighborGroups[0].members.concat(groups[n].neighborGroups[1].members);
                            groups[n].neighborGroups[0].eyes += 2 + groups[n].neighborGroups[1].eyes;
                            // get rid of the second one after it's been absorbed
                            groups[n].neighborGroups[1] = null
                        }
                    }
                }
            }
        }

        // groups without eyes may die if they're surrounded
        // so an empty group that borders only an eyeless group,
        // and one other group of the opposite color, 
        // means that territory all belongs to the surrounding group
        // -- as long as the three don't comprise the entire board.

        let nodeControl = [];
        let nodeControlMask = [];
        // let each stone 'radiate' control four times
        for (let i = 0; i < 3; i++) {            
            // for each node on the board...
            for (let n = 0; n < nodes.length; n++) {
                // if there is an actual stone here
                if (nodes[n].stone !== this.go.nullStone) {
                    // generate control force
                    nodeControl[n] = 
                        (nodes[n].stone.color === this.go.stone.black
                            ? 4 // positive for black
                            : -4) // negative for white
                }
                if (nodeControl[n]) {
                    nodes[n].neighbors.forEach(neighbor => {
                        // radiate only into empty space (actual stones block)
                        if (nodes[neighbor].stone === this.go.nullStone) {
                            if (Math.abs(nodeControl[neighbor] + nodeControlMask[neighbor]) <= Math.abs(nodeControl[n]) - 1
                                || Math.sign(nodeControl[neighbor] + nodeControlMask[neighbor]) != Math.sign(nodeControl[n])) {
                                    nodeControlMask[neighbor] = (nodeControlMask[neighbor] || 0) + Math.sign(nodeControl[n]);
                                }
                        }
                    });
                }
            }
            // add mask to control array
            for (let n = 0; n < nodes.length; n++) {
                if (nodeControlMask[n]) {
                    nodeControl[n] = (nodeControl[n] || 0) + nodeControlMask[n];
                    nodeControlMask[n] = 0;
                }
            }
        }

        // count liberties for each live group
        for (let g = 0; g < groups.length; g++) {
            groups[g].liberties = 0;
            for (let n = 0; n < groups[g].neighborNodes.length; n++) {
                if (nodes[groups[g].neighborNodes[n]].stone === this.go.nullStone) {
                    // breathing space
                    groups[g].liberties ++;
                }
            }
        }

        // do stuff with info about liberties
        for (let n = 0; n < nodes.length; n++) {
            if (nodes[n].stone !== this.go.nullStone) {
                if (groups[groupOf[n]].liberties < 2) {
                    // mark groups that are in Atari as one point towards the other team
                    nodeControl[n] = (groups[groupOf[n]].owner === this.go.stone.black ? -1 : 1)
                }
            }
        }

        // let's see what we've this.got
        console.log("board separated into: ", groups);

        // debug display
        // console.log("control array:");
        // let displayString = '';
        // for (let y = 0; y < this.go.board.size; y++) {
        //     for (let x = 0; x < this.go.board.size; x++) {
        //         let n = this.go.indexFromCoors(x, y);
        //         let nodeString = '';
        //         if (nodeControl[n]) nodeString += nodeControl[n].toString();
        //         else nodeString = '0';
        //         nodeString = ' '.repeat(4 - nodeString.length) + nodeString;
        //         displayString += nodeString;
        //         if (n % this.go.board.size === this.go.board.size - 1) {
        //         }
        //     }
        //     console.log(displayString);
        //     displayString = '';
        // }


        return nodeControl;
    },
    scoringOverlay(nodes) {
        let nodeControl = this.assessBoard(nodes);
        let colorScore = [1, -1];
        // erase marks from ndoes with actual stones
        for (let n = 0; n < nodes.length; n++) {
            if (nodes[n].stone !== this.go.nullStone) {
                if (Math.sign(colorScore[nodes[n].stone.color]) === Math.sign(nodeControl[n])) {
                    // no marker
                    nodeControl[n] = 0;
                }
            }
        }
    }
}

export default AI;