import * as BABYLON from 'babylonjs';
import cannon from 'cannon';

class Game {
    private _canvas: HTMLCanvasElement;
    private _engine: BABYLON.Engine;
    private _scene: BABYLON.Scene;
    private _camera: BABYLON.ArcRotateCamera;
    private _light: BABYLON.Light;

    private widthScene: number;
    private heightScene: number;

    constructor(canvasElement: string) {
        // Create canvas and engine.
        this._canvas = document.getElementById(canvasElement) as HTMLCanvasElement;
        this._engine = new BABYLON.Engine(this._canvas, true);
        console.log('construtor')
        console.log(window.DeviceOrientationEvent)
        console.log(window.DeviceMotionEvent)
        console.log(window);
        window.screen.orientation.onchange = () => {console.log('change')}
        window.addEventListener('devicemotion', this.handleOrientation, true);
    }

    handleOrientation(event) {
        var absolute = event.absolute;
        var alpha    = event.alpha;
        var beta     = event.beta;
        var gamma    = event.gamma;
        console.log(alpha, beta, gamma)

        const x = event.accelerationIncludingGravity.x;
        const y = event.accelerationIncludingGravity.y;
        const z = event.accelerationIncludingGravity.z;
        console.log(event.acceleration.x
            + ' m/s2');
        console.log(x, y, z);
        // Do stuff with the new orientation data
    }

