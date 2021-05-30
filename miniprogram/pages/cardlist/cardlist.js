// pages/cardlist/cardlist.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    type:0,
    list:[],
    title:["身份证","银行卡"],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // console.log(options.type);
    this.setData({type : options.type})
    this.queryDataFromDB(this.data.type)
  },

  // 数据库中查询数据
  queryDataFromDB:function(type){
   const cards = type == 0 ? "idcards" :"bankcards"
   wx.cloud.database().collection(cards).get().then(res=>{
    this.setData({
      list:[...res.data]
    })
    console.log(this.data.list);
  })

  },
  // 点击复制信息
  copyClick:function(event){
    const index = event.target.dataset.index
    wx.setClipboardData({
      data: this.data.list[index].id,
    })
  },
  // 点击删除信息
  delClick:function(event){
    const index = event.target.dataset.index
    const cards = this.data.type == 0 ? "idcards" :"bankcards"
    const _id = this.data.list[index]._id;

    const fileID = this.data.list[index].fileID
    console.log(fileID)
    // 删除数据库
    wx.cloud.database().collection(cards).doc(_id).remove().then(res=>{
        // 清空list
    this.data.list = []
    this.queryDataFromDB(this.data.type)
      wx.showToast({
        title: '信息删除成功',
      })
    })

    // 删除云存储
    wx.cloud.deleteFile({
      fileList:[fileID]
    }).then(res=>{
      console.log(res)
    })
  

    
  }
})