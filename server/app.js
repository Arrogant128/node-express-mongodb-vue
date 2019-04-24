const express = require('express')
const bodyParser = require('body-parser')
const session = require('express-session')
const config = require('config-lite')(__dirname)
const app = express()
const router = require('./router')
import task from './core/schedule/index'
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.use('/public/', express.static('./public'))

app.all('*', async (req, res, next) => {
  const start = new Date()
  let ms
  if (!['localhost:9001', 'girl.xutianshi.top', 'localhost:9529'].includes(req.headers.host)) {
    console.log(111)
    res.send(`${req.headers.host}在${new Date()}访问，已被拦截,总有刁民想害朕，锦衣卫护驾`)
  } else { // 跨域处理
    const {origin, Origin, referer, Referer} = req.headers
    const allowOrigin = origin || Origin || referer || Referer || '*'
    res.header('Access-Control-Allow-Origin', allowOrigin)
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
    res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS')
    res.header('Access-Control-Allow-Credentials', true) //可以带cookies
    res.header('X-Powered-By', 'Express')
    res.header('X-Token', config.token)
    // if (req.method === 'OPTIONS') {
    //   res.sendStatus(200)
    // } else {
    //   LogReq(req)
    //   try {
    //     await next()
    //     ms = new Date() - start
    //     log4.i(req, ms)
    //   } catch (error) {
    //     log4.e(req, error, ms)
    //   }
    // }
    next()
  }
})
app.use(session({ // 使用session
    name: config.session.name,
    secret: config.session.secret,
    resave: true,
    saveUninitialized: false,
    cookie: config.session.cookie
  }
))
app.use(router)
import './mongodb/db.js' // 链接数据库
app.listen(9001)
task()
