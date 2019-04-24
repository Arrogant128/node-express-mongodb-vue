import girl from '../controller/girls'
module.exports = function (router) {
  router.post('/girl/list', girl.getList)
  router.post('/girl/getDetail', girl.getDetail)
}
