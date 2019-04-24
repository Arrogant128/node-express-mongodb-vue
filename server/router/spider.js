import Spider from '../controller/spider'
module.exports = function (router) {
    router.get('/spider/getSipderConfig', Spider.getSipderConfig)
    router.post('/spider/spiDetailByRealUid', Spider.spiDetailByRealUid)
}
