// pages/home/home.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    categories:[
      {title:"身份证",icon:"/assets/zhengjian.png"},
      {title:"银行卡",icon:"/assets/yhk.png"}
    ],
  },
  addClick:function(event){
    const type = event.detail.value;
    wx.navigateTo({
      url: `/pages/recognize/recognize?type=${type}`,
    })
  }
  
})