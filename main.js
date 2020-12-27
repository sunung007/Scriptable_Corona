const selectBackground = false

const forcedWhiteFontPhone = false
const forcedWhiteFontPad = false
const forcedBlackFontPhone = true
const forcedBlackFontPad = false

const colorIncrease = '#F51673'
const colorDecrease = '#2B69F0'

const isPad = Device.isPad()

let jsonURL = 'https://apiv2.corona-live.com/stats.json'
let widget = new ListWidget()
const isDarkmode = Device.isUsingDarkAppearance()

let jsonData = await new Request(jsonURL).loadJSON()
let overviewData = jsonData['overview']
let seoulData = jsonData['current']['0']['cases']

const currentNumber = comma(overviewData['current'][0])
const currentGap = overviewData['current'][1]
const accumNumber = comma(overviewData['confirmed'][0])
const yesterNumber = comma(overviewData['confirmed'][1])

const seoulCurrent = seoulData[0]
const seoulGap = seoulData[1]

createWidget()

// set background in phone.
if(Device.isPhone()) {
  let fileManager = FileManager.local()
  const path = fileManager.joinPath(fileManager.documentsDirectory(), 'corona-background')

  if(selectBackground) {
    let image = await Photos.fromLibrary()
    fileManager.writeImage(path, image)
  }
    
  widget.backgroundImage = fileManager.readImage(path)
  let exits = fileManager.fileExists(path)
}
 

// Refresh for every minute.// 
widget.refreshAfterDate = new Date(Date.now() +  1000*60*30)


widget.setPadding(0,0,0,0)
Script.setWidget(widget)
Script.complete()
widget.presentMedium()


function comma(number) {  
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}


function createWidget() {  
  let content, stack1, stack2, line, box
  let year, month, date, day
  let dayArray = ['일', '월', '화', '수', '목', '금', '토']
  
  box = widget.addStack()
  box.layoutHorizontally()
  
  
  // Stack1 : Date information
  date = new Date()
  day = dayArray[date.getDay()] + '요일'
  year = String(date.getFullYear()).substring(2) + '년'
  month = date.getMonth() + 1 + '월'
  date = date.getDate() + ''
  

  
  stack1 = box.addStack()
  stack1.layoutVertically()
  
  content = stack1.addText(year + ' ' + month)
  content.font = Font.caption1()  
  content.textColor = colorMatch()
  content = stack1.addText(date)
  content.font = Font.boldSystemFont(32)
  content.textColor = colorMatch()
  stack1.addSpacer(4)

  content = stack1.addText(day)
  content.font = Font.systemFont(16)
  content.textColor = colorMatch()
  stack1.addSpacer(8)

  //---------------------
  // battery in Stack1
  let battery = Device.batteryLevel()
  let image = getBatteryImage()
  line = stack1.addStack()
  content = line.addImage(image)

  if(Device.isCharging()) {
    content.imageSize = new Size(25, 20)
    content.tintColor = Color.green()
    line.addText(' ')
  } else {
    content.imageSize = new Size(35, 20)
    if(Device.batteryLevel()*100>20) {
      content.tintColor = colorMatch()
    }
  }

  content = line.addText(Number(Device.batteryLevel()*100).toFixed(0) + '%')    
  content.font = Font.systemFont(16)
  content.textColor = colorMatch()
  
  box.addSpacer(100)
    
  //------------------------------------------
  // Stack2 : Corona information  
  stack2 = box.addStack()
  stack2.layoutVertically()
  content = stack2.addText('현재')
  content.font = Font.caption2()
  content.textColor = colorMatch()
  
  let length1 = String(currentNumber).length
  let length2 = String(seoulCurrent).length  
  
  line = stack2.addStack()
  line.layoutHorizontally()
  line.centerAlignContent()
  content = line.addText(currentNumber+'')
  content.font = Font.boldSystemFont(20)
  content.textColor = colorMatch()
  content = line.addText(' 명')
  content.font = Font.systemFont(20)
  content.textColor = colorMatch()

  if(currentGap > 0) {  
    content = line.addText(' +' + currentGap)  
    content.textColor = new Color(colorIncrease) 
  } else {
    content = line.addText(' ' + currentGap)
    content.textColor = new Color(colorDecrease)
  }    
  content.font = Font.systemFont(14)
  
  //---------------------
  line = stack2.addStack()
  line.layoutHorizontally()
  line.centerAlignContent()
  content = line.addText(seoulCurrent+'')
  content.font = Font.boldSystemFont(20)
  content.textColor = colorMatch()
  content = line.addText(' 명')
  content.font = Font.systemFont(20)
  content.textColor = colorMatch()
  
  if(seoulGap > 0) {  
    content = line.addText(' +' + seoulGap)  
    content.textColor = new Color(colorIncrease) 
  } else {
    content = line.addText(' ' + seoulGap)
    content.textColor = new Color(colorDecrease)
  }      
  content.font = Font.systemFont(14)
  
  stack2.addSpacer(6)
  
  
  //---------------------
  content = stack2.addText('0시 기준')
  content.font = Font.caption2()
  content.textColor = colorMatch()
  line = stack2.addStack()
  line.layoutHorizontally()
  line.centerAlignContent()
  content = line.addText(accumNumber+'')
  content.font = Font.boldSystemFont(20)
  content.textColor = colorMatch()
  content = line.addText(' 명')
  content.font = Font.systemFont(20)
  content.textColor = colorMatch()
  
  content = line.addText(' +' + yesterNumber)
  content.textColor = new Color(colorIncrease)
  content.font = Font.systemFont(14)
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


function colorMatch() {
  let color
  if(isPad) {
    if(isDarkmode || forcedWhiteFontPad) {
      color = Color.white()
    } else if(forcedBlackFontPad) {
      color = Color.black()
    }
  } else {
    if(forcedWhiteFontPhone) {
      color = Color.white()
    } else if(forcedBlackFontPhone) {
      color = Color.black()
    }
  }  
  
  return color
}
