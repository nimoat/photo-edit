const app = getApp()
Page({
  data: {
    imgUrl: app.globalData.imgUrl
  },
  onLoad: function () {
    // this.setData({
    //   imgUrl: app.globalData.imgUrl
    // })
  },
  chooseFromAlbum(){
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        var tempFilePath = res.tempFilePaths[0]
        wx.navigateTo({
          url: '../emotionEdit/emotionEdit?choosedEmoUrl=' + tempFilePath
        })
      }
    })
  },
  chooseEmotion(e){
    var choosedEmoUrl = this.data.imgUrl[e.currentTarget.dataset.idx]
    wx.downloadFile({
      url: choosedEmoUrl, //仅为示例，并非真实的资源
      success: function (res) {
        wx.navigateTo({
          url: '../emotionEdit/emotionEdit?choosedEmoUrl=' + res.tempFilePath
        })
      }
    })
  }
})
