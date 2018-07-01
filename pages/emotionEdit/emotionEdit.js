const app = getApp()
Page({
  data: {
    emotionUrl: '',
    allText: [],
    isTextEdit: false,
    isChooseFontSize: false,
    isChooseFontColor: false,
    isChooseFontPattern: false,
    inputFocus: false,
    texted:false,
    allColor: ['#000000', '#7f7f7f', '#880015', '#ed1c24', '#ff7f27', '#fff200', '#22b14c', '#00a2e8', '#ffaec9', '#a349a4', '#ffffff', '#c3c3c3'],
    tempImageSrc: ''
  },
  onLoad: function (option) {
    this.device = app.globalData.myDevice
    this.deviceRatio = this.device.windowWidth / 750

    console.log(option.choosedEmoUrl)
    this.setData({
      emotionUrl: option.choosedEmoUrl
    })
  },
  chooseaddText() {
    var allText = this.data.allText
    allText.push({
      idx: allText.length - 1,
      someText: "点击输入文字",
      fontColor: this.fontColor ? this.fontColor : 'rgba(20,20,20,0.8)',
      fontSize: this.fontSize ? this.fontSize : 14,
      fontStyle: 'normal',
      fontWeight: 'normal',
      textL: 285*this.deviceRatio,   //rpx
      textT: 420*this.deviceRatio,
      isTextActive: true,
    })
    this.setData({
      isTextEdit:true,
      allText: allText,
      isChooseFontSize: false,
      isChooseFontColor: false,
      isChooseFontPattern: false
    })
  },
  focusInput() {
    this.setData({
      inputFocus: !this.data.inputFocus,
    })
  },
  inputText(e) {
    var allText = this.data.allText
    allText[allText.length - 1].someText = e.detail.value
    if (allText[allText.length - 1].someText.length == 0) {
      allText[allText.length - 1].someText = "点击输入文字"
    }
    this.setData({
      allText: allText
    })
  },
  textMoveStart(e) {
    this.textX = e.touches[0].clientX
    this.textY = e.touches[0].clientY
  },
  textMove(e) {
    var allText = this.data.allText
    var dragLengthX = (e.touches[0].clientX - this.textX)
    var dragLengthY = (e.touches[0].clientY - this.textY)
    var minTextL = 0
    var minTextT = 0
    var maxTextL = 750 * this.deviceRatio-50
    var maxTextT = 1000 * this.deviceRatio-50
    var newTextL = allText[allText.length - 1].textL + dragLengthX
    var newTextT = allText[allText.length - 1].textT + dragLengthY
    if (newTextL < minTextL) newTextL = minTextL
    if (newTextL > maxTextL) newTextL = maxTextL
    if (newTextT < minTextT) newTextT = minTextT
    if (newTextT > maxTextT) newTextT = maxTextT

    allText[allText.length - 1].textL = newTextL
    allText[allText.length - 1].textT = newTextT
    this.setData({
      allText: allText,
      isChooseFontSize: false,
      isChooseFontColor: false,
      isChooseFontPattern: false
    })
    this.textX = e.touches[0].clientX
    this.textY = e.touches[0].clientY
  },
  chooseFontsize() {
    this.setData({
      isChooseFontSize: !this.data.isChooseFontSize,
      isChooseFontColor: false,
      isChooseFontPattern: false
    })
  },
  fontsizeSliderChange(e) {
    this.fontSize = e.detail.value
    var allText = this.data.allText
    if (allText[allText.length - 1] && (allText[allText.length - 1].isTextActive)) {
      allText[allText.length - 1].fontSize = this.fontSize
      this.setData({
        allText: allText
      })
    }
    // this.setData({
    //   isEraser: false
    // })
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
    if (allText[allText.length - 1] && (allText[allText.length - 1].isTextActive)) {
      allText[allText.length - 1].fontColor = this.fontColor
      this.setData({
        allText: allText
      })
    }
  },
  chooseFontPattern() {
    this.setData({
      isChooseFontSize: false,
      isChooseFontColor: false,
      isChooseFontPattern: !this.data.isChooseFontPattern
    })
  },
  fontStyleChange(e) {
    this.fontStyle = e.detail.value ? 'oblique' : 'normal'
    var allText = this.data.allText
    if (allText[allText.length - 1] && (allText[allText.length - 1].isTextActive)) {
      allText[allText.length - 1].fontStyle = this.fontStyle
      this.setData({
        allText: allText
      })
    }
  },
  fontWeightChange(e) {
    this.fontWeight = e.detail.value ? 'bold' : 'normal'
    var allText = this.data.allText
    if (allText[allText.length - 1] && (allText[allText.length - 1].isTextActive)) {
      allText[allText.length - 1].fontWeight = this.fontWeight
      this.setData({
        allText: allText
      })
    }
  },
  cancelAddText() {
    var allText = this.data.allText
    allText.pop()
    this.setData({
      allText: allText,
      isTextEdit: false,
      inputFocus: false,
      isChooseFontSize: false,
      isChooseFontColor: false,
      isChooseFontPattern: false
    })
  },
  competeAddText() {
    var self = this
    var allText = this.data.allText
    if (allText[allText.length - 1].someText == "点击输入文字" || allText[allText.length - 1].someText == "") {
      this.cancelAddText()
    } else {
      allText[allText.length - 1].isTextActive = false
      this.setData({
        allText: allText,
        isTextEdit: false,
        inputFocus: false,
        isChooseFontSize: false,
        isChooseFontColor: false,
        isChooseFontPattern: false,
        texted: true
      })
      var ctx = wx.createCanvasContext('tempCanvas')

      ctx.drawImage(self.data.tempImageSrc ? self.data.tempImageSrc : self.data.emotionUrl, 0, 0, 400 * self.deviceRatio, 400 * self.deviceRatio)

      ctx.setFillStyle(allText[allText.length - 1].fontColor)
      // ctx.font = "oblique bold 30px sans-serif"
      ctx.font = allText[allText.length - 1].fontStyle + ' ' + allText[allText.length - 1].fontWeight + ' ' + allText[allText.length - 1].fontSize + 'px sans-serif'
      ctx.setTextAlign('left')
      ctx.setTextBaseline('top')
      ctx.fillText(allText[allText.length - 1].someText, allText[allText.length - 1].textL - (740-400)/2* self.deviceRatio, allText[allText.length - 1].textT - 90 * self.deviceRatio)
      ctx.draw(true)
      //保存图片到临时路径
      saveImgUseTempCanvas(self, 200)
    }
  },
  saveImgToPhone(){
    wx.previewImage({
      urls: [this.data.tempImageSrc ? this.data.tempImageSrc : this.data.emotionUrl] // 需要预览的图片http链接列表
    })
  }
})

function saveImgUseTempCanvas(self, delay) {
  setTimeout(function () {
    wx.canvasToTempFilePath({
      x: 0,
      y: 0,
      width: 400 * self.deviceRatio,
      height: 400 * self.deviceRatio,
      canvasId: 'tempCanvas',
      success: function (res) {
        wx.hideLoading();
        console.log(res.tempFilePath)
        self.setData({
          tempImageSrc: res.tempFilePath
        })
      }
    })
  }, delay)
}