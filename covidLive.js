const changeBackground = false

const forcedWhitePhone = false
const forcedBlackPhone = true
const forcedWhitePad = false
const forcedBlackPad = false

const colorIncrease = '#F51673'
const colorDecrease = '#2B69F0'

const jsonURL = 'https://apiv2.corona-live.com/stats.json'

const isPad = Device.isPad()
const isDarkmode = Device.isUsingDarkAppearance()

const thisURL = URLScheme.forRunningScript()

let widget = new ListWidget()
let jsonData
let box, container


// Set background in phone.
let fileManager = FileManager.local()
const path = fileManager.joinPath(fileManager.documentsDirectory(), 'corona-background')

if(!fileManager.fileExists(path) || changeBackground) {
  let image = await Photos.fromLibrary()
  fileManager.writeImage(path, image)
}
widget.backgroundImage = fileManager.readImage(path)
 
// Refresh for every minute.
widget.refreshAfterDate = new Date(Date.now() +  1000*60*30)


// Create widget.
//if(!config.runsInWidget) {
  jsonData = await new Request(jsonURL).loadJSON()
  createWidget()
//}

widget.setPadding(0,0,0,0)
Script.setWidget(widget)
Script.complete()
widget.presentMedium()


function createWidget() {
  container = widget.addStack()
  container.layoutVertically()
  
  box = container.addStack()
  box.layoutHorizontally()
  
  setLeftWidget()
  box.addSpacer(100)
  setRightWidget()
  
  container.addSpacer(10)
  // buttons
  box = container.addStack()
  box.layoutHorizontally()
  
  setButtons()  
}

function setLeftWidget() {
  const dayArray = ['일', '월', '화', '수', '목', '금', '토']
  let year, month, date, day
  let stack, line, content
  
  // Date information
  stack = box.addStack()
  stack.layoutVertically()
  
  date = new Date()
  day = dayArray[date.getDay()] + '요일'
  year = String(date.getFullYear()).substring(2) + '년'
  month = date.getMonth() + 1 + '월'
  date = date.getDate() + ''
  
  content = stack.addText(year + ' ' + month)// + ' ' + day) // 년도 + 월 + 요일
  content.font = Font.caption1()  
  content.textColor = colorMatch()
  
  line = stack.addStack()
  line.centerAlignContent()
  content = line.addText(date + ' ') // 일
  content.font = Font.boldSystemFont(32)
  content.textColor = colorMatch()
  stack.addSpacer(4)


  content = stack.addText(day) // 요일
  content.font = Font.systemFont(16)
  content.textColor = colorMatch()
  stack.addSpacer(8)


  // Battery
  let battery = Device.batteryLevel()
  let image = getBatteryImage()
  line = stack.addStack()
  content = line.addImage(image)

  if(Device.isCharging()) {
    content.imageSize = new Size(25, 20) // resize battery icon
    content.tintColor = Color.green()
    line.addText(' ')
  } else {
    content.imageSize = new Size(35, 20) // resize battery icon
    if(Device.batteryLevel()*100 > 20) {
      content.tintColor = colorMatch()
    }
  }

  content = line.addText(Number(battery*100).toFixed(0) + '%')    
  content.font = Font.systemFont(16)
  content.textColor = colorMatch()  
}

function setRightWidget() {
  let stack, line, content
  let currentNum, currentGap, seoulNum, seoulGap
  let totalNum, yesterdayNum // Accumulated on yesterday-basis
  
  
  // Get covid data from 'covid-live.com'
  let overviewData = jsonData['overview']
  let seoulData = jsonData['current']['0']['cases']

  currentNum = comma(overviewData['current'][0])
  currentGap = overviewData['current'][1]
  totalNum = comma(overviewData['confirmed'][0])
  yesterdayNum = comma(overviewData['confirmed'][1])
  seoulNum = seoulData[0]
  seoulGap = seoulData[1]
  
  stack = box.addStack()
  stack.layoutVertically()
  
  
  // Current realtime patient
  content = stack.addText('현재')
  content.font = Font.caption2()
  content.textColor = colorMatch()
  
  // Whole country
  line = stack.addStack()
  line.centerAlignContent()
  
  content = line.addText(currentNum + '')
  content.font = Font.boldSystemFont(20)
  content.textColor = colorMatch()
  
  content = line.addText(' 명')
  content.font = Font.systemFont(20)
  content.textColor = colorMatch()

  if(currentGap > 0) {  // compare with yesterday's
    content = line.addText(' +' + currentGap)  
    content.textColor = new Color(colorIncrease) 
  } else {
    content = line.addText(' ' + currentGap)
    content.textColor = new Color(colorDecrease)
  }    
  content.font = Font.systemFont(14)
  
  // Seoul
  line = stack.addStack()
  line.centerAlignContent()
  
  content = line.addText(seoulNum + '')
  content.font = Font.boldSystemFont(20)
  content.textColor = colorMatch()
  
  content = line.addText(' 명')
  content.font = Font.systemFont(20)
  content.textColor = colorMatch()
  
  if(seoulGap > 0) {  // compare with yesterday's
    content = line.addText(' +' + seoulGap)  
    content.textColor = new Color(colorIncrease) 
  } else {
    content = line.addText(' ' + seoulGap)
    content.textColor = new Color(colorDecrease)
  }      
  content.font = Font.systemFont(14)
  
  stack.addSpacer(6)
  
  
  // Accumulated number on yesterday-basis.  
  content = stack.addText('0시 기준')
  content.font = Font.caption2()
  content.textColor = colorMatch()
  
  // Total
  line = stack.addStack()
  line.layoutHorizontally()
  line.centerAlignContent()
  
  content = line.addText(totalNum + '')
  content.font = Font.boldSystemFont(20)
  content.textColor = colorMatch()
  
  content = line.addText(' 명')
  content.font = Font.systemFont(20)
  content.textColor = colorMatch()
  
  content = line.addText(' +' + yesterdayNum)
  content.textColor = new Color(colorIncrease)
  content.font = Font.systemFont(14)
}

