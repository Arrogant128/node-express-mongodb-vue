import girl from '../controller/girls'
module.exports = function (router) {
  router.get('/girl/list', girl.getList)
}
