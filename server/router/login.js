import login from '../controller/login'

module.exports = function (router) {
  router.post('/admin/login', login.login)
  router.get('/admin/info', login.userInfo)
  router.post('/admin/logout', login.logout)
}
