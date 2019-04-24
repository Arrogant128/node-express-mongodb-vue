const express = require('express')
const router = express.Router()
const login = require('./router/login')
const common = require('./router/common')
login(router)
common(router)
module.exports = router
