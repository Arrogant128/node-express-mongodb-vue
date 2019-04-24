import Base from './base'
import AllGirlModel from '../model/allgirls';
import detailModel from '../model/details'

class Girl extends Base {
    constructor () {
        super()
        this.getList = this.getList.bind(this)
    }

    async getList (req, res, next) {
        const {page, pageSize, ...params} = req.body
        for (let key in params) {
            const v = params[key]
            if (v === '' || v === undefined || v === 'undefind') {
                delete params[key]
            }
        }
        try {
            const total = await AllGirlModel.countDocuments({...params})
            let girl = null
            if (total < 10) { //TODO: 优先展示排序规则  1-最新完成爬取页的在前面 2-没完成的话就根据最新创建时间在前面
                girl = await AllGirlModel.find({...params}).sort({'finishTime': -1, 'createTime': -1})
            } else {
                girl = await AllGirlModel.find({...params}).skip((page - 1) * pageSize).limit(pageSize).sort({
                    'finishTime': -1,
                    'createTime': -1
                })
            }
            res.send({
                status: 200,
                message: `获取数据成功`,
                data: {
                    items: girl,
                    total
                }
            })
        } catch (err) {
            res.send({
                status: 400,
                message: `查询失败,失败原因:${err}`
            })
        }
    }

    /**
     * 获取女性详情
     * @param {*} req
     * @param {*} res
     * @param {*} next
     */
    async getDetail (req, res, next) {
        const {uid} = req.body
        try {
            const girl = await detailModel.findOne({realUid: uid})
            res.send({
                status: 200,
                data: {
                    detail: girl
                }
            })
        } catch (err) {
            res.send({
                status: 400,
                message: `查询失败,失败原因:${err}`
            })
        }
    }
}

export default new Girl()
