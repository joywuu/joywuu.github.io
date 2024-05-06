import * as THREE from 'three';
import {FontLoader} from 'three/addons/loaders/FontLoader.js';
import {TextGeometry} from 'three/addons/geometries/TextGeometry.js';
import { OBJLoader} from 'three/addons/loaders/OBJLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';


const canvas = document.getElementById('three-container');
// 设置画布元素的位置和大小。
canvas.style.position = 'fixed';
canvas.style.left = '0';
canvas.style.top = '0';
canvas.style.width = '100%';
canvas.style.height = '100%';

// 将画布元素的溢出属性设置为“隐藏”，以防止其显示滚动条。
canvas.style.overflow = 'hidden';

// 将body元素的溢出属性设置为“滚动”，以允许页面上的其他元素滚动。
// document.body.style.overflowY = 'scroll';

let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

// 获取屏幕宽高
const width = window.innerWidth;
const height = window.innerHeight;

// 海浪相关配置
const amountX = 80;
const amountY = 80;
const spacing = 100;
let mouseX = 220;
// let mouseY = -587;
let mouseY = -487;

// 海面漂浮球体数量
let ballCount = 0;
//高度
let count = 0;

let counts = [];
// 实际粒子集合
let particles = new Array();
let particle;

const fontColors = [
     '#E5E5E5']

const ballConfig = {
    // 数量
    num: 250,
    spacing: 100,
    // 球的集合
    ballList: [],
    // 旋转速度
    speed: 0.005,
    // 球的半径
    radius: 1,
    // 小球半径
    ballRadius: 5,
    // 颜色
    color: 0x5ABDE1
};

// 创建相机
let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
// 设置相机位置和角度
camera.position.z = 1000;

// 创建场景
let scene = new THREE.Scene();

// 设置渲染器
let renderer = new THREE.WebGLRenderer({antialias: true});
// 设置像素比例
renderer.setSize(width, height);

canvas.appendChild(renderer.domElement)
//
let orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.enabled = true;
orbitControls.enableDamping = true;

// 添加输入框事件
const inputDom = document.getElementById("myInput");
inputDom.addEventListener("keyup", function (event) {
    if (event.key === "Enter" || event.keyCode === 13) {
        // 调用函数
        if ((inputDom.value ?? '') !== '') {
            createFont([inputDom.value], true, () => {
                inputDom.value = '';
            });

        }
    }
}
)

/**
 * 初始化
 */
function init() {
    // 创建海浪
    createOceanWave();
    // 加载鱼模型
    loadModel();
    // 创建金字塔
    createPyramid();
    // 创建字体
    createFont(JSON.parse(window.localStorage.getItem("messages") ) || [], false);
    document.addEventListener('mousemove', onDocumentMouseMove, false);
    document.addEventListener('touchstart', onDocumentTouchStart, false);
    document.addEventListener('touchmove', onDocumentTouchMove, false);
    //  注册窗口大小改变事件
    window.addEventListener('resize', onWindowResize, false);
}

/**
 * 创建海浪
 */
function createOceanWave() {
    counts = Array.from({length: amountX * amountY}, (_, index) => index + 1).sort(() => 0.5 - Math.random()).slice(0, 40);

    let i = 0;
    for (let x = 0; x < amountX; x++) {
        for (let y = 0; y < amountY; y++) {
            // 添加粒子
            particle = particles[i++] = getSphereObject(
                ballConfig.ballRadius,
                new THREE.Color(ballConfig.color),
                x * spacing - ((amountX * spacing) / 2),
                0,
                y * spacing - ((amountY * spacing) / 2),
                counts.indexOf(i) >= 0
            );
            scene.add(particle);
        }

    }
}

/**
 * 加载模型
 */
function loadModel() {
    // 加载模型
    const objLoader = new OBJLoader();
    // 遍历鱼类模型
    for (let i = 1; i <= 15; i++) {
        objLoader.load(`../model/TropicalFish${i < 10 ? ('0' + i) : i}.obj`, function (obj) {
            const geometry = obj.children[0].geometry;
            // 获取模型中顶点数据
            const vertices = geometry.getAttribute("position").array;
            // 生成粒子模组
            let mesh = createPoint(vertices);
            // mesh.rotation.x = -0.5 * Math.PI;
            mesh.scale.set(1, 1, 1);
            mesh.position.set(Math.random() * 80 * spacing - ((amountX * spacing) / 2), -1000 - Math.random() * 250, Math.random() * 80 * spacing - ((amountY * spacing) / 2))
            scene.add(mesh);
        })
    }
}

/**
 * 创建金字塔
 */
function createPyramid() {
    let colors =  ["#FFA500", "#F2A3AD","#FFA500", "#F2A3AD"]
    for (let index = 0; index < 12; index++) {
        const geometry = new THREE.CylinderGeometry(0, 300, 300, 4);
        const material = new THREE.MeshMatcapMaterial({color:  new THREE.Color(colors[Math.floor(Math.random() * colors.length)])});
        const mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.x = -Math.random() * Math.PI;
        mesh.position.set(Math.random() * 80 * spacing - ((amountX * spacing) / 2), 1200, Math.random() * 80 * spacing - ((amountY * spacing) / 2));
        scene.add(mesh);
    }
}

