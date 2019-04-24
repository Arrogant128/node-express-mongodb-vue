const mongoose = require('mongoose')
const config = require('config-lite')(__dirname)
console.log(config)
mongoose.connect(config.url, {
  useNewUrlParser: true,
  useCreateIndex: true
})
const db = mongoose.connection
db.on("error", function (error) {
  console.log("数据库连接失败：" + error)
})
//如果连接成功会执行open回调
db.on("open", function () {
  console.log("数据库连接成功")
})
export default db
