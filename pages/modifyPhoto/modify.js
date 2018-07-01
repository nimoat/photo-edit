const app = getApp()
Page({
  data: {
    tempCanvasWidth:0,
    tempCanvasHeight:0,
    imgViewHeight:0,
    page:'mainPage',
    imageNotChoosed:true,
    minScale: 0.5,
    maxScale: 2.5,
    doodleImageSrc:'',
    tempImageSrc:'',
    originImageSrc:'',
    imgWidth:0,
    imgHeight:0,
    imgTop:0,
    imgLeft:0,
    isCroper:false,
    // 裁剪框 宽高
    cutW: 0,
    cutH: 0,
    cutL: 0,
    cutT: 0,
    //涂鸦窗口
    canvasHeight: 0,   //canvas动态高度，单位rpx
    isChooseWidth:false,
    isChooseColor:false,
    // isChooseBack:false,
    isEraser:false,
    allColor: ['#000000', '#7f7f7f', '#880015', '#ed1c24', '#ff7f27', '#fff200', '#22b14c', '#00a2e8','#ffaec9','#a349a4','#ffffff','#c3c3c3'],
    //添加文字
    isChooseFontSize: false,
    isChooseFontColor: false,
    isChooseFontPattern: false,
    allText:{},
    // texted:false,
    inputFocus:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    var self = this
    // self.device = wx.getSystemInfoSync()
    self.device = app.globalData.myDevice
    self.deviceRatio = self.device.windowWidth / 750
    self.imgViewHeight = self.device.windowHeight - 160 * self.deviceRatio
    self.setData({
      imgViewHeight: self.imgViewHeight,
      // tempCanvasHeight: self.imgViewHeight,
      page: 'mainPage'
    })
    chooseImage(self)
  },
  chooseOneImage(){
    chooseImage(this)
  },
  toMainPage(){
    loadImgOnImage(this)
    this.setData({
      page:'mainPage'
    })
  },
  toCropPage(){
    var self=this
    loadImgOnImage(self)
    self.setData({
      page: 'cropPage',
      allText:{}
    })
  },
  bestShow(){
    loadImgOnImage(this)
  },
  uploadScaleStart(e) { //缩放图片
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
      self.initLeft = (self.deviceRatio * 750 / 2 - self.imgLeft) / self.oldScale
      self.initTop = (self.imgViewHeight / 2 - self.imgTop) / self.oldScale
      //计算两指距离
      xDistance = touch1.clientX - touch0.clientX
      yDistance = touch1.clientY - touch0.clientY
      self.oldDistance = Math.sqrt(xDistance * xDistance + yDistance * yDistance)
    }
  },

  uploadScaleMove(e) {
    fn(this, e)
  },

  uploadScaleEnd(e) {
    let self = this
    self.oldScale = self.newScale || self.oldScale
    self.startX = self.imgLeft || self.startX
    self.startY = self.imgTop || self.startY
  },
  croperStart(e){
    this.croperX = e.touches[0].clientX
    this.croperY = e.touches[0].clientY
  },
  croperMove(e){
    var self = this
    var dragLengthX = (e.touches[0].clientX-self.croperX)
    var dragLengthY = (e.touches[0].clientY-self.croperY)
    var minCutL = Math.max(0,self.data.imgLeft)
    var minCutT = Math.max(0, self.data.imgTop)
    var maxCutL = Math.min(750 * self.deviceRatio - self.data.cutW, self.data.imgLeft + self.data.imgWidth - self.data.cutW)
    var maxCutT = Math.min(self.imgViewHeight - self.data.cutH, self.data.imgTop + self.data.imgHeight - self.data.cutH)
    var newCutL = self.data.cutL + dragLengthX
    var newCutT = self.data.cutT + dragLengthY
    if (newCutL < minCutL) newCutL = minCutL
    if (newCutL > maxCutL) newCutL = maxCutL
    if (newCutT < minCutT) newCutT = minCutT
    if (newCutT > maxCutT) newCutT = maxCutT
    this.setData({
      cutL: newCutL,
      cutT: newCutT,
    })
    self.croperX = e.touches[0].clientX
    self.croperY = e.touches[0].clientY
  },
  dragPointStart(e){
    var self = this
    self.dragStartX = e.touches[0].clientX
    self.dragStartY = e.touches[0].clientY
    self.initDragCutW = self.data.cutW
    self.initDragCutH = self.data.cutH
  },
  dragPointMove(e){
    var self = this
    var maxDragX = Math.min(750 * self.deviceRatio, self.data.imgLeft + self.data.imgWidth)
    var maxDragY = Math.min(self.imgViewHeight, self.data.imgTop + self.data.imgHeight)
    var dragMoveX = Math.min(e.touches[0].clientX , maxDragX),
      dragMoveY = Math.min(e.touches[0].clientY, maxDragY);
    var dragLengthX = dragMoveX - self.dragStartX
    var dragLengthY = dragMoveY - self.dragStartY
    if (dragLengthX + self.initDragCutW >= 0 && dragLengthY + self.initDragCutH>=0){
      self.setData({
        cutW: self.initDragCutW + dragLengthX,
        cutH: self.initDragCutH + dragLengthY
      })
    } else {
      return
    }
  },
  openCroper(){
    var minCutL = Math.max(0, this.data.imgLeft)
    var minCutT = Math.max(0, this.data.imgTop)
    this.setData({
      isCroper:true,
      cutW: 150,
      cutH: 100,
      cutL: minCutL,
      cutT: minCutT
    })
  },
  competeCrop(){
    var self=this
    wx.showLoading({
      title: '截取中',
      mask: true,
    })
    //图片截取大小
    var sX = (self.data.cutL - self.data.imgLeft) * self.initRatio / self.oldScale
    var sY = (self.data.cutT - self.data.imgTop) * self.initRatio / self.oldScale
    var sW = self.data.cutW * self.initRatio /self.oldScale
    var sH = self.data.cutH * self.initRatio / self.oldScale
    self.setData({
      isCroper: false,
      tempCanvasWidth: sW,
      tempCanvasHeight: sH
    })

    //真机疑似bug解决方法
    if (sW < self.scaleWidth * self.initRatio/ self.oldScale / 2) {
      sW *= 2
      sH *= 2
    }
    var ctx = wx.createCanvasContext('tempCanvas')
    ctx.drawImage(self.data.tempImageSrc, sX, sY, sW, sH, 0, 0, sW, sH)
    ctx.draw()
    //保存图片到临时路径
    saveImgUseTempCanvas(self, 100, loadImgOnImage)
  },
  cancelCrop(){
    this.setData({
      isCroper: false
    })
  },
//涂鸦窗口
  toDoodlePage(){
    var self = this
    loadImgOnCanvas(self)
    self.setData({
      page:'doodlePage',
      canvasHeight: self.device.windowHeight - 160 * self.deviceRatio,
      allText: {}
    })
  },
  doodleStart: function (e) {
    var self = this
    self.lineWidth = self.lineWidth ? self.lineWidth:5
    self.lineColor = self.lineColor ? self.lineColor : '#000000'
    // 开始画图，隐藏所有的操作栏
    this.setData({
      isChooseWidth: false,
      isChooseColor: false,
      // isChooseBack: false,
      canvasHeight: self.device.windowHeight - 160 * self.deviceRatio
    })
    self.doodleStartX = e.touches[0].x - 750 / 2 * self.deviceRatio
    self.doodleStartY = e.touches[0].y - self.imgViewHeight / 2
  },

  doodleMove: function (e) {
    // 触摸移动，绘制中。。。
    var self=this
    self.doodled=true
    if (self.data.isEraser) {
      self.ctx.clearRect(e.touches[0].x - 750 / 2 * self.deviceRatio, e.touches[0].y - self.imgViewHeight / 2,30,30)
      self.ctx.draw(true);
      self.cleared=true
    } else {
      self.ctx.setStrokeStyle(self.lineColor);
      self.ctx.setLineWidth(self.lineWidth);
      self.ctx.setLineCap('round');
      self.ctx.setLineJoin('round');
      self.ctx.moveTo(self.doodleStartX, self.doodleStartY);
      self.ctx.lineTo(e.touches[0].x - 750 / 2 * self.deviceRatio, e.touches[0].y - self.imgViewHeight / 2);
      self.ctx.stroke();
      self.ctx.draw(true);
    }
    self.doodleStartX = e.touches[0].x - 750 / 2 * self.deviceRatio
    self.doodleStartY = e.touches[0].y - self.imgViewHeight / 2
  },
  chooseLineWidth(){
    this.setData({
      isChooseColor: false,
      isChooseWidth: true,
      isEraser: false,
      // isChooseBack: false,
      canvasHeight: (this.device.windowHeight-360*this.deviceRatio)
    })
  },
  widthSliderChange(e){
    this.lineWidth=e.detail.value
  },
  chooseLineColor(){
    this.setData({
      isChooseColor: true,
      isChooseWidth: false,
      // isChooseBack: false,
      canvasHeight: (this.device.windowHeight - 360 * this.deviceRatio),
      isEraser: false
    })
  },
  lineColorChange(e){
    this.lineColor = e.target.dataset.selected
  },

  chooseEraser(){
    // this.isClear=false
    this.setData({
      isEraser: !this.data.isEraser,
    })
  },
  chooseClear(){
    this.ctx.clearRect(-750 * this.deviceRatio / 2, -this.imgViewHeight / 2, 750 * this.deviceRatio, this.imgViewHeight);
    this.ctx.draw(true);
    this.setData({
      isEraser: false,
    })
    this.cleared = true
  },
  doodleToMainPage(){
    if(this.doodled){
      this.doodled=false
      wx.showLoading({
        title: '保存涂鸦',
        mask: true,
      })
      saveDoodle(this, loadImgOnImage)
      this.setData({
        page: 'mainPage'
      })
    }else{
      loadImgOnImage(this)
    }
    this.setData({
      page: 'mainPage'
    })
  },
  //添加文字
  toTextPage(){
    var self = this
    loadImgOnImage(self)
    self.setData({
      page:'textPage'
    })
  },
  focusInput(){
    this.setData({
      inputFocus: !this.data.inputFocus,
    })
  },
  inputText(e){
    var allText = this.data.allText
    allText.someText = e.detail.value
    if (allText.someText.length == 0) {
      allText.someText = "点击输入文字"
      }
    this.setData({
      allText: allText
    })
  },
  textMoveStart(e){
    this.textX = e.touches[0].clientX
    this.textY = e.touches[0].clientY
  },
  textMove(e){
    var allText = this.data.allText
    var dragLengthX = (e.touches[0].clientX - this.textX)
    var dragLengthY = (e.touches[0].clientY - this.textY)
    var minTextL = 0
    var minTextT = 0
    var maxTextL = (750 - 100) * this.deviceRatio
    var maxTextT = this.imgViewHeight - 40 * this.deviceRatio
    var newTextL = allText.textL + dragLengthX
    var newTextT = allText.textT + dragLengthY
    if (newTextL < minTextL) newTextL = minTextL
    if (newTextL > maxTextL) newTextL = maxTextL
    if (newTextT < minTextT) newTextT = minTextT
    if (newTextT > maxTextT) newTextT = maxTextT

    allText.textL = newTextL
    allText.textT = newTextT
    this.setData({
      allText: allText,
      isChooseFontSize: false,
      isChooseFontColor: false,
      isChooseFontPattern: false
    })
    this.textX = e.touches[0].clientX
    this.textY = e.touches[0].clientY
  },
  chooseaddText(){
    var allText={}
    allText={
      idx: allText.length - 1,
      someText: "点击输入文字",
      fontColor: this.fontColor ? this.fontColor:'rgba(20,20,20,0.8)',
      fontSize: this.fontSize ? this.fontSize:14,
      fontStyle: 'normal',
      fontWeight: 'normal',
      textL: (750 - 200) * this.deviceRatio / 2,
      textT: this.imgViewHeight / 2 - this.scaleHeight / 2 + 20,
      isTextActive: true,
    }
    this.setData({
      allText: allText,
      isChooseFontSize: false,
      isChooseFontColor: false,
      isChooseFontPattern: false
    })
  },
  cancelAddText(){
    var allText = this.data.allText
    allText.isTextActive = false
    this.setData({
      allText: allText,
      inputFocus:false,
      isChooseFontSize: false,
      isChooseFontColor: false,
      isChooseFontPattern: false
    })
  },
  competeAddText(){
    var self=this
    var allText = this.data.allText
    if (allText.someText == "点击输入文字" || allText.someText == ""){
      this.cancelAddText()
    }else{
      wx.showLoading({
        title: '保存文字',
        mask: true,
      })
      allText.isTextActive = false
      var initRatio = self.initRatio
      if (self.initRatio<1){ //解决问题：小图或者过度裁剪后的图添加文字时文字虚化
        initRatio=1
      }
      var tempCanvasWidth = self.scaleWidth * initRatio
      var tempCanvasHeight = self.scaleHeight * initRatio

      this.setData({
        allText: allText,
        inputFocus: false,
        isChooseFontSize: false,
        isChooseFontColor: false,
        isChooseFontPattern: false,
        tempCanvasWidth: tempCanvasWidth,
        tempCanvasHeight: tempCanvasHeight
      })

      var ctx = wx.createCanvasContext('tempCanvas')
      ctx.drawImage(self.data.tempImageSrc, 0, 0, tempCanvasWidth, tempCanvasHeight)
      ctx.setFillStyle(allText.fontColor)
      var canvasFontSize = Math.ceil(allText.fontSize * initRatio)
      ctx.font = allText.fontStyle + ' ' + allText.fontWeight + ' ' + canvasFontSize + 'px sans-serif'
      ctx.setTextAlign('left')
      ctx.setTextBaseline('top')
      ctx.fillText(allText.someText, (allText.textL - self.startX) * initRatio, (allText.textT - self.startY+5)* initRatio)
      ctx.draw()
      //保存图片到临时路径
      saveImgUseTempCanvas(self, 100, null)
    }
  },
  chooseFontsize(){
    this.setData({
      isChooseFontSize: !this.data.isChooseFontSize,
      isChooseFontColor: false,
      isChooseFontPattern: false
    })
  },
  fontsizeSliderChange(e) {
    this.fontSize = e.detail.value
    var allText = this.data.allText
    if (allText !=={}&& (allText.isTextActive)){
      allText.fontSize = this.fontSize
      this.setData({
        allText: allText
      })
    }
  },
  chooseFontColor() {
    this.setData({
      isChooseFontSize: false,
      isChooseFontColor: !this.data.isChooseFontColor,
      isChooseFontPattern: false
    })
  },
  fontColorChange(e) {
    this.fontColor = e.target.dataset.selected
    var allText = this.data.allText
    if (allText && (allText.isTextActive)) {
      allText.fontColor = this.fontColor
      this.setData({
        allText: allText
      })
    }
  },
  chooseFontPattern(){
    this.setData({
      isChooseFontSize: false,
      isChooseFontColor: false,
      isChooseFontPattern: !this.data.isChooseFontPattern
    })
  },
  fontStyleChange(e){
    this.fontStyle = e.detail.value ? 'oblique' : 'normal'
    var allText = this.data.allText
    if (allText!=={} && (allText.isTextActive)) {
      allText.fontStyle = this.fontStyle
      this.setData({
        allText: allText
      })
    }
  },
  fontWeightChange(e){
    this.fontWeight = e.detail.value ? 'bold' : 'normal'
    var allText = this.data.allText
    if (allText!=={} && (allText.isTextActive)) {
      allText.fontWeight = this.fontWeight
      this.setData({
        allText: allText
      })
    }
  },
  textToMainPage(){
    loadImgOnImage(this)
    this.setData({
      allText: [],
      page:'mainPage'
    })
  },
  //保存照片
  saveImgToPhone(){
    wx.previewImage({
      urls: [this.data.tempImageSrc], // 需要预览的图片http链接列表        
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
function chooseImage(self){
  wx.chooseImage({
    count: 1,
    // sizeType: ['original '], // 可以指定是原图还是压缩图，默认二者都有
    sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
    success: function (res) {
      var tempFilePaths = res.tempFilePaths
      self.setData({
        imageNotChoosed: false,
        tempImageSrc: tempFilePaths[0],
        originImageSrc: tempFilePaths[0],
      })
      loadImgOnImage(self)
    },
    fail: function (res) {
      self.setData({
        imageNotChoosed: true
      })
    }
  })
}
function loadImgOnImage(self){
  wx.getImageInfo({
    src: self.data.tempImageSrc,
    success: function (res) {
      self.oldScale = 1
      self.initRatio = res.height / self.imgViewHeight  //转换为了px 图片原始大小/显示大小
      if (self.initRatio < res.width / (750 * self.deviceRatio)) {
        self.initRatio = res.width / (750 * self.deviceRatio)
      }
      //图片显示大小
      self.scaleWidth = (res.width / self.initRatio)
      self.scaleHeight = (res.height / self.initRatio)

      self.initScaleWidth = self.scaleWidth
      self.initScaleHeight = self.scaleHeight
      self.startX = 750 * self.deviceRatio / 2 - self.scaleWidth / 2;
      self.startY = self.imgViewHeight / 2 - self.scaleHeight / 2;
      self.setData({
        imgWidth: self.scaleWidth,
        imgHeight: self.scaleHeight,
        imgTop: self.startY,
        imgLeft: self.startX
      })
      wx.hideLoading();
    }
  })
}
function loadImgOnCanvas(self){
  wx.getImageInfo({
    src: self.data.tempImageSrc,
    success: function (res) {
      self.initRatio = res.height / self.imgViewHeight  //转换为了px 图片原始大小/显示大小
      if (self.initRatio < res.width / (750 * self.deviceRatio)) {
        self.initRatio = res.width / (750 * self.deviceRatio)
      }
      //图片显示大小
      self.scaleWidth = (res.width / self.initRatio)
      self.scaleHeight = (res.height / self.initRatio)

      self.initScaleWidth = self.scaleWidth
      self.initScaleHeight = self.scaleHeight
      self.startX = -self.scaleWidth / 2;
      self.startY = -self.scaleHeight / 2;
      self.ctx = wx.createCanvasContext('myCanvas')
      self.ctx.translate((750 * self.deviceRatio) / 2, self.imgViewHeight/ 2) //原点移至中心，保证图片居中显示
      self.ctx.drawImage(self.data.tempImageSrc, self.startX, self.startY, self.scaleWidth, self.scaleHeight)
      self.ctx.draw()
    }
  })
}

function throttle(fn, miniTimeCell) {
  var timer = null,
    previous = null;

  return function () {
    var now = +new Date(),
      context = this,
      args = arguments;
    if (!previous) previous = now;
    var remaining = now - previous;
    if (miniTimeCell && remaining >= miniTimeCell) {
      fn.apply(context, args);
      previous = now;
    }
  }
}
const fn = throttle(drawOnTouchMove, 100)

function drawOnTouchMove(self, e) {
  let { minScale, maxScale } = self.data
  let [touch0, touch1] = e.touches
  let xMove, yMove, newDistance, xDistance, yDistance

  if (e.timeStamp - self.timeOneFinger < 100) {//touch时长过短，忽略
    return
  }

  // 单指手势时触发
  if (e.touches.length === 1) {
    //计算单指移动的距离
    xMove = touch0.clientX - self.touchX
    yMove = touch0.clientY - self.touchY
    //转换移动距离到正确的坐标系下
    self.imgLeft = self.startX + xMove
    self.imgTop = self.startY + yMove

    self.setData({
      imgTop: self.imgTop,
      imgLeft: self.imgLeft
    })
  }
  // 两指手势触发
  if (e.touches.length >= 2) {
    // self.timeMoveTwo = e.timeStamp
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

    self.imgLeft = self.deviceRatio*750 / 2 - self.newScale * self.initLeft
    self.imgTop = self.imgViewHeight / 2 - self.newScale *self.initTop
    self.setData({
      imgTop: self.imgTop,
      imgLeft: self.imgLeft,
      imgWidth: self.scaleWidth,
      imgHeight: self.scaleHeight
    })

  }
}

function saveImgUseTempCanvas(self, delay, fn){
  setTimeout(function () {
    wx.canvasToTempFilePath({
      x:0,
      y:0,
      width: self.data.tempCanvasWidth,
      height: self.data.tempCanvasHeight,
      destWidth: self.data.tempCanvasWidth,
      destHeight: self.data.tempCanvasHeight,
      fileType: 'png',
      quality: 1,
      canvasId: 'tempCanvas',
      success: function (res) {
        wx.hideLoading();
        console.log(res.tempFilePath)
        self.setData({
          tempImageSrc: res.tempFilePath
        })
        if(fn){
          fn(self) 
        }
      }
    })
  }, delay)
}
function saveDoodle(self,fn) {
    wx.canvasToTempFilePath({
      x: (750 * self.deviceRatio) / 2 + self.startX,
      y: self.imgViewHeight / 2 + self.startY,
      width: self.scaleWidth,
      height: self.scaleHeight,
      canvasId: 'myCanvas',
      success: function (res) {
        if(self.cleared){
          self.cleared=false
          self.setData({
            doodleImageSrc: res.tempFilePath,
            tempCanvasWidth: self.scaleWidth,
            tempCanvasHeight: self.scaleHeight
          })
          var ctx = wx.createCanvasContext('tempCanvas')
          ctx.drawImage(self.data.tempImageSrc, 0, 0, self.scaleWidth,self.scaleHeight)
          ctx.drawImage(self.data.doodleImageSrc, 0, 0, self.scaleWidth, self.scaleHeight)
          ctx.draw()
          saveImgUseTempCanvas(self, 100, fn)
        }else{
          self.setData({
            tempImageSrc: res.tempFilePath,
            originImageSrc: res.tempFilePath
          })
          fn(self)
        }
      }
    })
}