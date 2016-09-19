var canvas, world, timer, originTimeout
var elements = [], bodies = []

var type = [
  {url: '1.png',width: 160,height: 138},
  {url: '2.png',width: 177,height: 134}
]
var sW = document.body.clientWidth
var sH = document.body.clientHeight
var first = true

init()
speed(2000)

// 初始化
function init () {
  var worldAABB
  canvas = document.getElementById('J_can-box')
  canvas.width = sW
  canvas.height = sH
  worldAABB = new b2AABB()
  worldAABB.minVertex.Set(0, -100)
  worldAABB.maxVertex.Set(sW, sH)
  world = new b2World(worldAABB, new b2Vec2(0, 400), true)
  createWall(0.1, sH, sW, 0) // 右
  createWall(sW, 0.1, 0, sH) // 下
  createWall(0.1, sH, 0, 0) // 左
  // setInterval(loop, 1000 / 40) // loop
  requestAnimationFrame(loop);
}

// 下落的速度
function speed (timeout) {
  originTimeout = originTimeout || timeout
  if (originTimeout != timeout || !timer) {
    clearInterval(timer)
    timer = setInterval(function () {
      create()
    }, timeout)
    originTimeout = timeout
  }
}

// pos 用来标识手机左右倾斜的重力
var pos
// 判断手机方向
window.addEventListener('deviceorientation', deviceOrientationHandler, true)
function deviceOrientationHandler (event) {
  if (event && first) {
    pos = Math.sin(event.gamma * Math.PI / 180)

    switch (true) {
      case event.beta > 10 && event.beta < 24:
        speed(2000)
        break
      case event.beta > 25 && event.beta < 34:
        speed(1300)
        break
      case event.beta > 35 && event.beta < 54:
        speed(900)
        break
      case event.beta > 75:
        speed(600)
        break
    }
  }
}

// 一次添加多个react
function addReact () {
  for (var i = 0;i < 5;i++) {
    create()
  }
}
// 摇一摇
window.addEventListener('devicemotion', deviceMotionHandler, false)
var f // 4s能使用一次摇一摇
var last_update = 0
var x, y, z, last_x = 0, last_y = 0, last_z = 0

function deviceMotionHandler (eventData) {
  var acceleration = eventData.accelerationIncludingGravity
  var curTime = new Date().getTime()
  if ((curTime - last_update) > 10) {
    var diffTime = curTime - last_update
    last_update = curTime
    x = acceleration.x
    y = acceleration.y
    z = acceleration.z
    var speed = Math.abs(x + y + z - last_x - last_y - last_z) / diffTime * 10000
    if (speed > 4000) {
      if (!f || (f && (f + 4000 < new Date().getTime()))) {
        f = new Date().getTime()
        addReact()
      }
    }
    last_x = x
    last_y = y
    last_z = z
  }
}

// 创建墙
function createWall (width, height, x, y) {
  var wall, BodyDef = new b2BodyDef()
  wall = new b2BoxDef()
  wall.density = 0
  wall.restitution = 0.1
  wall.friction = 0
  wall.extents.Set(width, height); // 定义矩形高、宽
  BodyDef.position.Set(x, y); // 设置物体的初始位置
  BodyDef.AddShape(wall)
  world.CreateBody(BodyDef)
}

// 创建薯片
function createReact (width, height, x, y) {
  var react, BodyDef = new b2BodyDef()
  react = new b2BoxDef()
  react.density = 0.3
  react.restitution = 0.1
  react.friction = 0.5
  react.extents.Set(width, height); // 定义矩形高、宽
  // BodyDef.linearVelocity.Set(Math.random() * 400 - 200, Math.random() * 400 - 200)// 随机初速度
  BodyDef.position.Set(x, y); // 设置物体的初始位置
  BodyDef.AddShape(react)
  bodies.push(world.CreateBody(BodyDef))
}

// 清除
function reset () {
  var childs = canvas.childNodes
  var i
  for (var j = childs.length - 1; j >= 0; j--) {
    canvas.removeChild(childs[j])
  }
  if (bodies) {
    for (i = 0; i < bodies.length; i++) {
      var body = bodies[i]
      world.DestroyBody(body)
      body = null
    }
  }
  bodies = []
  elements = []
  clearInterval(timer)
}

// 创建div
function create () {
  var vW = 80
  var vH = 60
  createReact(vW >> 1, vH >> 1, rd(vW >> 1, sW - vW), -80)
  var rdType = type[rd(0, type.length - 1)]
  var element = document.createElement('div')
  element.width = vW
  element.height = vH
  element.style = 'visibility:hidden;'
  canvas.appendChild(element)
  var scale = rd(9, 10) / 10
  elements.push({
    element: element,
    shape: {
      width: rdType.width * scale,
      height: rdType.height * scale,
      url: rdType.url
    }
  })
}

var time1 = new Date().getTime()
function loop () {
  var time2 = new Date().getTime()
  // 手机左右倾斜 添加重力
  world.m_gravity.x = pos * 350 + 10

  var dt = (time2 - time1) / 1000
  time1 = time2
  var iterations = 10
  var count = 0
  world.Step(dt, iterations)
  for (i = 0; i < bodies.length; i++) {
    var body = bodies[i]
    var element = elements[i].element
    var shape = elements[i].shape
    var left = (body.m_position0.x - (element.width >> 1)) - ((shape.width - element.width) >> 1)
    var top = (body.m_position0.y - (element.height >> 1)) - ((shape.height - element.height))
    if (top < 0) {
      count++
    }
    if (count > 8) {
      reset()
      first = false
    }
    if (element.style.visibility != 'visible') {
      element.style.backgroundImage = 'url(' + shape.url + ')'
      element.style.width = shape.width + 'px'
      element.style.height = shape.height + 'px'
      element.style.visibility = 'visible'
      element.style.position = 'absolute'
      element.style.backgroundSize = 'cover'
    }

    var rotationStyle = 'translate(' + left + 'px,' + top + 'px) rotate(' + (body.m_rotation0 * 57.2957795) + 'deg)'
    element.style.WebkitTransform = rotationStyle
    element.style.MozTransform = rotationStyle
    element.style.OTransform = rotationStyle
    element.style.MsTransform = rotationStyle
  }
  return requestAnimationFrame(loop);
}

// 随机
function rd (min, max) {
  var c = max - min + 1
  return Math.floor(Math.random() * c + min)
}
