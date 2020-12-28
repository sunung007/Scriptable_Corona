// 개인 변경 부분
  // buttons 부분은 반드시 변경해야합니다.
  // 0. 위젯에 띄울 단축어 버튼 ---------------------------------
  const buttons = {
    number : 04,  // 버튼의 개수
    items : [ 
      // 버튼 내용
      // 아래 형식에 맞춰서 추가해주세요. 아래 형식이 한 쌍입니다.
      // 형식 : ['SF symbol 이름', '단축어 이름'],
      // SF symbol은 앱스토어에서 'sf symbol' 아무거나 다운받으셔서
      // 원하는 아이콘 사용하시면 됩니다.
      // 단축어 이름은 대소문자, 띄어쓰기 정확히 해야합니다.
      // 쉼표 잊지 마세요!
      ['headphones', '버즈+지니'],
      ['qrcode', 'QR 체크인'],
      ['house', '집으로 가기'],
      ['dollarsign.circle', '계좌 공유'],
    ]
  }
  
  // 최초 실행 시 자동으로 각 항목의 선택창이 뜹니다.
  // 최초 실행 시에는 아래 값들을 바꾸지 마세요.
  // 1. 위젯 배경 --------------------------------------------
    // true : 위젯의 배경을 이미지로 합니다.
    //        처음 설정 시 배경 이미지 선택창이 자동으로 뜹니다.
    // false : 위젯의 배경을 단색으로 합니다. 
    //         배경색은 기기의 다크모드 사용 여부에 따라 자동으로 결정됩니다.

    const setBackgroundImage = true

    // true : 배경 이미지 설정 후 변경을 원할 경우 true로 하십시오.
    //        이미지 변경 후 false로 바꿔야 합니다.
    // false : 기본 설정
    const changeBackgroundImage = false


  // 2. 내용 색상 --------------------------------------------
    // true : 내용 및 아이콘의 색을 설정합니다.
    //        처음 설정 시 색은 기기의 다크모드 사용 여부에 따라 자동으로 결정됩니다.
    // false : 기본 설정 값
    const forcedColor = true

    // true : 내용 및 아이콘의 색을 변경합니다.
    //        색 변경 후 false로 바꿔야합니다.
   // false : 기본 설정 값
   const changeContentColor = false


  // 3. 지역 설정 --------------------------------------------
    // true : 전국 실시간 확진자 수와 함께 볼 지역을 '변경'합니다.
    //        처음 설정 시 지역 선택창이 자동으로 뜹니다.
    //        지역 변경 후 false로 바꿔야합니다.
    // false : 기본 설정 값
    const changeRegion = false


  // 4. 새로고침 시간 -----------------------------------------
    // refresh time(새로고침 시간)을 결정합니다. 단위는 밀리초(ms)입니다.
    // 최초 설정은 10분 입니다.
    // 분 단위 수정은 괄호 안에 있는 숫자만 수정하면 됩니다.
    const refreshTime = 1000 * 60 * (10)






// 여기부터는 건들지 마세요.
// =======================================================
// Part : do not edit.
// Do not change from this line.
const colorIncrease = '#F51673'
const colorDecrease = '#2B69F0'
const jsonURL = 'https://apiv2.corona-live.com/stats.json'
const regionsArr = ['서울', '부산', '인천', '대구', '광주', '대전', '울산', '세종', '경기', '강원', '충북', '충남', '경북', '경남', '전북', '전남', '제주']

const thisURL = URLScheme.forRunningScript()
const fileManager = FileManager.local()

let widget = new ListWidget()

let contentColor, batteryLevel
let jsonData, covidRegion
let box, container


// Set region.
let path = fileManager.joinPath(fileManager.documentsDirectory(), 'covid-region')
if(!fileManager.fileExists(path) || changeRegion) {
  /* region JSON
  const regions = {
    '서울' : 0, '경기' : 8, '인천' : 2, '경북' : 12, '강원' : 9, '충남' : 11, '부산' : 1, '경남' : 13, '대전' : 5, '광주' : 4, '충북' : 10, '전북' : 14, '울산' : 6, '전남' : 15, '대구' : 3, '세종' : 7, '제주' : 16}
  */
  let alert = new Alert()
  alert.title = '지역 설정'
  alert.message = '실시간 코로나 확진자 현황의 지역을 선택하세요.'
  for(let i = 0 ; i < 17 ; i++) alert.addAction(regionsArr[i])
  covidRegion = await alert.present()
  fileManager.writeString(path, covidRegion + '')
}
covidRegion = fileManager.readString(path)


