<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls'
// import { createWall } from '@/utils.js'


let scene, camera, renderer, controls;
const ROOM_WIDTH = 10
const ROOM_HEIGHT = 7
const ROOM_DEPTH = 20
const MOVE_SPEED = 0.1
const moveForward = ref(false)
const moveBackward = ref(false)
const moveLeft = ref(false)
const moveRight = ref(false)
const sceneContainer = ref(null)


const onKeyDown = (event) => {
  switch (event.code) {
    case 'KeyW': moveForward.value = true; break
    case 'KeyS': moveBackward.value = true; break
    case 'KeyA': moveLeft.value = true; break
    case 'KeyD': moveRight.value = true; break
  }
}

const onKeyUp = (event) => {
  switch (event.code) {
    case 'KeyW': moveForward.value = false; break
    case 'KeyS': moveBackward.value = false; break
    case 'KeyA': moveLeft.value = false; break
    case 'KeyD': moveRight.value = false; break
  }
}

const animate = () => {
  requestAnimationFrame(animate)
  
  if (controls.isLocked) {
    if (moveForward.value) controls.moveForward(MOVE_SPEED)
    if (moveBackward.value) controls.moveForward(-MOVE_SPEED)
    if (moveLeft.value) controls.moveRight(-MOVE_SPEED)
    if (moveRight.value) controls.moveRight(MOVE_SPEED)
  }
  
  renderer.render(scene, camera)
}

const onWindowResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

function setupScene() {
  scene = new THREE.Scene()

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  )
  camera.position.set(0, 1.6, 0)  

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  sceneContainer.value.appendChild(renderer.domElement)

    controls = new PointerLockControls(camera, renderer.domElement)
  document.addEventListener('click', () => {
    controls.lock()
  })

    createFloor()
  initWalls()
}

function createFloor() {
  const floorGeometry = new THREE.PlaneGeometry(ROOM_WIDTH, ROOM_DEPTH)
  const floorMaterial = new THREE.MeshBasicMaterial({ color: 0x808080 })
  const floor = new THREE.Mesh(floorGeometry, floorMaterial)
  floor.rotation.x = -Math.PI / 2
  scene.add(floor)
}

function createWall(geometry, position, rotation = new THREE.Euler(), addEdges = true) {
  const wallMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })
  const wall = new THREE.Mesh(geometry, wallMaterial)
  wall.position.copy(position)
  wall.rotation.copy(rotation)
  
  if (addEdges) {
    const edges = new THREE.EdgesGeometry(geometry)
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000 })
    const lines = new THREE.LineSegments(edges, lineMaterial)
    wall.add(lines)
  }
  
  scene.add(wall)
  return wall
}

function initVideoDisplay(parentWall) {
  const video = document.createElement('video')
  video.src = 'assets/media/sample_4k.mp4'
  video.loop = true
  video.muted = true
  video.autoplay = true
  video.play()

  const videoTexture = new THREE.VideoTexture(video)
  videoTexture.minFilter = THREE.LinearFilter
  videoTexture.magFilter = THREE.LinearFilter
  videoTexture.format = THREE.RGBFormat

  const videoMaterial = new THREE.MeshBasicMaterial({
    map: videoTexture,
    side: THREE.DoubleSide,
  })

  const displayWidth = 6
  const displayHeight = 3.375
  const displayGeo = new THREE.PlaneGeometry(displayWidth, displayHeight)
  const videoDisplay = new THREE.Mesh(displayGeo, videoMaterial)
  
  videoDisplay.position.set(0, ROOM_HEIGHT / 14, 0.01)
  
  const displayBorderGeo = new THREE.EdgesGeometry(displayGeo)
  const displayBorder = new THREE.LineSegments(
    displayBorderGeo,
    new THREE.LineBasicMaterial({ color: 0x000000 })
  )
  videoDisplay.add(displayBorder)
  
  parentWall.add(videoDisplay)
}

function initWalls() {
  const wallConfigs = [
    {
      // Front
      geometry: new THREE.PlaneGeometry(ROOM_WIDTH, ROOM_HEIGHT),
      position: new THREE.Vector3(0, ROOM_HEIGHT / 2, -ROOM_DEPTH / 2),
      rotation: new THREE.Euler(0, 0, 0),
      hasVideo: true,
    },
    {
      // Back
      geometry: new THREE.PlaneGeometry(ROOM_WIDTH, ROOM_HEIGHT),
      position: new THREE.Vector3(0, ROOM_HEIGHT / 2, ROOM_DEPTH / 2),
      rotation: new THREE.Euler(0, Math.PI, 0),
    },
    {
      // Left
      geometry: new THREE.PlaneGeometry(ROOM_DEPTH, ROOM_HEIGHT),
      position: new THREE.Vector3(-ROOM_WIDTH / 2, ROOM_HEIGHT / 2, 0),
      rotation: new THREE.Euler(0, Math.PI / 2, 0),
    },
    {
      // Right
      geometry: new THREE.PlaneGeometry(ROOM_DEPTH, ROOM_HEIGHT),
      position: new THREE.Vector3(ROOM_WIDTH / 2, ROOM_HEIGHT / 2, 0),
      rotation: new THREE.Euler(0, -Math.PI / 2, 0),
    }
  ]
  
  wallConfigs.forEach(config => {
    const wall = createWall(config.geometry, config.position, config.rotation)
    if (config.hasVideo) {
      initVideoDisplay(wall)
    }
  })
}

function init() {
  setupScene()
  
  window.addEventListener('resize', onWindowResize)
  document.addEventListener('keydown', onKeyDown)
  document.addEventListener('keyup', onKeyUp)
  
  animate()
}

onMounted(() => {
  init()
})

onUnmounted(() => {
  window.removeEventListener('resize', onWindowResize)
  document.removeEventListener('keydown', onKeyDown)
  document.removeEventListener('keyup', onKeyUp)
})
</script>
<template>
  <div ref="sceneContainer" class="scene-container"></div>
</template>
<style scoped>
.scene-container {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}
</style>
