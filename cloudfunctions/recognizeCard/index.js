// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const { ImageClient } = require('image-node-sdk');

// 云函数入口函数
exports.main = async (event, context) => {
let AppId = '1305829310'; // 腾讯云 AppId
let SecretId = 'AKIDHPRK1RDFMxb76us0HvLLK3aCj3ENNUeZ'; // 腾讯云 SecretId
let SecretKey = 'pRqz1IsEYmLm4Ai4IUuHUUGqBIE1PZYL'; // 腾讯云 SecretKey

let idCardImageUrl = event.tempUrl;
let type = event.type;
let imgClient = new ImageClient({ AppId, SecretId, SecretKey });
 if(type == 0){
    const result = await imgClient.ocrIdCard({
        data: {
            url_list: [idCardImageUrl]
        }
    })
        return JSON.parse(result.body).result_list[0].data;
 }else{
    const result = await imgClient.ocrBankCard({
        data: {
            url: idCardImageUrl
        }
    })
        return JSON.parse(result.body).data.items;
 }
}