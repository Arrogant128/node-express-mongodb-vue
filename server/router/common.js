import common from '../controller/common'
module.exports = function (router) {
  router.get('/common/getCounts', common.getCounts)
}