    createScene(): void {
        // Create a basic BJS Scene object.
        this._scene = new BABYLON.Scene(this._engine);
        this.widthScene = this._scene.getEngine().getRenderingCanvasClientRect().width;
        this.heightScene = this._scene.getEngine().getRenderingCanvasClientRect().height;

        this._scene.clearColor = new BABYLON.Color3(0.5, 0.8, 0.5);

        const gravityVector = new BABYLON.Vector3(0, -9.81, 0);
        const physicsPlugin = new BABYLON.CannonJSPlugin(true, 10, cannon);
        this._scene.enablePhysics(gravityVector, physicsPlugin);

        // Create a FreeCamera, and set its position to (x:0, y:5, z:-10).
        this._camera = new BABYLON.ArcRotateCamera('camera1', Math.PI / 2, Math.PI / 2, 100,
            new BABYLON.Vector3(0, 0, 0), this._scene);
        this._camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;

        var distance = 100;
        var aspect = this._scene.getEngine().getRenderingCanvasClientRect().height / this._scene.getEngine().getRenderingCanvasClientRect().width;
        this._camera.orthoLeft = -distance / 2;
        this._camera.orthoRight = distance / 2;
        this._camera.orthoBottom = this._camera.orthoLeft * aspect;
        this._camera.orthoTop = this._camera.orthoRight * aspect;

        // Target the camera to scene origin.
        this._camera.setTarget(BABYLON.Vector3.Zero());

        // Attach the camera to the canvas.
        this._camera.attachControl(this._canvas, false);

        // Create a basic light, aiming 0,1,0 - meaning, to the sky.
        this._light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0, 1.5 * Math.abs(this._camera.orthoTop), 50), this._scene);
        this._light = new BABYLON.HemisphericLight('light2', new BABYLON.Vector3(0, -1.5 * Math.abs(this._camera.orthoTop), 50), this._scene);



        const grass0 = new BABYLON.StandardMaterial("grass0", this._scene);
        grass0.diffuseTexture = new BABYLON.Texture("textures/sand.jpg", this._scene);


        const countEL = 100;
        let i = 0;

        const getRandomInt = (min, max) => Math.random() * (max - min) + min;

        const interval = setInterval(() => {
            if (i >= countEL) {
                clearInterval(interval);
            }
            this.addElement(i, 2, 10, Math.abs(this._camera.orthoBottom) + getRandomInt(0, 10), getRandomInt(-4, 4), grass0);
            i++;
        }, 100);

        this.addWalls();
        // this.addAxis();
        this.toggleFullScreen();

    }

    addWalls() {
        let ground = BABYLON.MeshBuilder.CreateBox('ground1',
            {width: Math.abs(this._camera.orthoLeft) * 2, height: 2, depth: 5}, this._scene);
        ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.BoxImpostor, {
            mass: 0,
            restitution: 0.3
        }, this._scene);

        ground.position.y = this._camera.orthoBottom - 1;


        let wallLeft = BABYLON.MeshBuilder.CreateBox('wallLeft',
            {width: 1, height: Math.abs(this._camera.orthoBottom) * 2, depth: 5}, this._scene);
        wallLeft.physicsImpostor = new BABYLON.PhysicsImpostor(wallLeft, BABYLON.PhysicsImpostor.BoxImpostor, {
            mass: 0,
            restitution: 0.3
        }, this._scene);

        wallLeft.position.x = Math.abs(this._camera.orthoLeft) + 1;


        let wallRight = BABYLON.MeshBuilder.CreateBox('wallRight',
            {width: 1, height: Math.abs(this._camera.orthoBottom) * 2, depth: 5}, this._scene);
        wallRight.physicsImpostor = new BABYLON.PhysicsImpostor(wallRight, BABYLON.PhysicsImpostor.BoxImpostor, {
            mass: 0,
            restitution: 0.3
        }, this._scene);

        wallRight.position.x = this._camera.orthoLeft - 1;


        let wallBack = BABYLON.MeshBuilder.CreateBox('wallBack',
            {
                width: Math.abs(this._camera.orthoLeft) * 2 + 2,
                height: Math.abs(this._camera.orthoBottom) * 2,
                depth: 1
            }, this._scene);
        wallBack.physicsImpostor = new BABYLON.PhysicsImpostor(wallBack, BABYLON.PhysicsImpostor.BoxImpostor, {
            mass: 0,
            restitution: 0.9
        }, this._scene);

        const grass0 = new BABYLON.StandardMaterial("grass0", this._scene);
        grass0.diffuseTexture = new BABYLON.Texture("textures/back.jpg", this._scene);
        wallBack.material = grass0;

        wallBack.position.z = -2.5;
    }

    toggleFullScreen() {
        var doc = window.document;
        var docEl = doc.documentElement;

        var requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
        var cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

        if(!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
            requestFullScreen.call(docEl);
        }
        else {
            cancelFullScreen.call(doc);
        }
    }

    addElement(id, diameter = 3, mass = 2, y = 3, x = 0, texture?) {
        let sphere = BABYLON.MeshBuilder.CreateSphere('sphere' + id,
            {segments: 2, diameter: diameter}, this._scene);

        sphere.physicsImpostor = new BABYLON.PhysicsImpostor(sphere, BABYLON.PhysicsImpostor.SphereImpostor, {
            mass: 1,
            restitution: 0.2
        }, this._scene);

        sphere.position.y = y;
        sphere.position.x = x;

        if (texture) {
            sphere.material = texture;
        }
    }

    addAxis() {
        const size = 8;

        const _this = this;
        var makeTextPlane = function (text, color, size) {
            var dynamicTexture = new BABYLON.DynamicTexture("DynamicTexture", 50, _this._scene, true);
            dynamicTexture.hasAlpha = true;
            dynamicTexture.drawText(text, 5, 40, "bold 36px Arial", color, "transparent", true);
            var plane = BABYLON.Mesh.CreatePlane("TextPlane", size, _this._scene, true);
            plane.material = new BABYLON.StandardMaterial("TextPlaneMaterial", _this._scene);
            plane.material.backFaceCulling = false;
            plane.material.specularColor = new BABYLON.Color3(0, 0, 0);
            plane.material.diffuseTexture = dynamicTexture;
            return plane;
        };

        var axisX = BABYLON.Mesh.CreateLines("axisX", [
            BABYLON.Vector3.Zero(), new BABYLON.Vector3(size, 0, 0), new BABYLON.Vector3(size * 0.95, 0.05 * size, 0),
            new BABYLON.Vector3(size, 0, 0), new BABYLON.Vector3(size * 0.95, -0.05 * size, 0)
        ], this._scene);
        axisX.color = new BABYLON.Color3(1, 0, 0);
        var xChar = makeTextPlane("X", "red", size / 10);
        xChar.position = new BABYLON.Vector3(0.9 * size, -0.05 * size, 0);
        var axisY = BABYLON.Mesh.CreateLines("axisY", [
            BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, size, 0), new BABYLON.Vector3(-0.05 * size, size * 0.95, 0),
            new BABYLON.Vector3(0, size, 0), new BABYLON.Vector3(0.05 * size, size * 0.95, 0)
        ], this._scene);
        axisY.color = new BABYLON.Color3(0, 1, 0);
        var yChar = makeTextPlane("Y", "green", size / 10);
        yChar.position = new BABYLON.Vector3(0, 0.9 * size, -0.05 * size);
        var axisZ = BABYLON.Mesh.CreateLines("axisZ", [
            BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, 0, size), new BABYLON.Vector3(0, -0.05 * size, size * 0.95),
            new BABYLON.Vector3(0, 0, size), new BABYLON.Vector3(0, 0.05 * size, size * 0.95)
        ], this._scene);
        axisZ.color = new BABYLON.Color3(0, 0, 1);
        var zChar = makeTextPlane("Z", "blue", size / 10);
        zChar.position = new BABYLON.Vector3(0, 0.05 * size, 0.9 * size);
    }

    doRender(): void {
        // Run the render loop.
        this._engine.runRenderLoop(() => {
            this._scene.render();
        });

        // The canvas/window resize event handler.
        window.addEventListener('resize', () => {
            this._engine.resize();
        });
    }
}

window.addEventListener('DOMContentLoaded', () => {
    // Create the game using the 'renderCanvas'.
    let game = new Game('renderCanvas');

    // Create the scene.
    game.createScene();

    // Start render loop.
    game.doRender();
});
