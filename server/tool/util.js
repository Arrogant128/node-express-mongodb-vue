import request from 'request'
export function getRegion(ip) {
  return new Promise((resolve, reject) => {
    request({
      // url: `http://apis.juhe.cn/ip/ipNew?ip=${ip}&key=d8f5585d01ff69ea22e468d8ccbafbed`,
      url: `https://apis.map.qq.com/ws/location/v1/ip?ip=${ip}&key=FXSBZ-K2OHQ-PUQ57-GOWXM-ZM62Q-27FHP`,
    }, (err, res, bo) => {
      if (res) {
        const body = JSON.parse(bo)
        console.log(body.status, 'd')
        if (body.status === 0) {
          resolve(body)
        } else {
          resolve('')
        }
        // resolve(body.replace(/^"/, '').replace(/"$/, ''))
      }
      if (err) {
        resolve('')
      }
    }, (error) => {
      reject(error)
    })
  })
}
/**
 * 获取外网client的IP
 * @param {request} req
 */
export function getClientIp(req) {
  return (req.ip || req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress || '').match(/\d+.\d+.\d+.\d+/)
}