function setButtons() {
  let stack
  // Buttons  
  let button1, button2, button3, button4, button5
  let buttons = [button1, button2, button3, button4, button5]
  const shortcutURL = 'shortcuts://run-shortcut?name='
  let urls = [
    // renew
    thisURL,
    // 버즈 + 지니
    shortcutURL + '%eb%b2%84%ec%a6%88%2b%ec%a7%80%eb%8b%88',
    // QR 체크인
    shortcutURL + 'QR%20%ec%b2%b4%ed%81%ac%ec%9d%b8',
    // 집으로 가기
    shortcutURL + '%ec%a7%91%ec%9c%bc%eb%a1%9c%20%ea%b0%80%ea%b8%b0',
    // 계좌 공유
    shortcutURL + '%ea%b3%84%ec%a2%8c%20%ea%b3%b5%ec%9c%a0'
  ]

  stack = box.addStack()
  stack.size = new Size(130, 13)
  button1 = stack.addImage(SFSymbol.named('arrow.clockwise.circle').image)
  stack.addSpacer(15)
  button2 = stack.addImage(SFSymbol.named('headphones').image)
  stack.addSpacer(15)
  button3 = stack.addImage(SFSymbol.named('qrcode').image)
  stack.addSpacer(15)
  button4 = stack.addImage(SFSymbol.named('house').image)
  stack.addSpacer(15)
  button5 = stack.addImage(SFSymbol.named('dollarsign.circle').image)
  
  // Set url to buttons.
  button1.url = urls[0]
  button2.url = urls[1]
  button3.url = urls[2]
  button4.url = urls[3]
  button5.url = urls[4]
  
  // Set buttons' color.
  button1.tintColor = colorMatch()
  button2.tintColor = colorMatch()
  button3.tintColor = colorMatch()
  button4.tintColor = colorMatch()
  button5.tintColor = colorMatch()
}

function getBatteryImage() {
  if(Device.isCharging()) {
    return SFSymbol.named('battery.100.bolt').image
  }
  
  const batteryWidth = 100
  const batteryHeight = 41
  
   // Start our draw context.
  let draw = new DrawContext()
  draw.opaque = false
  draw.respectScreenScale = true
  draw.size = new Size(batteryWidth, batteryHeight)
  
  // Draw the battery.
  draw.drawImageInRect(SFSymbol.named("battery.0").image, new Rect(0, 0, batteryWidth, batteryHeight))
  
  // Match the battery level values to the SFSymbol.
  const x = batteryWidth*0.1525
  const y = batteryHeight*0.247
  const width = batteryWidth*0.602
  const height = batteryHeight*0.505
  
  // Prevent unreadable icons.
  let level = Device.batteryLevel()  
  if (level < 0.05) { level = 0.05 }
  
  // Determine the width and radius of the battery level.
  const current = width * level
  let radius = height/6.5
  
  // When it gets low, adjust the radius to match.
  if (current < (radius * 2)) { radius = current / 2 }

  // Make the path for the battery level.
  let barPath = new Path()
  barPath.addRoundedRect(new Rect(x, y, current, height), radius, radius)
  draw.addPath(barPath)
  
  let color
  if(level*100 < 20) {
    if(Device.isCharging()) color = Color.green()
    else color = Color.red()
  } else color = Color.black()
      
  draw.setFillColor(color)
  draw.fillPath()
  return draw.getImage()
}


function comma(number) {  
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function colorMatch() {
  let color
  if(isPad) {
    if(isDarkmode || forcedWhitePad) {
      color = Color.white()
    } else if(forcedBlackPad) {
      color = Color.black()
    }
  } else {
    if(forcedWhitePhone) {
      color = Color.white()
    } else if(forcedBlackPhone) {
      color = Color.black()
    }
  }  
  
  return color
}
