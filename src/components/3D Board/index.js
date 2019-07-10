import * as THREE from 'three';
import shapes from "./shapes";
// GO module now resides in the Game page, as it should
// import go from "../../js/go";

var $ = require("jquery");

const HexaSphere = {
    scene: {},
    nodes: [],
    go: {},
    isTurn: true,
    sphere: null, // this will be the main 3d model
    camera: null, // this will be the camera through which we view the scene

    moveFunction: function(color, location) { 
        // this will be a callback to the parent component
        // to handle networking functions
    },

    construct: function (boardSize) {
    
        // build a 3d object using three.js
        console.log("script started.");

        // load hexasphere object
        let { object, nodes } = shapes.icosahedron(boardSize);
        this.nodes = nodes.map((node, i) => {
            return {
                index: i, 
                position: new THREE.Vector3(node.position.x, node.position.y, node.position.z),
                neighbors: node.neighbors
            };
        })
        this.sphere = object;

        // a scene to start with
        HexaSphere.scene = new THREE.Scene();

        // console.log(testObject);
        HexaSphere.scene.add(this.sphere);

        // make a temp stone that appears when you initially click a spot
        // but doesn't become permanent until you click again
        var tempStone = {location: -1};

        // set up camera
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
        this.camera.position.z = 1000;

        // renderer
        var renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x008F8F, 0);
        document.getElementById("gameCanvas").appendChild(renderer.domElement);

        // mouse click raycaster
        var canvas = renderer.domElement;
        canvas.setAttribute("id", "3dcanvas");
        let canvasPosition = $(canvas).position();
        let rayCaster = new THREE.Raycaster();
        let mousePosition = new THREE.Vector2();
        let nearestNode = this.nodes[0];

        // create a point light
        var pointLight = new THREE.PointLight(0xFFFFFF);

        // set its position
        pointLight.position.x = 10;
        pointLight.position.y = 50;
        pointLight.position.z = 1300;

        // add to the HexaSphere.scene
        HexaSphere.scene.add(pointLight);
        // animate
        const animate = () => {
            // test.rotate(this.sphere);
            if (this.camera) requestAnimationFrame(animate);
            renderer.render(HexaSphere.scene, this.camera);
        }
        animate();

        // mouse events
        // click + drag to rotate board,
        // click to place stone
        var last_position;
        var deltaX, deltaY;
        var culumlativeMotion = 0;
        $(canvas).on('mousedown', function (event) {
            last_position = {
                x: event.clientX,
                y: event.clientY
            };                    
            culumlativeMotion = 0;
            $(canvas).on('mousemove', dragRotate);
        });

        $("body").on("mouseup", function (event) {
            // let off the mouse drag
            $(canvas).off('mousemove', dragRotate);
            // determine if that was a click or a drag
            if (culumlativeMotion < 10) {
                // didn't move much, that counts as a click
                boardClick(event);
            }
        })

        const dragRotate = (event) => {
            // how much did it move, in which direction?
            if (typeof (last_position) != 'undefined') {
                //get the change from last position to this position
                deltaX = last_position.x - event.clientX;
                deltaY = last_position.y - event.clientY;
                // add to culumlative motion (which make the differene between click and drag)
                culumlativeMotion += Math.abs(deltaX) + Math.abs(deltaY);
            }
            // save current position as last_position for next time
            last_position = {
                x: event.clientX,
                y: event.clientY
            };
            // apply rotations on x and y axes
            let xAxis = new THREE.Vector3(1, 0, 0);
            let yAxis = new THREE.Vector3(0, -1, 0);
            this.sphere.rotateOnWorldAxis(xAxis, -deltaY / 100);
            this.sphere.rotateOnWorldAxis(yAxis, deltaX / 100);
        }

        const boardClick = (event) => {
            // check if we are currently allowed to play or not
            if (!this.isTurn) {
                // console.log("not our turn, says: ", this);  <--- scope??
                // nope. this is because we're waiting for other player online.
                return;
            }
            else // go ahead with the move

            // find where we have clicked within the canvas
            mousePosition.x = ((event.clientX - canvasPosition.left) / canvas.width) * 2 - 1;
            mousePosition.y = -((event.clientY - canvasPosition.top) / canvas.height) * 2 + 1;

            // find the intersection point with the main game object
            rayCaster.setFromCamera(mousePosition, this.camera);
            let intersects = rayCaster.intersectObjects(this.sphere.children, true);

            // did we get anything?  was there an intersection?
            if (intersects.length > 0) {
                // console.log('clicked at: ', intersects[0].point);

                // now find the nearest node
                let clickedAt = this.sphere.worldToLocal(intersects[0].point);
                let found = false;
                let nearDist = nearestNode.position.distanceTo(clickedAt);
                while (!found) {
                    found = true
                    for (let i in nearestNode.neighbors) {
                        let n = nearestNode.neighbors[i];
                        let dist = this.nodes[n].position.distanceTo(clickedAt);
                        if (dist < nearDist) {
                            // this one's closer
                            nearDist = dist;
                            nearestNode = this.nodes[n];
                            // go around once more, 
                            // to see if any of this node's neighbors are even closer
                            found = false;
                            break;
                        }
                    }
                }
                // align the click to the nearest node
                clickedAt = nearestNode.position;
                
                // if the click was anywhere except an already-placed temp stone
                // then add a transparent temp; click it again to make it a real move.
                if (nearestNode.index !== tempStone.location) {
                    // is this move valid?
                    if (this.go.TryPlayStone(nearestNode.index, this.go.turn)) {
                        // valid (temp) move.
                        // remove temp stone from where it was if it exists
                        // so we can put it here instead.
                        this.sphere.remove(tempStone);

                        // create a new temp stone
                        tempStone = shapes.goStone(["black", "white"][this.go.turn], "temp");

                        // enlarge and flatten it
                        tempStone.scale.set(20, 20, 10);

                        // set it in place
                        tempStone.position.set(clickedAt.x, clickedAt.y, clickedAt.z);

                        // position on board index
                        tempStone.location = nearestNode.index;

                        // align it with the board
                        tempStone.lookAt(new THREE.Vector3(0, 0, 0));

                        // attach it
                        this.sphere.add(tempStone);

                        console.log("preliminary play at:", tempStone.location);

                    }
                    else {
                        // no go
                        console.log("you can't play there (" + nearestNode.index + ").");
                    }
                }


                // playing for real - clicked on the already-positioned temp stone
                else if (nearestNode.index === tempStone.location) {
                    // remove the temp
                    this.sphere.remove(tempStone);
                    // off the board, or the next player could place a stone here too
                    tempStone.location = -1;
                    // play a permanent stone
                    this.moveFunction(nearestNode.index);
                }
            }
        }
    }, 

    loadGame: function (go, callback) {
        // references passed from parent component
        // an instance of the go module, and a function to call each time a move is played
        this.go = go;
        this.moveFunction = callback;
        // place any existing stones
        let newStones = [];
        go.board.nodes.forEach(node => {
            if (node.stone !== go.nullStone) {
                // place a stone here
                this.addStone(node.stone.color, node.index);
                newStones.push(node.stone);
            }
        })
        console.log("Replaying history: ", newStones);
    },

    addStone: function (color, location) {
        console.log(this, "permifying stone.");
        // add a permanent version of the temp stone
        let permStone = shapes.goStone(["black", "white"][color]);
        // set it up just like the temp stone was
        permStone.scale.set(20, 20, 10);
        permStone.position.set(this.nodes[location].position.x, this.nodes[location].position.y, this.nodes[location].position.z);
        // align it with the board
        permStone.lookAt(this.sphere.position);
        // add to the scene
        this.sphere.add(permStone);
        // save a reference in the board
        this.nodes[location].object = permStone;
        // console.log("nodes are now: ", this.go.board.nodes);
        // rotate so the new stone faces the camera
        // this.rotateTowards(this.nodes[location].position);
    },

    captureStones: function (stones) {
        // some stones were captured, we need to make them disappear
        for (let n = 0; n < stones.length; n++) {
            let stone = this.nodes[stones[n].location].object;
            stone.size = stone.scale.x;
            let shrink_interval = setInterval(() => {
                // shrink
                stone.scale.set(stone.size, stone.size, stone.size / 2);
                stone.size -= 1;
                if (stone.size <= 0) {
                    // it has disappeared, delete it from scene
                    this.sphere.remove(stone);
                    clearInterval(shrink_interval);
                }
            }, 17);
        };
    },

    rotateTowards: function (target) {
        // rotate the sphere to point the target at the camera
        // can't mess with the actual target vector,
        // because it's a reference to one of the nodes on our graph :|
        let adjustedTarget = this.sphere.localToWorld(new THREE.Vector3(target.x, target.y, target.z));
        let axis = new THREE.Vector3()
            .crossVectors(adjustedTarget, this.camera.position).normalize();
        let angle = this.camera.position.angleTo(adjustedTarget);
        // console.log("rotating on axis:", axis, " by angle ", angle);
        this.sphere.rotateOnWorldAxis(axis, angle);
        // console.log("sphere ends at rotation:", this.sphere.rotation, "position:", this.sphere.position)
    },

    deconstruct: function () {
        // break it down
        if (HexaSphere.scene.children) {
            // remove everything from the scene
            for (var i = HexaSphere.scene.children.length - 1; i >= 0; i--) {
                HexaSphere.scene.remove(HexaSphere.scene.children[i]);
            }
            // remove the canvas element
            document.getElementById("gameCanvas")
                .removeChild(document.getElementById("3dcanvas"));
        }
    }
};

export default HexaSphere;