var canvas, world, timer, originTimeout
var elements = [], bodies = []
var sW = document.body.clientWidth
var sH = document.body.clientHeight
var first = true
var ctx
init()
// speed(2000)

// 初始化
function init () {
  var worldAABB
  canvas = document.getElementById('can')
  ctx = canvas.getContext('2d')
  canvas.width = sW
  canvas.height = sH
  worldAABB = new b2AABB()
  worldAABB.minVertex.Set(0, -100)
  worldAABB.maxVertex.Set(sW, sH)
  world = new b2World(worldAABB, new b2Vec2(0, 600), true)
  createWall(0.1, sH, sW, 0) // 右
  createWall(sW, 0.1, 0, sH) // 下
  createWall(0.1, sH, 0, 0) // 左
  setInterval(loop, 1000 / 40)// loop
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

// 判断手机方向
window.addEventListener('deviceorientation', deviceOrientationHandler, true)
function deviceOrientationHandler (event) {
  if (event && first) {
    switch (true) {
      case event.beta > 10 && event.beta < 24: speed(2000); break;
      case event.beta > 25 && event.beta < 34: speed(1300); break;
      case event.beta > 35 && event.beta < 54: speed(900); break;
      case event.beta > 75: speed(600); break;
    }
  }
}

// 一次添加多个react
function addReact(){
  for(var i=0;i<5;i++){
    create()
  }
}
// 摇一摇
window.addEventListener('devicemotion',deviceMotionHandler,false);
var f // 4s能使用一次摇一摇
var last_update = 0;
var x, y, z, last_x = 0, last_y = 0, last_z = 0;

function deviceMotionHandler(eventData) {
        var acceleration =eventData.accelerationIncludingGravity;
        var curTime = new Date().getTime();
        if ((curTime-last_update)> 10) {
            var diffTime = curTime -last_update;
            last_update = curTime;
            x = acceleration.x;
            y = acceleration.y;
            z = acceleration.z;
            var speed = Math.abs(x +y + z - last_x - last_y - last_z) / diffTime * 10000;
            if (speed > 4000) {
                if(!f||(f && (f + 4000 < new Date().getTime()))){
                  f = new Date().getTime();
                  addReact()
                }
            }
            last_x = x;
            last_y = y;
            last_z = z;
        }
}


function createWall(width, height, x, y) {
  var wall, BodyDef = new b2BodyDef()
  wall = new b2BoxDef()
  wall.density = 0
  wall.restitution = 0.1
  wall.friction = 0.5
  wall.extents.Set(width, height); // 定义矩形高、宽
  BodyDef.position.Set(x, y); // 设置物体的初始位置
  BodyDef.AddShape(wall)
  world.CreateBody(BodyDef)
}

function createReact(width, height, x, y) {
  var react, BodyDef = new b2BodyDef()
  react = new b2BoxDef()
  react.density = 0.3
  react.restitution = 0.1
  react.friction = 0.5
  react.extents.Set(width, height); // 定义矩形高、宽
  BodyDef.linearVelocity.Set(Math.random() * 400 - 200, Math.random() * 400 - 200)// 随机初速度
  BodyDef.position.Set(x, y); // 设置物体的初始位置
  BodyDef.AddShape(react)
  world.CreateBody(BodyDef)
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

// 创建
function create () {
  var temp = 20
  createReact(temp*2, temp, rd(temp, sW-temp), -40)
}

function loop () {
  var dt = 1 / 60
  var iterations = 10
  var count = 0
  world.Step(dt, iterations)
  var debug = new DEBUG()
  debug.drawWorld(ctx)
}

// 随机
function rd (min, max) {
  var c = max - min + 1
  return Math.floor(Math.random() * c + min)
}






// DEBUG
function DEBUG () {
  this.drawWorld = function (context) {
    context.clearRect(0, 0, sW, sH)
    for (var b = world.m_bodyList; b; b = b.m_next) {
      for (var s = b.GetShapeList(); s != null; s = s.GetNext()) {
        this.drawShape(s, context)
      }
    }
  }
  this.drawShape = function (shape, context) {
    context.strokeStyle = '#000'
    context.beginPath()
    switch (shape.m_type) {
      case b2Shape.e_circleShape: { // 圆
        var circle = shape
        var r = circle.m_radius
        var pos = circle.m_position
        context.arc(pos.x, pos.y, r, 0, Math.PI * 2, false)
        context.moveTo(pos.x, pos.y)
        break
      }
      case b2Shape.e_polyShape: { // 多边形
        var poly = shape
        var tV = b2Math.AddVV(poly.m_position,
          b2Math.b2MulMV(poly.m_R, poly.m_vertices[0]))
        context.moveTo(tV.x, tV.y)
        for (var i = 0; i < poly.m_vertexCount; i++) {
          var v = b2Math.AddVV(poly.m_position,
            b2Math.b2MulMV(poly.m_R, poly.m_vertices[i]))
          context.lineTo(v.x, v.y)
        }
        context.lineTo(tV.x, tV.y)
        break
      }
    }
    context.stroke(); // 绘制
  }
}












