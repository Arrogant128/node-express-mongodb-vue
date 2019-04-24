import Base from './base'
import User from '../model/login'
import config from 'config-lite';
import {getRegion, getClientIp} from '../tool/util'

class Login extends Base {
  constructor() {
    super()
    this.login = this.login.bind(this)
  }

  async login(req, res) {
    const {password, username, status = 1} = req.body
    console.log('req', req.body)
    try {
      if (!password) {
        throw new Error('密码不存在')
      } else if (!username) {
        throw new Error('请输入密码')
      }
    } catch (error) {
      console.log(error)
      res.send({
        status: 400,
        message: error.message
      })
      return
    }
    const admin = await User.findOne({username})
    if (!admin) {
      const role = status === 1 ? 1 : 2
      const admin_id = await this.getId('admin_id')
      let newAdmin = new User({
        username,
        password: this.encryption(password),
        id: admin_id,
        role,
        createTime: new Date()
      })
      newAdmin.save()
      console.log(newAdmin)
      req.session.admin_id = newAdmin.id
      req.session.role = role
      res.send({
        status: 200,
        message: '注册账号成功！',
        token: config.token,
        data: {
          role: newAdmin.role,
          avatar: newAdmin.avatar,
          name: newAdmin.username,
          createTime: newAdmin.createTime,
          id: admin_id,
        }
      })
    } else {
      res.send({
        status: 400,
        message: '账号已存在，请重新创建'
      })
    }
  }

  async userInfo(req, res) {
    const admin_id = req.session.admin_id
    if (!admin_id || !Number(admin_id)) {
      console.log('获取管理员信息的session失效')
      res.send({
        status: 400,
        type: 'ERROR_SESSION',
        message: '获取管理员信息失败'
      })
      return
    }
    try {
      console.log(admin_id)
      const info = await User.findOne({ id: admin_id }, '-_id -__v -password')
      if (!info) {
        throw new Error('未找到当前管理员')
      } else {
        const region = await getRegion(getClientIp(req)) || ''
        res.send({
          status: 200,
          data: info,
          region: region && region.result.ad_info || ''
        })
      }
    } catch (err) {
      console.log(err, 'in');
      console.log('获取管理员信息失败');
      res.send({
        status: 0,
        type: 'GET_ADMIN_INFO_FAILED',
        message: '获取管理员信息失败'
      })
    }
  }
}

export default new Login()
