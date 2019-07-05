import * as THREE from 'three';
import shapes from "./shapes";
import go from "../../js/go";
var $ = require("jquery");
var scene;

var HexaSphere = {
    // $(Document).ready(function() {
    //     // is this thing on??
    //     console.log("script started.");
    //     return false;
    // });

    construct: function (size) {
        console.log("script started.");

        // a scene to start with
        scene = new THREE.Scene();
        let { object: icosa, nodes } = shapes.icosahedron(size);

        // console.log(testObject);
        scene.add(icosa);

        // initialize game
        go.initialize("hex", 2);

        // make a temp stone that appears when you initially click a spot
        // but doesn't become permanent until you click again
        var tempStone = {location: -1};

        // set up nodes
        go.board.nodes = nodes.map((node, i) => {
            return {
                neighbors: node.neighbors,
                position: new THREE.Vector3(node.position.x, node.position.y, node.position.z),
                index: i,
                stone: go.nullStone
            }
        });
        // play the game on this node set
        console.log("game nodes are:", go.board.nodes);

        // set up camera
        var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
        camera.position.z = 1000;

        // renderer
        var renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x008F8F, 0);
        document.body.appendChild(renderer.domElement);

        // mouse click raycaster
        var canvas = renderer.domElement;
        canvas.setAttribute("id", "3dcanvas");
        let canvasPosition = $(canvas).position();
        let rayCaster = new THREE.Raycaster();
        let mousePosition = new THREE.Vector2();
        let nearestNode = go.board.nodes[0];

        // create a point light
        var pointLight = new THREE.PointLight(0xFFFFFF);

        // set its position
        pointLight.position.x = 10;
        pointLight.position.y = 50;
        pointLight.position.z = 1300;

        // add to the scene
        scene.add(pointLight);
        // animate
        function animate() {
            // test.rotate(icosa);
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
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

        function dragRotate(event) {
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
            icosa.rotateOnWorldAxis(xAxis, -deltaY / 100);
            icosa.rotateOnWorldAxis(yAxis, deltaX / 100);
        }

        function boardClick(event) {
            // find where we have clicked within the canvas
            mousePosition.x = ((event.clientX - canvasPosition.left) / canvas.width) * 2 - 1;
            mousePosition.y = -((event.clientY - canvasPosition.top) / canvas.height) * 2 + 1;

            // find the intersection point with the main game object
            rayCaster.setFromCamera(mousePosition, camera);
            let intersects = rayCaster.intersectObjects(icosa.children, true);

            // did we get anything?  was there an intersection?
            if (intersects.length > 0) {
                // console.log('clicked at: ', intersects[0].point);

                // now find the nearest node
                let clickedAt = icosa.worldToLocal(intersects[0].point);
                let found = false;
                let nearDist = nearestNode.position.distanceTo(clickedAt);
                while (!found) {
                    found = true
                    for (let i in nearestNode.neighbors) {
                        let n = nearestNode.neighbors[i];
                        let dist = go.board.nodes[n].position.distanceTo(clickedAt);
                        if (dist < nearDist) {
                            // this one's closer
                            nearDist = dist;
                            nearestNode = go.board.nodes[n];
                            // go around once more, 
                            // to see if any of this node's neighbors are even closer
                            found = false;
                            break;
                        }
                    }
                }
                // put the stone right on the node
                clickedAt = nearestNode.position;
                if (nearestNode.index === tempStone.location) {
                    // add a permanent version of the temp stone
                    var permStone = shapes.goStone(["black", "white"][go.turn]);
                    // set it up just like the temp stone was
                    permStone.scale.set(20, 20, 10);
                    permStone.position.set(clickedAt.x, clickedAt.y, clickedAt.z);
                    // align it with the board
                    permStone.lookAt(new THREE.Vector3(0, 0, 0));
                    // add to the scene
                    icosa.add(permStone);
                    // remove the temp
                    icosa.remove(tempStone);
                    // off the board, or the next player could place a stone here too
                    tempStone.location = -1;
                    // add it to the virtual board
                    go.PlayStone(nearestNode.index, go.turn);
                    // save a reference in the board
                    go.board.nodes[nearestNode.index].stone.object = permStone;

                    // were any stones captured?
                    if (go.capturedStones.length > 0) {
                        // some stones were captured, we need to make them disappear
                        go.capturedStones.forEach(stone => {
                            stone.object.size = stone.object.scale.x;
                            let shrink_interval = setInterval(() => {
                                // shrink
                                stone.object.scale.set(stone.object.size, stone.object.size, stone.object.size / 2);
                                stone.object.size -= 1;
                                if (stone.object.size <= 0) {
                                    // it has disappeared, delete it from scene
                                    icosa.remove(stone.object);
                                    clearInterval(shrink_interval);
                                }
                            }, 17);
                        });
                        go.capturedStones = [];
                    }
                }

                // if the click was anywhere except an already-placed temp stone
                // then just add a temp; click it again to make it a real move.
                else if (go.TryPlayStone(nearestNode.index, go.turn)) {
                    // remove temp stone from where it was if it exists
                    icosa.remove(tempStone);

                    // create a new temp stone
                    tempStone = shapes.goStone(["black", "white"][go.turn], "temp");

                    // enlarge and flatten it
                    tempStone.scale.set(20, 20, 10);

                    // set it in place
                    tempStone.position.set(clickedAt.x, clickedAt.y, clickedAt.z);

                    // position on board index
                    tempStone.location = nearestNode.index;

                    // align it with the board
                    tempStone.lookAt(new THREE.Vector3(0, 0, 0));

                    // attach it
                    icosa.add(tempStone);

                }
                else {
                    // no go
                    console.log("you can't play there.");
                }
            }
        }
    },
    deconstruct: function () {
        for (var i = scene.children.length - 1; i >= 0; i--) { 
            scene.remove(scene.children[i]);
        }
        // remove the canvas element
        document.body.removeChild(document.getElementById("3dcanvas"));
    }
};

export default HexaSphere;