// pages/home/childCmps/w-card-category/w-card-category.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    categories:{
      type:Array,
      value:[]
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    cardClick(event){
      const index = event.target.dataset.index;

      wx.navigateTo({
        url: '/pages/cardlist/cardlist?type='+index,
      })
    }
  }
})
