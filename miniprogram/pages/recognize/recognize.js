// miniprogram/pages/recognize/recognize.js
// 抽取 要操作的集合
const idCollection = wx.cloud.database().collection('idcards');
const bankCollection = wx.cloud.database().collection('bankcards');


Page({
  /**
   * 页面的初始数据
   */
  data: {
    type:0,
    categories:["身份证","银行卡"],
    idInfo:null,
    bankInfo:null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  this.setData({type : options.type})    
  },



  // 点击选择照片
  selectClick:function(){
    wx.chooseImage({
      count: 1,
    }).then(res=>{
      // 获取选择图片的路径
      const filePath = res.tempFilePaths[0]

      // 上传至云存储中
      this.uploadFileToCloud(filePath)

      wx.showLoading({
        title: `${ this.data.categories[this.data.type] }识别中`,
      })
      
    })
  },

  // 上传照片至云存储
  uploadFileToCloud:function(filePath){

    // 生成时间戳
    const timeStamp = new Date().getTime();

    wx.cloud.uploadFile({
      filePath,
      cloudPath:`openId_${timeStamp}.jpg`
    }).then(res=>{
        const fileID = res.fileID;
        // 根据fileID换取临时URL
        this.getTempUrl(fileID)
    })
  },

  // 根据fileID换取临时URL
  getTempUrl:function(fileID){
    wx.cloud.getTempFileURL({
      fileList:[fileID]
    }).then(res =>{
      const tempUrl = res.fileList[0].tempFileURL;
      
      // 识别URL
      this.recognizeImageUrl(tempUrl,fileID)
      
    })
  },

  // 识别URL
  recognizeImageUrl:function(tempUrl,fileID){
    wx.cloud.callFunction({
      name:"recognizeCard",
      data:{
        tempUrl,
        type:this.data.type
      }
    }).then(res=>{
      // 判断返回的type
      this.data.type == 0?this.handleIdInfo(res,fileID):this.handleBankInfo(res,fileID)
      wx.hideLoading()
    })
  },
  // 身份证识别
  handleIdInfo:function(res,fileID){
      // 若无识别信息
      if(!res.result.id ) {
        wx.showToast({
          icon:"error",
          title: '卡证识别失败'
        })
        this.deletePhoto(fileID)
        return
      }

    // 获取识别到的用户信息并保存
    const idInfo = {
      name:res.result.name,
      sex:res.result.sex,
      nation:res.result.nation,
      birth:res.result.birth,
      address:res.result.address,
      id:res.result.id,
      // 保存fileID便于处理相对应的信息
      fileID
    }
    // 展示信息
    this.setData({
      idInfo
    })
  },

  // 银行卡识别
  handleBankInfo:function(res,fileID){
    console.log(res);
    
    const bankInfo = {
      id:res.result[0].itemstring,
      type:res.result[1].itemstring,
      name:res.result[2].itemstring,
      message:res.result[3].itemstring,
      validity:res.result[4]?res.result[4].itemstring:"无信息",
      fileID
    }
    
    this.setData({bankInfo})
  },

  // 点击保存信息
  saveClick:function(){
    const flag =  this.data.idInfo || this.data.bankInfo ;
    if(!flag){
      wx.showToast({
        icon:"none",
        title: '无信息可保存',
      })
    }else{
      this.data.type == 0?this.saveIdInfo():this.saveBankInfo()
    }
  },

  // 判断信息去重
  saveIdInfo:function(){
    // 保存信息前查询信息是否已存在
    idCollection.where({
      id:this.data.idInfo.id
    }).get().then(res=>{
      // 对查询结果进行判断
      if(res.data.length > 0){
        const id = res.data[0].id
      const fileID = res.data[0].fileID;
        // 覆盖用户信息
        this.setInfo(id)
        this.deletePhoto(fileID)
      }else{
        this.saveInfo()
      }
    })
  },
  // 覆盖用户信息
  setInfo:function(id){
    idCollection.doc(id).set({
      data:this.data.idInfo
    }).then(res=>{
      wx.showToast({
        title: '保存信息完成',
      })
    })
  },
  // 保存身份证信息
  saveInfo:function(){
    idCollection.add({
      // 传入数据
      data:this.data.idInfo 
    }).then(res=>{
      wx.showToast({
        title: '保存信息完成',
      })
    })
  },
  // 删除云存储中的图片
  deletePhoto:function(fileID){
    wx.cloud.deleteFile({
      fileList:[fileID]
    })
  },

  // 保存银行卡信息
  saveBankInfo:function(){
    // 判断存储信息是否存在
    bankCollection.where({
      id:this.data.bankInfo.id
    }).get().then(res=>{
      console.log(res);
      
      if(res.data.length>0){
        const id = res.data[0].id;
        const fileID = res.data[0].fileID;
        this.setBankInfo(id)
        this.deletePhoto(fileID)
      }else{
        this.saveBank()
      }
    })

  },
  // 保存银行卡用户信息
  saveBank:function(){
    bankCollection.add({
      data:this.data.bankInfo
    }).then(res=>{
      wx.showToast({
        title: '信息保存完成',
      })
    })
  },
  // 覆盖银行卡信息
  setBankInfo:function(id){
    bankCollection.doc(id).set({
      data:this.data.bankInfo
    }).then(res=>{
      wx.showToast({
        title: '信息保存完成',
      })
    })
  },

  // 复制证件信息
  copyClick:function(){
   const flag =  this.data.idInfo || this.data.bankInfo ;
   if(!flag){
     wx.showToast({
       icon:"none",
       title: '无信息可复制',
     })
   }else{
    wx.setClipboardData({
        data: this.data.idInfo?this.data.idInfo.id:this.data.bankInfo.id,
      })
   }
  },
})

