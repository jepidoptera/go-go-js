import * as THREE from 'three';
import shapes from "./shapes";
import { Object3D } from 'three';
var $ = require("jquery");

var HexaSphere = (() => {
    // $(Document).ready(function() {
    //     // is this thing on??
    //     console.log("script started.");
    //     return false;
    // });
    var xAxis = new THREE.Vector3(1, 0, 0);
    var yAxis = new THREE.Vector3(0, -1, 0);

    $(function () {
        console.log("script started.");

        // a scene to start with
        var scene = new THREE.Scene();
        var icosa = new Object3D();
        let testObject = shapes.icosahedron();

        console.log(testObject);
        icosa.add(...testObject);
        scene.add(icosa);

        // set up camera
        var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
        camera.position.z = 1000;

        // renderer
        var renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x000000, 0);
        document.body.appendChild(renderer.domElement);

        // create a point light
        var pointLight = new THREE.PointLight(0xFFFFFF);

        // set its position
        pointLight.position.x = 10;
        pointLight.position.y = 50;
        pointLight.position.z = 130;

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
        $body.on("mouseup", function (event) {
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
            icosa.rotateOnWorldAxis(xAxis, -deltaY / 100);
            icosa.rotateOnWorldAxis(yAxis, deltaX / 100);
            // console.log("rotated on:", axis);
            // console.log("position: ", icosa.position);
            // icosa.rotation.x += 0.01;
            // icosa.rotation.y += 0.01;
        }
    });
});

export default HexaSphere;