// Set background image if 'setBackgroundColor' is false.
if(setBackgroundImage) {
  path = fileManager.joinPath(fileManager.documentsDirectory(), 'covid-background')
  if(!fileManager.fileExists(path) || changeBackgroundImage) {
    let image = await Photos.fromLibrary()
    fileManager.writeImage(path, image)
  }
  widget.backgroundImage = fileManager.readImage(path)
}


// Set contents' color.
if(forcedColor) {
  path = fileManager.joinPath(fileManager.documentsDirectory(), 'covid-content-color')
  if(!fileManager.fileExists(path) || changeContentColor) {
    let alert = new Alert()
    alert.title = '아이콘 및 텍스트 색상 설정'
    alert.message = '원하는 색상을 선택해주세요.'
    alert.addAction('검정색')
    alert.addAction('흰색')
    contentColor = await alert.present()
    fileManager.writeString(path, contentColor + '')
  }
  contentColor = Number(fileManager.readString(path))
  switch(contentColor) {
    case 0 :
      contentColor = Color.black()
      break
    case 1 :
      contentColor = Color.white()
      break
  }
} else {
  contentColor = Device.isUsingDarkAppearance() ?
      Color.white : Color.black()
}


// Create a widget.
jsonData = await new Request(jsonURL).loadJSON()
createWidget()


// Refresh for every minute. Term : 15 minutes.
widget.refreshAfterDate = new Date(Date.now() + Number(refreshTime))
widget.setPadding(0,0,0,0)
widget.presentMedium()

Script.setWidget(widget)
Script.complete()


// Functions ==================================================
// Function : create the widget.
function createWidget() {
  container = widget.addStack()
  container.layoutVertically()
  
  box = container.addStack()
  box.layoutHorizontally()
  
  // Create upper part : date, battery, and covid patient number.
  setLeftWidget()
  box.addSpacer(100)
  setRightWidget()
  
  container.addSpacer(10)
  
  // Create below part : buttons
  box = container.addStack()
  box.layoutHorizontally()
  
  setButtons()  
}


// Function : Set date and battery information.
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
  
  // 년도 + 월
  content = stack.addText(year + ' ' + month)
  content.font = Font.caption1()  
  content.textColor = contentColor
  
  // 일
  line = stack.addStack()
  line.centerAlignContent()
  content = line.addText(date + ' ')
  content.font = Font.boldSystemFont(32)
  content.textColor = contentColor
  stack.addSpacer(4)

  // 요일
  content = stack.addText(day)
  content.font = Font.systemFont(16)
  content.textColor = contentColor
  stack.addSpacer(8)


  // Battery information.
  batteryLevel = Device.batteryLevel()
  let image = getBatteryImage()
  line = stack.addStack()
  content = line.addImage(image)

  // Coloring and resize battery icon
  if(Device.isCharging()) {
    content.imageSize = new Size(25, 20)
    content.tintColor = Color.green()
    line.addText(' ')
  } else {
    content.imageSize = new Size(35, 20)
    if(batteryLevel*100 < 20) content.tintColor = Color.red()
    else content.tintColor = contentColor
  }

  content = line.addText(Number(batteryLevel*100).toFixed(0) + '%')    
  content.font = Font.systemFont(16)
  content.textColor = contentColor  
}


