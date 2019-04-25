import Base from './base'
import spiderModel from '../model/spider'
import AllGirlModel from '../model/allgirls'
import detailModel from '../model/details'
import { getipList } from '../core/config'
import getDetail from '../core/spider/getdetail'
import async from 'async'

class Spider extends Base{
    constructor () {
        super()
        this.getSipderConfig = this.getSipderConfig.bind(this)
        this.spiDetailByRealUid = this.spiDetailByRealUid.bind(this) // 继承方法 绑定
    }
    async getSipderConfig (req, res, next) {
        try {
            const config = await spiderModel.find({})
            let area = []
            for (let key in config[0]['area']) {
                area.push(key)
            }
            res.send({
                status: 200,
                data: {
                    area,
                    cookie: config[0]['cookie'],
                    age: config[0]['age'],
                    height: config[0]['height'],
                    education: config[0]['education'],
                    marriage: config[0]['marriage']
                }
            })
        } catch (error) {
            res.send({
                status: 400,
                message: `获取失败,失败原因:${error}`
            })
        }
    }
    /**
     * 根据UID爬取详情数据
     * @param {*} req
     * @param {*} res
     * @param {*} next
     */
    async spiDetailByRealUid(req, res, next) {
        const {cookie} = req.body
        console.log('cookie123', cookie)
        try {
            let Cur = new Date().getTime()
            //V1.1.0使用总表
            let realUidArr = await AllGirlModel.distinct('realUid') // 映射
            console.log('realUidArr', realUidArr)
            let finUidArr = await detailModel.distinct('realUid')
            console.log('finUidArr', finUidArr)
            let realUids = null

            if (finUidArr.length > 0) {
                realUids = this.difference(realUidArr, finUidArr)
            } else {
                realUids = realUidArr
            }
            let remainLength = realUids.length
            const Length = realUidArr.length
            res.send({
                status: 200,
                message: `爬取详细页任务已开始`,
                data: `查询耗时：${(new Date().getTime() - Cur) / 1000},剩余爬取数为${remainLength}`
            })
            const ipList = await getipList()
            await spiderModel.findOneAndUpdate({}, { $set: { cookie } })
            // 记录任务开始
            async.mapLimit(realUids, 100, async function (realUid, cb) {
                //way-1 详细任务开始 直接拿一波已有IP进行随机  每次请求都随机一个代理IP
                const row = ipList[parseInt(Math.random() * ipList.length)]
                const ip = `${row.type}://${row.host}:${row.port}/`
                let cur = new Date().getTime()
                getDetail(realUid, cookie, ip).then(rs => {

                    // 判断当前用户是否是空资料(未审核通过||关闭||隐藏)
                    if (rs['学历'] === '' && rs['身高'] === '') {
                        remainLength--
                        // 异常UID事件
                        // G.DetailStatusUidErr = { 'text': `异常-realUid:${realUid},花费时间:${(new Date().getTime() - cur) / 1000}seconds,剩余realUid数量：${remainLength}`, 'percent': ((Length - remainLength) / Length) * 100 }
                        // console.log(`异常-realUid:${realUid},花费时间:${(new Date().getTime() - cur) / 1000}seconds,剩余realUid数量：${remainLength}`)
                        cb(null, realUid) // 结束本次函数 抛出本次异常realUid
                    } else {
                        // 判断当前的数据有没有薪资 如果没有，说明cookie过期 需要重新拿TODO:停止爬取任务 发送邮件更新cookie
                        if (rs['经济实力']['月薪'] === '登录后可见' || rs['经济实力']['购车'] === '登录后可见') {
                            //cookie错误事件
                            // G.DetailStatusCookieErr = { 'text': `传送时间:${new Date()}--请更新cookie以爬取私密信息,剩余realUid数量：${remainLength}` }
                            throw new Error(`请更新cookie以爬取私密信息,剩余realUid数量：${remainLength}`)
                        }
                        rs['realUid'] = realUid
                        detailModel.insertMany([rs], function (err, data) {
                            // 更新列表的状态
                            AllGirlModel.findOneAndUpdate({ realUid }, { $set: { status: true, finishTime: new Date() } }).exec()
                            remainLength--
                            // 进度事件
                            // G.DetailStatusRate = { 'text': `传送时间:${new Date()}--end-realUid:${realUid},usedtime:${(new Date().getTime() - cur) / 1000}seconds,remain-realUid-count：${remainLength}`, 'percent': ((Length - remainLength) / Length) * 100 }
                            cb(null, ' ') // 代表这个函数结束，传递出去
                        })

                    }
                }).catch(err => {
                    console.log(err)
                    cb(null, ' ')
                })
            }, async (err, data) => {
                console.log(`所有任务完成：${data}`)
            })

        } catch (err) {
            console.log(err)
            // 发送邮件 报错
            // res.send({
            //   status: 400,
            //   message: `爬取失败,失败原因:${err}`
            // })
        }
    }
}

export default new Spider()
