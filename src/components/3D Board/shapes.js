// jshint multistr: true
import * as THREE from 'three';
import textureImage from "../../images/texture2.png";
import hexaSphere from "../../models/hexasphere2.json"
// import * as MESHLINE from 'three.meshline';

var $ = require("jquery");

// let's try some tests
export default {

    cube: function () {
        // test cube!
        var geometry = new THREE.BoxGeometry(1, 1, 1);
        var material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
        var cube = new THREE.Mesh(geometry, material);
        // √ works (no shading tho)
        return cube;
    },

    icosahedron: function() {
        // we will return an array of meshes
        var meshes = [];

        // load a texture to use for all meshes
        var loader = new THREE.TextureLoader();
        
        var material = new THREE.MeshPhongMaterial({
            map: loader.load(
                // resource URL
                textureImage),
            polygonOffset: true,
            polygonOffsetFactor: 1, // positive value pushes polygon further away
            polygonOffsetUnits: 1
        });

        // load all meshes from file
        return hexaSphere.meshes.map((mesh) => {
            let object3d = new THREE.Object3D();
            let geometry = new THREE.Geometry();
            // load vertices
            mesh.vertices.forEach(vertex => {
                geometry.vertices.push(new THREE.Vector3(vertex.x, vertex.y, vertex.z));
            });
            // faces
            for (let i = 0; i < mesh.faces.length; i += 3) {
                geometry.faces.push(new THREE.Face3(mesh.faces[i], mesh.faces[i+1], mesh.faces[i+2]));
            };

            // uvs
            console.log("starting uvs for: ", geometry);

            // now divide the mesh into hexes!
            geometry.vertices[0].isHex = true;
            // somehow
            for (let i = 0; i < geometry.vertices.length; i++) {
                geometry.vertices[i].neighbors = [];
            }
            // find the neighbors of each vertex
            for (let i = 0; i < geometry.faces.length; i++) {
                // console.log(geometry.faces[i]);
                if (!geometry.vertices[geometry.faces[i].a].neighbors.includes(geometry.faces[i].b)) {
                    geometry.vertices[geometry.faces[i].a].neighbors.push(geometry.faces[i].b)
                }
                if (!geometry.vertices[geometry.faces[i].b].neighbors.includes(geometry.faces[i].c)) {
                    geometry.vertices[geometry.faces[i].b].neighbors.push(geometry.faces[i].c)
                }
                if (!geometry.vertices[geometry.faces[i].c].neighbors.includes(geometry.faces[i].a)) {
                    geometry.vertices[geometry.faces[i].c].neighbors.push(geometry.faces[i].a)
                }
                if (!geometry.vertices[geometry.faces[i].c].neighbors.includes(geometry.faces[i].b)) {
                    geometry.vertices[geometry.faces[i].c].neighbors.push(geometry.faces[i].b)
                }
                if (!geometry.vertices[geometry.faces[i].a].neighbors.includes(geometry.faces[i].c)) {
                    geometry.vertices[geometry.faces[i].a].neighbors.push(geometry.faces[i].c)
                }
                if (!geometry.vertices[geometry.faces[i].b].neighbors.includes(geometry.faces[i].a)) {
                    geometry.vertices[geometry.faces[i].b].neighbors.push(geometry.faces[i].a)
                }
            }

            // let's find the pentagons
            let pentagons = []
            for (let i = 0; i < geometry.vertices.length; i++) {
                // keep track of an index for each one... might be useful later
                geometry.vertices[i].index = i;
                if (geometry.vertices[i].neighbors.length === 2) {
                    geometry.vertices[i].isHex = true;
                    pentagons.push(geometry.vertices[i]);
                }
            }
            console.log("pentagons: ", pentagons);

            // now for each neighbor of each pentagon...
            for (let i = 0; i < pentagons.length; i++) {
                // or rather, for each adjacent pair of neighbors...
                let n1 = geometry.vertices[pentagons[i].neighbors[0]];
                let n2 = geometry.vertices[pentagons[i].neighbors[1]];

                var common = $.grep(n1.neighbors, function (element) {
                    return $.inArray(element, n2.neighbors) !== -1;
                });
                // there should be two - get the one which is != pentagons[i]
                common = common[1] === pentagons[i].index ? common[0] : common[1];
                geometry.vertices[common].isHex = true;
                // n1.isHex = false;
            }

            // for a level-2 spheroid, that should be all we have to do
            // so now we set the uvs
            for (let i = 0; i < geometry.faces.length; i++) {
                geometry.faceVertexUvs[0][i] = [];
                for (let j = 0; j < 3; j++) {
                    geometry.faceVertexUvs[0][i][j] = new THREE.Vector2(0, 0);
                    let v = geometry.faces[i][['a', 'b', 'c'][j]];
                    if (geometry.vertices[v].isHex) {
                        geometry.faceVertexUvs[0][i][j].set(1, 0);
                    }
                    else {
                        geometry.faceVertexUvs[0][i][j].set(0, 0);
                    }
                }
            }

            // calculate the normals automatically
            geometry.computeFaceNormals();
            geometry.computeVertexNormals();
            geometry.verticesNeedUpdate = true;
            geometry.uvsNeedUpdate = true;

            // console.log(mesh);
            mesh = new THREE.Mesh(geometry, material);
            object3d.add(mesh);
            // wireframe
            let geo = new THREE.EdgesGeometry(geometry); // or WireframeGeometry
            let mat = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 6 });
            let wireframe = new THREE.LineSegments(geo, mat);
            // let line = new MESHLINE.MeshLine();
            // line.setGeometry(geometry, p => 3);
            // let meshMaterial = new MESHLINE.MeshLineMaterial(
            //     { resolution: new THREE.Vector2(window.innerWidth, window.innerHeight)});
            // let wireframe = new THREE.Mesh(line.geometry, meshMaterial); // this syntax could definitely be improved!
            object3d.add(wireframe);   
            return object3d;
        })
        // console.log(meshes);
        // return meshes;
    },
    
    icosahedron_scratch: function () {
        // building an icosahedron from scratch
        // more complicated
        var geometry = new THREE.Geometry();
        let normals = [];

        // 0 is the "top"
        normals[0] = new THREE.Vector3(0, 1, 0);
        let radius = 0.5 / Math.sin(0.2 * Math.PI);
        let elevation = Math.sin(Math.acos(radius));
        // 1-10 are the "sides"
        for (let i = 0; i < 5; i++)
        {
            let angle = 0.4 * i * Math.PI;
            let offset = 0.2 * Math.PI;
            normals[i + 1] = new THREE.Vector3(Math.sin(angle) * radius, 1 - elevation, Math.cos(angle) * radius);
            normals[i + 6] = new THREE.Vector3(Math.sin(angle + offset) * radius, -1 + elevation, Math.cos(angle + offset) * radius);
            normals[i + 1] = (normals[i + 1]).normalize();
            normals[i + 6] = (normals[i + 6]).normalize();
        }
        // 11 is the "bottom"
        normals[11] = new THREE.Vector3(0, -1, 0);

        geometry.vertices = geometry.vertices.concat(normals);

        // check out its data structure
        console.log(geometry.vertices);

        geometry.faces.push(
            // "top" pentagon
            new THREE.Face3(0, 1, 2),
            new THREE.Face3(0, 2, 3),
            new THREE.Face3(0, 3, 4),
            new THREE.Face3(0, 4, 5),
            new THREE.Face3(0, 5, 1),
            // "sides"
            new THREE.Face3(6, 2, 1),
            new THREE.Face3(7, 3, 2),
            new THREE.Face3(8, 4, 3),
            new THREE.Face3(9, 5, 4),
            new THREE.Face3(10, 1, 5),
            // more "sides"
            new THREE.Face3(6, 7, 2),
            new THREE.Face3(7, 8, 3),
            new THREE.Face3(8, 9, 4),
            new THREE.Face3(9, 10, 5),
            new THREE.Face3(10, 6, 1),
            // "bottom" pentagon
            new THREE.Face3(11, 10, 9),
            new THREE.Face3(11, 9, 8),
            new THREE.Face3(11, 8, 7),
            new THREE.Face3(11, 7, 6),
            new THREE.Face3(11, 6, 10),

        );
        // load a texture
        var loader = new THREE.TextureLoader();
        
        var material = new THREE.MeshPhongMaterial({
            map: loader.load(
                // resource URL
                textureImage),
            polygonOffset: true,
            polygonOffsetFactor: 1, // positive value pushes polygon further away
            polygonOffsetUnits: 1
        });
        var mesh = new THREE.Mesh(geometry, material);
        // scene.add(mesh)
        console.log(mesh)

        // wireframe
        var geo = new THREE.EdgesGeometry(mesh.geometry); // or WireframeGeometry
        var mat = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });
        var wireframe = new THREE.LineSegments(geo, mat);
        mesh.add(wireframe);        
        // let's export this bad boy
        return mesh;

    },

    icosahedron_builtin: function() {
        // also we can just do this the easy way
        let geometry = new THREE.IcosahedronGeometry(2, 1);

        // let's see what's inside
        console.log("vertices:", geometry.vertices);
        console.log("faces:", geometry.faces);
        
        // calculate the normals automatically
        geometry.computeFaceNormals();
        geometry.computeVertexNormals();

        // now divide the mesh into hexes!
        geometry.vertices[0].isHex = true;
        // somehow
        for (let i = 0; i < geometry.vertices.length; i++) {
            geometry.vertices[i].neighbors = [];
        }
        // find the neighbors of each vertex
        for (let i = 0; i < geometry.faces.length; i++) {
            // console.log(geometry.faces[i]);
            if (!geometry.vertices[geometry.faces[i].a].neighbors.includes(geometry.faces[i].b)) {
                geometry.vertices[geometry.faces[i].a].neighbors.push(geometry.faces[i].b)
            }
            if (!geometry.vertices[geometry.faces[i].b].neighbors.includes(geometry.faces[i].c)) {
                geometry.vertices[geometry.faces[i].b].neighbors.push(geometry.faces[i].c)
            }
            if (!geometry.vertices[geometry.faces[i].c].neighbors.includes(geometry.faces[i].a)) {
                geometry.vertices[geometry.faces[i].c].neighbors.push(geometry.faces[i].a)
            }
            if (!geometry.vertices[geometry.faces[i].c].neighbors.includes(geometry.faces[i].b)) {
                geometry.vertices[geometry.faces[i].c].neighbors.push(geometry.faces[i].b)
            }
            if (!geometry.vertices[geometry.faces[i].a].neighbors.includes(geometry.faces[i].c)) {
                geometry.vertices[geometry.faces[i].a].neighbors.push(geometry.faces[i].c)
            }
            if (!geometry.vertices[geometry.faces[i].b].neighbors.includes(geometry.faces[i].a)) {
                geometry.vertices[geometry.faces[i].b].neighbors.push(geometry.faces[i].a)
            }
        }
        // did this work?
        // for (let i = 0; i < geometry.vertices.length; i++) {
        //     console.log(geometry.vertices[i].neighbors);
        // }
        // yeah looks good

        // let's find the pentagons
        let pentagons = []
        for (let i = 0; i < geometry.vertices.length; i++) {
            // keep track of an index for each one... might be useful later
            geometry.vertices[i].index = i;
            if (geometry.vertices[i].neighbors.length === 5) {
                geometry.vertices[i].isHex = true;
                pentagons.push(geometry.vertices[i]);
            }
        }

        // now for each neighbor of each pentagon...
        for (let i = 0; i < pentagons.length; i++) {
            for (let j = 0; j < 5; j++) {
                // or rather, for each adjacent pair of neighbors...
                let n1 = geometry.vertices[pentagons[i].neighbors[j]];
                let n2 = geometry.vertices[pentagons[i].neighbors[(j + 1) % 5]];
                // find the one neighbor these two have in common
                // that vertex will also be a hex center
                // console.log("two adjacent verticies,", n1.index, "and", n2.index);
                // if (!$.inArray(geometry.vertices[i].neighbors[j], n2)) {
                //     console.log("n1 is not in n2!");
                // }
                var common = $.grep(n1.neighbors, function (element) {
                    return $.inArray(element, n2.neighbors) !== -1;
                });
                // there should be two - get the one which is != pentagons[i]
                common = common[1] === pentagons[i].index ? common[0] : common[1];
                // geometry.vertices[common].isHex = true;
                // n1.isHex = false;
            }
        }

        for (let i = 0; i < geometry.vertices.length; i++) {
            console.log(geometry.vertices[i]);
        }

        // for a level-2 spheroid, that should be all we have to do
        // so now we set the uvs
        for (let i = 0; i < geometry.faces.length; i++) {
            for (let j = 0; j < 3; j++) {
                let v = geometry.faces[i][['a', 'b', 'c'][j]];
                if (geometry.vertices[v].isHex) {
                    geometry.faceVertexUvs[0][i][j].set(1, 0);
                }
                else {
                    geometry.faceVertexUvs[0][i][j].set(0, 0);
                }
            }
        }

        // debugging here...
        // how many total hexes do we have? do any of them have other hexes as neighbors??
        let numHexes = 0;
        for (let i = 0; i < geometry.vertices.length; i++) { 
            if (geometry.vertices[i].isHex) {
                numHexes += 1;
                geometry.vertices[i].neighbors.forEach(n => {
                    if (geometry.vertices[n].isHex) {
                        console.log(`Problem: hex borders hex! ${i}
                         with ${geometry.vertices[i].neighbors.length} sides, ${n}
                         with ${geometry.vertices[n].neighbors.length} sides`);
                    }
                })
            }
        }
        console.log(numHexes + " total hexes.");

        // load a texture
        let loader = new THREE.TextureLoader();
        // // some kind of material
        // var material = new THREE.MeshLambertMaterial({
        //     map: loader.load(
        //         // resource URL
        //         textureImage),
        //     wireframe: true
        // });
        
        let material = new THREE.MeshPhongMaterial({
            map: loader.load(
                // resource URL
                textureImage),
            polygonOffset: true,
            polygonOffsetFactor: 1, // positive value pushes polygon further away
            polygonOffsetUnits: 1
        });
        let mesh = new THREE.Mesh(geometry, material);
        // scene.add(mesh)

        // wireframe
        let geo = new THREE.EdgesGeometry(mesh.geometry); // or WireframeGeometry
        let mat = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });
        let wireframe = new THREE.LineSegments(geo, mat);
        mesh.add(wireframe);        
        // let's export this bad boy
        return mesh;
    },

    rotate: function (obj) {
        obj.rotation.x += 0.01;
        obj.rotation.y += 0.01;
    }
};
