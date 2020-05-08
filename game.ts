import * as BABYLON from 'babylonjs';
// @ts-ignore
import cannon from 'cannon';

class Game {
    private _canvas: HTMLCanvasElement;
    private _engine: BABYLON.Engine;
    private _scene: BABYLON.Scene;
    private _camera: BABYLON.ArcRotateCamera;
    private _light: BABYLON.Light;
    private physicsEngine;

    private widthScene: number;
    private heightScene: number;

    constructor(canvasElement: string) {
        this._canvas = document.getElementById(canvasElement) as HTMLCanvasElement;
        this._engine = new BABYLON.Engine(this._canvas, true);
        this.handleOrientation = this.handleOrientation.bind(this)
    }

    handleOrientation(event) {
        const alpha = event.alpha;
        const beta = event.beta;
        const gamma = event.gamma;
        const degToPhysic = -7.174311;

        if (this.physicsEngine) {
            this.physicsEngine.setGravity(new BABYLON.Vector3(gamma/degToPhysic, beta/degToPhysic, 0));
        }
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

        this.physicsEngine = this._scene.getPhysicsEngine();
        window.addEventListener('deviceorientation', this.handleOrientation, true);

        this._camera = new BABYLON.ArcRotateCamera('camera1', Math.PI / 2, Math.PI / 2, 100,
            new BABYLON.Vector3(0, 0, 0), this._scene);
        this._camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;

        var distance = 100;
        var aspect = this._scene.getEngine().getRenderingCanvasClientRect().height / this._scene.getEngine().getRenderingCanvasClientRect().width;
        this._camera.orthoLeft = -distance / 2;
        this._camera.orthoRight = distance / 2;
        this._camera.orthoBottom = this._camera.orthoLeft * aspect;
        this._camera.orthoTop = this._camera.orthoRight * aspect;

        this._camera.setTarget(BABYLON.Vector3.Zero());

        const options = new BABYLON.SceneOptimizerOptions(60, 500);
        options.addOptimization(new BABYLON.HardwareScalingOptimization(0, 1));

        const optimizer = new BABYLON.SceneOptimizer(this._scene, options);

        // this._camera.attachControl(this._canvas, false);

        this._light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0, 1.5 * Math.abs(this._camera.orthoTop), 50), this._scene);
        this._light = new BABYLON.HemisphericLight('light2', new BABYLON.Vector3(0, -1.5 * Math.abs(this._camera.orthoTop), 50), this._scene);

        const grass0 = new BABYLON.StandardMaterial("grass0", this._scene);
        grass0.diffuseTexture = new BABYLON.Texture("textures/sand.jpg", this._scene);

        const countEL = 200;
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

        let ground2 = BABYLON.MeshBuilder.CreateBox('ground2',
            {width: Math.abs(this._camera.orthoLeft) * 2, height: 2, depth: 5}, this._scene);
        ground2.physicsImpostor = new BABYLON.PhysicsImpostor(ground2, BABYLON.PhysicsImpostor.BoxImpostor, {
            mass: 0,
            restitution: 0.3
        }, this._scene);

        ground2.position.y = -this._camera.orthoBottom + 15;


        let wallLeft = BABYLON.MeshBuilder.CreateBox('wallLeft',
            {width: 1, height: Math.abs(this._camera.orthoBottom) * 2 + 30, depth: 5}, this._scene);
        wallLeft.physicsImpostor = new BABYLON.PhysicsImpostor(wallLeft, BABYLON.PhysicsImpostor.BoxImpostor, {
            mass: 0,
            restitution: 0.3
        }, this._scene);

        wallLeft.position.x = Math.abs(this._camera.orthoLeft) + 1;


        let wallRight = BABYLON.MeshBuilder.CreateBox('wallRight',
            {width: 1, height: Math.abs(this._camera.orthoBottom) * 2 + 30, depth: 5}, this._scene);
        wallRight.physicsImpostor = new BABYLON.PhysicsImpostor(wallRight, BABYLON.PhysicsImpostor.BoxImpostor, {
            mass: 0,
            restitution: 0.3
        }, this._scene);

        wallRight.position.x = this._camera.orthoLeft - 1;


        let wallBack = BABYLON.MeshBuilder.CreateBox('wallBack',
            {
                width: Math.abs(this._camera.orthoLeft) * 2 + 2,
                height: Math.abs(this._camera.orthoBottom) * 2 + 30,
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
        const doc = window.document;
        var docEl = doc.documentElement;

        var requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
        var cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

        if (!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
            requestFullScreen.call(docEl);
        } else {
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

    doRender(): void {
        this._engine.runRenderLoop(() => {
            this._scene.render();
        });

        window.addEventListener('resize', () => {
            this._engine.resize();
        });
    }
}

window.addEventListener('DOMContentLoaded', () => {
    let game = new Game('renderCanvas');

    game.createScene();

    game.doRender();
});