// Function : Set realtime covid patinet number.
function setRightWidget() {
  let stack, line, content
  let currentNum, currentGap, regionNum, regionGap
  let totalNum, yesterdayNum
  
  
  // Get covid data from 'covid-live.com'
  let overviewData = jsonData['overview']
  let regionData = jsonData['current'][covidRegion]['cases']
  

  currentNum = comma(overviewData['current'][0])
  currentGap = overviewData['current'][1]
  totalNum = comma(overviewData['confirmed'][0])
  yesterdayNum = (overviewData['confirmed'][1])
  regionNum = comma(regionData[0])
  regionGap = regionData[1]
  
  stack = box.addStack()
  stack.layoutVertically()
  
  
  // Current realtime patient
  content = stack.addText('현재 (전국/' + regionsArr[covidRegion] + ')')
  content.font = Font.caption2()
  content.textColor = contentColor
  
  // Whole country
  line = stack.addStack()
  line.centerAlignContent()
  
  content = line.addText(currentNum + '')
  content.font = Font.boldSystemFont(20)
  content.textColor = contentColor
  
  content = line.addText(' 명')
  content.font = Font.systemFont(20)
  content.textColor = contentColor

  // Compare with yesterday's
  if(currentGap > 0) {  
    content = line.addText(' +' + comma(currentGap))
    content.textColor = new Color(colorIncrease) 
  } else {
    content = line.addText(' ' + comma(currentGap))
    content.textColor = new Color(colorDecrease)
  }    
  content.font = Font.systemFont(14)
  
  // Region
  line = stack.addStack()
  line.centerAlignContent()
  
  content = line.addText(regionNum + '')
  content.font = Font.boldSystemFont(20)
  content.textColor = contentColor
  
  content = line.addText(' 명')
  content.font = Font.systemFont(20)
  content.textColor = contentColor
  
  // compare with yesterday's
  if(regionGap > 0) { 
    content = line.addText(' +' + comma(regionGap))
    content.textColor = new Color(colorIncrease) 
  } else {
    content = line.addText(' ' + comma(regionGap))
    content.textColor = new Color(colorDecrease)
  }      
  content.font = Font.systemFont(14)
  
  stack.addSpacer(6)
  
  
  // Accumulated number on yesterday-basis.  
  content = stack.addText('0시 기준')
  content.font = Font.caption2()
  content.textColor = contentColor
  
  // Total
  line = stack.addStack()
  line.layoutHorizontally()
  line.centerAlignContent()
  
  content = line.addText(totalNum + '')
  content.font = Font.boldSystemFont(20)
  content.textColor = contentColor
  
  content = line.addText(' 명')
  content.font = Font.systemFont(20)
  content.textColor = contentColor
  
  content = line.addText(' +' + yesterdayNum)
  content.textColor = new Color(colorIncrease)
  content.font = Font.systemFont(14)
}


// Function : make buttons.
function setButtons() {
  const shortcutURL = 'shortcuts://run-shortcut?name='
  let stack, url, button
  
  // Add renew button.
  stack = box.addStack()
  button = stack.addImage(SFSymbol.named('arrow.clockwise.circle').image)
  button.url = thisURL
  button.tintColor = contentColor
  button.imageSize = new Size(15, 15)
  
  // Add custom buttons.
  for(let i = 0 ; i < buttons.number ; i++) {
    stack.addSpacer(12)
    button = stack.addImage(SFSymbol.named(buttons.items[i][0]).image)
    button.url = shortcutURL + encodeURI(buttons.items[i][1])
    button.tintColor = contentColor
    button.imageSize = new Size(15, 15)
  }
}

// Function : Make and return battery icon.
function getBatteryImage() {
  if(Device.isCharging()) {
    return SFSymbol.named('battery.100.bolt').image
  }
  
  const batteryWidth = 100
  const batteryHeight = 41
  
  let draw = new DrawContext()
  draw.opaque = false
  draw.respectScreenScale = true
  draw.size = new Size(batteryWidth, batteryHeight)
  
  draw.drawImageInRect(SFSymbol.named("battery.0").image,new Rect(0, 0, batteryWidth, batteryHeight))
  
  // Match the battery level values to the SFSymbol.
  const x = batteryWidth * 0.1525
  const y = batteryHeight * 0.247
  const width = batteryWidth * 0.602
  const height = batteryHeight * 0.505
  
  let level = Device.batteryLevel()
  if(level < 0.05) level = 0.05
  
  // Determine the width and radius of the battery level.
  const current = width * level
  let radius = height / 6.5
  
  // When it gets low, adjust the radius to match.
  if (current < (radius*2)) radius = current / 2

  // Make the path for the battery level.
  let barPath = new Path()
  barPath.addRoundedRect(new Rect(x, y, current, height), radius, radius)
  draw.addPath(barPath)
      
  draw.setFillColor(contentColor)
  draw.fillPath()
  return draw.getImage()
}

// Function : write ',' for every 3 digit.
function comma(number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}