/**
 * 创建字体
 */
function createFont(messages, add = false, fun) {
    let fontLoader = new FontLoader();
    let fonts = ['HelveticaNeueLT Std Med Ext_Bold', 'HelveticaNeueLT Std Med Ext_Bold', 'HelveticaNeueLT Std Med Ext_Bold'];
    for (let text of messages) {
        let obj = text;
        if (add) {
            let font = fonts[Math.floor(Math.random() * fonts.length)];
            text = '#'+ text
            let storageMessages  = JSON.parse(window.localStorage.getItem("messages") ) || [];
            obj = {
                message: text,
                font
            }
            storageMessages.push(obj)
            window.localStorage.setItem("messages", JSON.stringify(storageMessages));
            fun();
        }

        fontLoader.load(`../font/${obj.font}.json`, function (fontJson) {
            let textGeometry = new TextGeometry(obj.message,{
                font: fontJson,
                size: 100,
                height: 50,
            });

            let materials = [
                new THREE.MeshMatcapMaterial({ color:  fontColors[Math.floor(Math.random() * fontColors.length)], flatShading: true }), // front
            ];
            let textMesh = new THREE.Mesh(textGeometry, materials);
            textMesh.position.set( 100 + Math.random() * 80 * spacing - ((amountX * spacing) / 2), Math.random() * 300 , Math.random() * 80 * spacing - ((amountY * spacing) / 2));
            scene.add(textMesh);
        })
    }
}

/**
 * 创建粒子物体
 * @param vertices
 * @returns {*}
 */
function createPoint(vertices) {

    let colors =  ["#5ABDE1", "#98EDE2"]
    // let colors =  ["#fc1739", "#0250f6"]
    // 创建材质
    let material = new THREE.PointsMaterial({
        color: new THREE.Color(colors[Math.floor(Math.random() * colors.length)]),
        size: 10,
        opacity: 1,
        transparent: true,
        depthTest: false,
    });

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Uint8BufferAttribute(vertices.fill(0), 3));

    return new THREE.Points(geometry, material);
}

/**
 * 创建球体
 * @param radius
 * @param color
 * @param x
 * @param y
 * @param z
 * @param num
 * @returns {*}
 */
function getSphereObject(radius = 0.2, color, x = 0, y = 0, z = 0, num = false) {

    if (ballCount <= 40 && num) {
        radius = 100 + Math.floor(Math.random() * 50);
        color = 0xFFE254;
        ballCount++;
    }


    // 设置材质
    const geom = new THREE.SphereGeometry(radius, 32, 32);
    const mat = new THREE.MeshMatcapMaterial({
        color
    });
    // 开始创建
    const sphere = new THREE.Mesh(geom, mat);
    // 设置位置
    sphere.position.x = x;
    sphere.position.y = y;
    sphere.position.z = z;
    return sphere;
}


/**
 * 移动鼠标时
 * @param event
 */
function onDocumentMouseMove(event) {
    mouseX = event.clientX - windowHalfX;
    mouseY = event.clientY - windowHalfY;
}

/**
 * 鼠标开始移入时
 * @param event
 */
function onDocumentTouchStart(event) {
    if (event.touches.length === 1) {
        event.preventDefault();
        mouseX = event.touches[0].pageX - windowHalfX;
        mouseY = event.touches[0].pageY - windowHalfY;
    }
}

/**
 * 鼠标移除时
 * @param event
 */
function onDocumentTouchMove(event) {
    if (event.touches.length === 1) {
        event.preventDefault();
        mouseX = event.touches[0].pageX - windowHalfX;
        mouseY = event.touches[0].pageY - windowHalfY;
    }
}

/**
 * 渲染
 */
function render() {
    camera.position.x += (mouseX - camera.position.x) * .05;
    camera.position.y += (-mouseY - camera.position.y) * .05;
    camera.lookAt(scene.position);


    let i = 0;
    for (let x = 0; x < amountX; x++) {
        for (let y = 0; y < amountY; y++) {
            // 添加粒子
            particle = particles[i++];
            particle.position.y = (Math.sin((x + count) * 0.3) * 50) + (Math.sin((y + count) * 0.5) * 50);
            if (counts.indexOf(i) < 0) {
                particle.scale.x = particle.scale.y = (Math.sin((x + count) * 0.3) + 1) * 2 + (Math.sin((y + count) * 0.5) + 1) * 2;

            }
        }

    }

    count += 0.1
}

/**
 * 动画
 */
function animation() {
    requestAnimationFrame(animation);
    render();
    // orbitControls.update()
    renderer.render(scene, camera);
}

/**
 * 页面大小发生改变时
 */
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

init();
animation();


