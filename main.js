import * as THREE from 'https://unpkg.com/three/build/three.module.js';
import { GLTFLoader } from 'https://unpkg.com/three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'https://unpkg.com/three/examples/jsm/loaders/DRACOLoader'
import { FirstPersonControls } from 'https://unpkg.com/three/examples/jsm/controls/FirstPersonControls.js';

window.addEventListener('keydown', e =>
{
    if(e.key == 'c')
    {
        isUiHidden = !isUiHidden;
        if(isUiHidden)
            ui.style.display = 'none';
        else
            ui.style.display = 'inherit';
    }
    if(e.key == 'q')
    {
        updateCameraPosition = !updateCameraPosition;
        if(updateCameraPosition)
            document.body.style.cursor = 'none';
        else
            document.body.style.cursor = 'default';
    }
    
});
window.addEventListener('keyup', e =>
{
    if(e.key == 'r')
    {
        camera.zoom = 1.75;
        camera.position.x = 0;
        camera.position.y = 2.5;
        camera.position.z = 7.45;
        camera.rotation.x = -Math.PI * 0.083333;
        camera.rotation.y = 0;
        camera.rotation.z = 0;
        camera.updateProjectionMatrix();
    }
});
var cursorOnViewport = false;
var isUiHidden = false;
var updateCameraPosition = true;
window.addEventListener('mousemove', (event) => {
    //console.log('x: ' + event.clientX + "; y: " + event.clientY);
    cursorOnViewport = isUiHidden || event.clientX > 350;
});

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, 16/9, 0.1, 1000);
camera.zoom = 1.75;
camera.position.y = 2.5;
camera.position.z = 7.45;
camera.rotation.x = -Math.PI * 0.083333;
camera.updateProjectionMatrix();
const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
let viewportSize = 81.25;
renderer.setSize(viewportSize * 16, viewportSize * 9);
renderer.setClearColor(0x33bbff);
renderer.domElement.style.zIndex = -10;
document.body.appendChild(renderer.domElement);

const sun = new THREE.DirectionalLight(0xffffff, 1);
sun.position.x = -0.25;
sun.position.y = 1;
sun.position.z = 1;
sun.castShadow = true;
scene.add(sun);

const glbLoader = new GLTFLoader();

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');

glbLoader.setDRACOLoader(dracoLoader);

/*glbLoader.load('Models/fan_bed.glb', function(model)
{
    /*const canvas = document.createElement('canvas')
    canvas.width = 128
    canvas.height = 128
    const context = canvas.getContext('2d')
    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, 128, 128)
    const texture = new THREE.CanvasTexture(canvas)
    model.scene.traverse(function (child) {
        if (child.isMesh) {
            child.material.map = texture
        }
    })



    model.scene.receiveShadow = true;
    for(let i = 0; i < model.scene.children.length; i++)
    {
        model.scene.children[i].receiveShadow = true;
        //model.scene.children[i].castShadow = true;
    }
    scene.add(model.scene);
    var bed = model;
});*/

var ctxDiffuse = canvasTextureDiffuse.getContext('2d');
ctxDiffuse.drawImage(cottonDiffuse, 0, 0);
ctxDiffuse.fillStyle = '#fff';
ctxDiffuse.fillRect(0, 0, 1024, 1024);
var ctxNormal = canvasTextureNormal.getContext('2d');
ctxNormal.drawImage(cottonNormal, 0, 0);

function setMaterialNormals(type)
{
    if(type == 'cotton')
        ctxNormal.drawImage(cottonNormal, 0, 0);
    else if(type == 'flannel')
        ctxNormal.drawImage(flannelNormal, 0, 0);
}
canvasTextureDiffuse.addEventListener('click', () =>
{
    uploader.click();
});
colorPicker.addEventListener('change', e =>
{
    loadedMaterial.color = new THREE.Color(e.target.value);
});
uploader.addEventListener('change', e =>
{
    let importedImage = new Image();
    const importedFile = uploader.files[0];
    importedImage.src = URL.createObjectURL(importedFile);
    importedImage.onload = () =>
    {
        ctxDiffuse.drawImage(importedImage, 0, 0);
        refreshBlanketTexture();
    };
});
cottonBtn.addEventListener('click', () =>
{
    setMaterialNormals('cotton');
    refreshBlanketTexture();
});
flannelBtn.addEventListener('click', () =>
{
    setMaterialNormals('flannel');
    refreshBlanketTexture();
});
var loadedModel;
var loadedMaterial;
function refreshBlanketTexture()
{
    scene.remove(loadedModel);

    let textureDiffuse = new THREE.CanvasTexture(canvasTextureDiffuse);
    let textureNormal = new THREE.CanvasTexture(canvasTextureNormal);

    glbLoader.load('Models/Minimalistic (by dylanheyes).glb', function(model)
    {
        let foundMaterial = false;
        model.scene.traverse(function (child)
        {
            if (!foundMaterial && child.isMesh)
            {
                child.material.map = textureDiffuse;
                child.material.normalMap = textureNormal;
                foundMaterial = true;
                loadedMaterial = child.material;
            }
        });

        model.scene.receiveShadow = true;
        for(let i = 0; i < model.scene.children.length; i++)
        {
            model.scene.children[i].receiveShadow = true;
            //model.scene.children[i].castShadow = true;
        }
        scene.add(model.scene);
        var loadedModel = model.scene;
    });
}

refreshBlanketTexture();
const firstPersonControls = new FirstPersonControls(camera, renderer.domElement);

function animate() 
{
    requestAnimationFrame(animate);

    if(cursorOnViewport && updateCameraPosition)
        firstPersonControls.update(0.4);

    renderer.render(scene, camera);
}
animate();
