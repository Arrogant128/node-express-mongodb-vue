import md5 from 'blueimp-md5'
import Ids from '../model/ids'

export default class Base {
  constructor() {
    this.idList = ['admin_id', 'girl_id', 'img_id']
    this.encryption = this.encryption.bind(this)
  }

  encryption(value) {
    return md5(md5(value))
  }
  async getId (type) {
    console.log('11', this.idList, type)
    if (!this.idList.includes(type)) {
      console.log('id类型错误')
      throw new Error('id类型错误')
      return
    }
    try {
      const idData = await Ids.findOne()
      idData[type]++
      await idData.save()
      return idData[type]
    } catch (err) {
      console.log('获取ID数据失败')
      throw new Error(err)
    }
  }
}

