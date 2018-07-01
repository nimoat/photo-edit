const app = getApp()

Page({
  data: {
    page:'',
    imageNotChoosed:false,
    imgViewHeight:0,
    longImageSrcs:[],
    totalHeight:0,
    whichDeleteShow:99999,
    // delteBoxY:0,
    frameSrcs: [{ src: 'frame1.png', title: '文艺小清新' }, { src: 'frame2.png', title: 'Happy Birthday' }, { src: 'frame3.png', title: '素描花环' }, { src: 'frame4.png', title: '文艺小清新' }, { src: 'frame5.png', title: '卡通小屋' }, { src: 'frame6.png', title: '爱心相框' }, { src: 'frame7.png', title: '心形云朵' }, { src: 'frame8.png', title: '爱心花环' }, { src: 'frame9.png', title: '拍立得相框' }, { src: 'frame10.png', title: '文艺小清新' }, { src: 'frame11.png', title: '贴纸' }],
    frameSrc:'',
    isFrameChoose:false,
    photoSrc:'',
    frameHeight:0,
    minScale: 0.5,
    maxScale: 2,
    photoWidth:0,
    photoHeight:0,
    photoLeft:0,
    photoTop:0,
    readuSave:false
  },
  onLoad: function (option) {
    this.device = app.globalData.myDevice
    this.deviceRatio = this.device.windowWidth / 750
    this.setData({
      page: option.choosed,
      longImageSrcs:[],
      imgViewHeight: this.device.windowHeight - 160 * this.deviceRatio
    })
    if (option.choosed === 'longImages'){
      this.addImages()
    }
  },
  addImages(){
    var self=this
    wx.chooseImage({
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        var longImageSrcs = self.data.longImageSrcs
        longImageSrcs = longImageSrcs.concat(res.tempFilePaths)
        self.setData({
          imageNotChoosed: false,
          longImageSrcs: longImageSrcs,
          readuSave:true
        })
      },
      fail: function (res) {
        self.setData({
          imageNotChoosed: true
        })
      }
    })
  },
  gotoDelete(e){
    this.longTap=true
    this.deleteId = e.target.dataset.idx
    this.setData({
      whichDeleteShow: this.deleteId,
    })
  },
  deleteImg(){
    var longImageSrcs = this.data.longImageSrcs
    longImageSrcs.splice(this.deleteId,1)
    this.setData({
      longImageSrcs: longImageSrcs,
      whichDeleteShow: 99999,
    })
  },
  quitDelete(){
    if (this.longTap){ //禁用了longTap伴随的tap事件
      this.longTap=false
    }else{
      this.setData({
        whichDeleteShow: 99999
      })
    }
  },
  //拼相框窗口
  addFrame(){
    var self=this
    this.setData({
      isFrameChoose: true
    })
  },
  chooseFrame(e){
    var self=this
    wx.getImageInfo({
      src: '../../image/frame/'+e.currentTarget.dataset.src,
      success: function (res) {
        var initRatio = res.width / (750 * self.deviceRatio) //保证宽度全显
        //图片显示大小
        self.frameWidth = (res.width / initRatio) //100%
        self.frameHeight = (res.height / initRatio)
        self.setData({
          frameHeight: self.frameHeight,
          isFrameChoose: false,
          frameSrc: '../../image/frame/' + e.currentTarget.dataset.src,
          readuSave: true
        })
      }
    })
  },
  closeFrameChoose(){
    this.setData({
      isFrameChoose: false
    })
  },
  addPhoto(){
    var self = this
    wx.chooseImage({
      count: 1,
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        self.setData({
          // imageNotChoosed: false,
          photoSrc: res.tempFilePaths[0],
        })
        wx.getImageInfo({
          src: res.tempFilePaths[0],
          success: function (re) {
            self.frameHeight = self.frameHeight ? self.frameHeight : 1000 * self.deviceRatio
            self.initRatio = re.height / self.frameHeight  //转换为了px 图片原始大小/显示大小
            if (self.initRatio < re.width / (750 * self.deviceRatio)) {
              self.initRatio = re.width / (750 * self.deviceRatio)
            }
            //图片显示大小
            self.scaleWidth = (re.width / self.initRatio) //100%
            self.scaleHeight = (re.height / self.initRatio)
            self.startX = 750 * self.deviceRatio / 2 - self.scaleWidth / 2;
            self.startY = self.frameHeight / 2 - self.scaleHeight / 2;
            self.oldScale=1
            self.initScaleWidth = self.scaleWidth
            self.initScaleHeight = self.scaleHeight
            self.setData({
              photoWidth: self.scaleWidth,
              photoHeight: self.scaleHeight,
              photoTop: self.startY,
              photoLeft: self.startX,
              readuSave: true,
              frameHeight: self.frameHeight,
            })
          }
        })
      },
      fail: function (res) {
        self.setData({
          imageNotChoosed: true
        })
      }
    })
  },
  uploadScaleStart(e) {
    let self = this
    let xDistance, yDistance
    let [touch0, touch1] = e.touches
    //self.touchNum = 0 //初始化，用于控制旋转结束时，旋转动作只执行一次

    //计算第一个触摸点的位置，并参照该点进行缩放
    self.touchX = touch0.clientX
    self.touchY = touch0.clientY
    //每次触摸开始时图片左上角坐标
    self.imgLeft = self.startX
    self.imgTop = self.startY

    // 两指手势触发
    if (e.touches.length >= 2) { 
      var frameHeight = self.frameHeight ? self.frameHeight : 1000 * self.deviceRatio  
      self.initLeft = (self.deviceRatio * 750 / 2 - self.imgLeft) / self.oldScale
      self.initTop = (frameHeight / 2 - self.imgTop) / self.oldScale
      //计算两指距离
      xDistance = touch1.clientX - touch0.clientX
      yDistance = touch1.clientY - touch0.clientY
      self.oldDistance = Math.sqrt(xDistance * xDistance + yDistance * yDistance)
    }
  },

  uploadScaleMove(e) {
    drawOnTouchMove(this, e)
  },

  uploadScaleEnd(e) {
    let self = this
    self.oldScale = self.newScale || self.oldScale
    self.startX = self.imgLeft || self.startX
    self.startY = self.imgTop || self.startY
  },
  saveImgToPhone(){
    var self = this
    if (self.data.longImageSrcs || self.data.frameSrc){
      wx.showLoading({
        title: '保存中',
        mask: true,
      })
    }
    if (self.data.page === 'longImages'){
      var pro = new Promise((resolve, reject) => {
        drawImagesOnTempCanvas(self, resolve)
      })
      pro.then(function (value) {
        wx.canvasToTempFilePath({
          canvasId: 'tempCanvas',
          success: function (res) {
            console.log(res.tempFilePath)
            wx.previewImage({
              urls: [res.tempFilePath] // 需要预览的图片http链接列表
            })
            // wx.saveImageToPhotosAlbum({
            //   filePath: res.tempFilePath
            // })
            wx.hideLoading()
          }
        })
      })
    } else if (self.data.page === 'photoFrame'){
      var frameHeight = self.frameHeight ? self.frameHeight : 1000 * self.deviceRatio  
      self.setData({
        totalHeight: frameHeight
      })
      var tempCtx = wx.createCanvasContext('tempCanvas')
      //照片显示大小
      var sX = Math.max(-self.data.photoLeft * self.initRatio / self.oldScale, 0)
      var sY = Math.max(-self.data.photoTop * self.initRatio / self.oldScale, 0)
      var sW = (self.device.windowWidth)* self.initRatio / self.oldScale
      var sH = (frameHeight) * self.initRatio / self.oldScale

      //canvas显示大小
      var canvasW = self.device.windowWidth
      var canvasH = frameHeight
      var canvasX = Math.max(self.data.photoLeft,0);
      var canvasY = Math.max(self.data.photoTop,0);

      //先画照片
      tempCtx.drawImage(self.data.photoSrc, sX, sY, sW, sH, canvasX, canvasY, canvasW, canvasH)
      //再画相框
      tempCtx.drawImage(self.data.frameSrc, 0, 0, canvasW, canvasH)
      tempCtx.draw()
      setTimeout(function(){
        wx.canvasToTempFilePath({
          canvasId: 'tempCanvas',
          success: function (res) {
            console.log(res.tempFilePath)
            wx.previewImage({
              urls: [res.tempFilePath] // 需要预览的图片http链接列表
            })
            // wx.saveImageToPhotosAlbum({
            //   filePath: res.tempFilePath
            // })
            wx.hideLoading();
          }
        })
      },100)
    }
  }
})
function drawImagesOnTempCanvas(self,fn){
  self.setData({
    totalHeight: 0
  })
  var tempCtx = wx.createCanvasContext('tempCanvas')
  getImageInfo(self, tempCtx, 0, fn)
}
function getImageInfo(self, tempCtx, i, fn){
  if (i < self.data.longImageSrcs.length){
    wx.getImageInfo({
      src: self.data.longImageSrcs[i],
      success: function (res) {
        var initRatio = res.width / (750 * self.deviceRatio) // 宽度全显 图片原始大小/显示大小
        //图片显示大小
        var scaleWidth = (res.width / initRatio) //100%
        var scaleHeight = (res.height / initRatio)
        var startX = 0;
        var startY = self.data.totalHeight;
        var totalHeight = self.data.totalHeight + scaleHeight
        self.setData({
          totalHeight: totalHeight
        })
        tempCtx.drawImage(self.data.longImageSrcs[i], startX, startY, scaleWidth, scaleHeight)
        tempCtx.draw(true)
        getImageInfo(self, tempCtx, i + 1, fn)
      }
    })
  }else{
    setTimeout(fn,500)
  }
}
function drawOnTouchMove(self, e) {
  let { minScale, maxScale } = self.data
  let [touch0, touch1] = e.touches
  let xMove, yMove, newDistance, xDistance, yDistance

  // 单指手势时触发
  if (e.touches.length === 1) {
    //计算单指移动的距离
    xMove = touch0.clientX - self.touchX
    yMove = touch0.clientY - self.touchY
    //转换移动距离到正确的坐标系下
    self.imgLeft = self.startX + xMove
    self.imgTop = self.startY + yMove
    self.setData({
      photoTop: self.imgTop,
      photoLeft: self.imgLeft
    })
  }
  // 两指手势触发
  if (e.touches.length >= 2) {
    var frameHeight = self.frameHeight ? self.frameHeight : 1000 * self.deviceRatio  
    // 计算二指最新距离
    xDistance = touch1.clientX - touch0.clientX
    yDistance = touch1.clientY - touch0.clientY
    newDistance = Math.sqrt(xDistance * xDistance + yDistance * yDistance)
    //  使用0.005的缩放倍数具有良好的缩放体验
    self.newScale = self.oldScale + 0.005 * (newDistance - self.oldDistance)

    //  设定缩放范围
    self.newScale <= minScale && (self.newScale = minScale)
    self.newScale >= maxScale && (self.newScale = maxScale)

    self.scaleWidth = self.newScale * self.initScaleWidth
    self.scaleHeight = self.newScale * self.initScaleHeight

    self.imgLeft = self.deviceRatio * 750 / 2 - self.newScale * self.initLeft
    self.imgTop = frameHeight / 2 - self.newScale * self.initTop
    self.setData({
      photoTop: self.imgTop,
      photoLeft: self.imgLeft,
      photoWidth: self.scaleWidth,
      photoHeight: self.scaleHeight
    })
  }
}