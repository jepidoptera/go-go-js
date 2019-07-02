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

    construct: function () {
        console.log("script started.");

        // a scene to start with
        scene = new THREE.Scene();
        let { object: icosa, nodes } = shapes.icosahedron();

        // console.log(testObject);
        scene.add(icosa);

        // initialize game
        go.initialize("hex", 2);

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

        // make another one
        // var icosa2 = new Object3D();
        // icosa2.add(shapes.icosahedron_builtin());
        // icosa2.scale.set(10, 10, 10);
        // icosa.add(icosa2);

        // set up camera
        var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
        camera.position.z = 1000;

        // renderer
        var renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x008F8F, 0);
        document.body.appendChild(renderer.domElement);

        // mouse click raycaster
        let canvas = renderer.domElement;
        let canvasPosition = $(canvas).position();
        let rayCaster = new THREE.Raycaster();
        let mousePosition = new THREE.Vector2();
        let nearestNode = go.board.nodes[0];

        $(canvas).click((event) => {

            // find where we have clicked within the canvas
            mousePosition.x = ((event.clientX - canvasPosition.left) / canvas.width) * 2 - 1;
            mousePosition.y = -((event.clientY - canvasPosition.top) / canvas.height) * 2 + 1;

            // find the intersection point with the main game object
            rayCaster.setFromCamera(mousePosition, camera);
            let intersects = rayCaster.intersectObjects(icosa.children, true);

            // did we get anything?  was there an intersection?
            if (intersects.length > 0) {
                console.log('clicked at: ', intersects[0].point);
                
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

                if (go.TryPlayStone(nearestNode.index, go.turn)) {
                    // create a stone
                    let goStone = shapes.goStone(["black", "white"][go.turn]);
                    // enlarge and flatten it
                    goStone.scale.set(20, 20, 10);

                    // set it in place
                    goStone.position.set(clickedAt.x, clickedAt.y, clickedAt.z);

                    // align it with the board
                    goStone.lookAt(new THREE.Vector3(0, 0, 0));

                    // attach it
                    icosa.add(goStone);
                }
                else {
                    // no go
                    console.log("you can't play there.");
                }
            }
        })

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
        // var cross = new THREE.Quaternion().setFromAxisAngle();
        var last_position;
        var deltaX, deltaY;
        var $body = $('body');
        $body.on('mousedown', function (event) {
            last_position = {
                x: event.clientX,
                y: event.clientY
            };                    
            $body.on('mousemove', dragRotate);
        });
        $body.on("mouseup", function () {
            $body.off('mousemove', dragRotate);
        })
        function dragRotate(event) {
            // how much did it move, in which direction?
            if (typeof (last_position) != 'undefined') {
                //get the change from last position to this position
                deltaX = last_position.x - event.clientX;
                deltaY = last_position.y - event.clientY;
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
            // put something there to show that it happened
            // icosa2.position.set(icosa.children[0].geometry.vertices[0]);
            // console.log("marker at: ", icosa2.position);

            // console.log("rotated on:", axis);
            // console.log("position: ", icosa.position);
            // icosa.rotation.x += 0.01;
            // icosa.rotation.y += 0.01;
        }
    },
    deconstruct: function () {
        for (var i = scene.children.length - 1; i >= 0; i--) { 
            scene.remove(scene.children[i]);
        }
    }
};

export default HexaSphere;