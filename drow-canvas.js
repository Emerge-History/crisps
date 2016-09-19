//forked & modified


var canvas, world, ctx
var elements = [], bodies = []

var type = [
    document.getElementById("img1"),
    document.getElementById("img2")
]




var sW = document.body.clientWidth
var sH = document.body.clientHeight
var first = true

// 初始化
function init() {
    var worldAABB
    canvas = document.getElementById('main-canvas')
    canvas.width = sW
    canvas.height = sH
    worldAABB = new b2AABB()
    worldAABB.minVertex.Set(0, -100)
    worldAABB.maxVertex.Set(sW, sH)
    world = new b2World(worldAABB, new b2Vec2(0, 600), true)
    createWall(0.1, sH, sW, 0) // 右
    createWall(sW, 0.1, 0, sH) // 下
    createWall(0.1, sH, 0, 0) // 左
    requestAnimationFrame(loop);
}


// pos 用来标识手机左右倾斜的重力
var pos
// 判断手机方向
window.addEventListener('deviceorientation', deviceOrientationHandler, true)
function deviceOrientationHandler(event) {
    if (event && first) {
        pos = Math.sin(event.gamma * Math.PI / 180) //<--厉害 看不懂
        switch (true) {
            case event.beta > 10 && event.beta < 24:
                // speed(2000)
                break
            case event.beta > 25 && event.beta < 34:
                // speed(1300)
                break
            case event.beta > 35 && event.beta < 54:
                // speed(900)
                break
            case event.beta > 75:
                // speed(600)
                break
        }
    }
}


function create() {
    var vW = 35
    var vH = 35
    createReact(vW >> 1, vH >> 1, rd(vW >> 1, sW - vW), -80)
    var rdType = type[rd(0, type.length - 1)]
    var scale = rd(9, 10) / 10
    elements.push({
        img: rdType,
        width: rdType.width * scale,
        height: rdType.height * scale
    })
}



// 创建墙
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

// 创建薯片
function createReact(width, height, x, y) {
    var react, BodyDef = new b2BodyDef()
    react = new b2BoxDef()
    react.density = 0.1
    react.restitution = 0.4
    react.friction = 0.2
    react.extents.Set(width, height); // 定义矩形高、宽
    // BodyDef.linearVelocity.Set(Math.random() * 400 - 200, Math.random() * 400 - 200)// 随机初速度
    BodyDef.position.Set(x, y) // 设置物体的初始位置
    BodyDef.angularDamping = 0.02
    BodyDef.angularVelocity = Math.random() * 50
    BodyDef.AddShape(react)
    bodies.push(world.CreateBody(BodyDef))
}

function reset() {
    if (bodies) {
        for (i = 0; i < bodies.length; i++) {
            var body = bodies[i]
            world.DestroyBody(body)
            body = null
        }
    }
    bodies = []
    elements = []
}



var time1 = new Date().getTime()
function loop() {
    var time2 = new Date().getTime()
    // 手机左右倾斜 添加重力
    var dt = (time2 - time1) / 1000
    world.m_gravity.x = pos * 2050
    time1 = time2

    ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, sW, sH);

    if (elements.length < 250) {
        create()
    }

    var iterations = 5
    var count = 0
    world.Step(dt, iterations)
    for (i = 0; i < bodies.length; i++) {
        var body = bodies[i]
        var element = elements[i]
        var left = (body.m_position0.x)
        var top = (body.m_position0.y)
        var rot = body.m_rotation0;
        ctx.save();
        ctx.translate(left, top);
        ctx.rotate(rot);
        ctx.drawImage(element.img, -45, -45, 90, 90);
        ctx.restore();
    }
    return requestAnimationFrame(loop);
}


// 随机
function rd(min, max) {
    var c = max - min + 1
    return Math.floor(Math.random() * c + min)
}



init()