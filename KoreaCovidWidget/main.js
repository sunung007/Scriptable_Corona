/*
개인 변경 부분
위젯에 띄울 단축어 버튼들
itmes 안에는 아래 형식으로 추가/변경해주세요.
['SF symbol name', '단축어 이름이나 앱 url scheme']
*/
const buttons = {
  number : 4,  // 버튼의 개수
  items : [     // 버튼 내용
    ['headphones.circle', '단축어1'],
    ['house.circle', '단축어2'],
    ['wonsign.circle', '단축어3'],
    ['viewfinder.circle', 'kakaotalk://con/web?url=https://'
                +'accounts.kakao.com/qr_check_in'], // QR 체크인
    ['timer', '단축어4'],
    // 아래는 어플을 실행하는 버튼입니다.
    // 필요없으시면 지우셔도 됩니다. 대신 위에 number는 줄여주세요!
    ['p.circle', 'photos-redirect://'],         // 사진
    ['pencil.circle', 'mobilenotes://'], // 메모
    ['envelope.circle', 'message://'],              // 메일
    ['folder.circle', 'shareddocuments://'],        // 파일
    ['circle.grid.2x2', 'App-prefs://'],                // 설정
    ['barcode', 'kakaopay://'],              // 카카오페이
    /*...*/
  ]}


// 위젯 설정 변경 : 설정 변경 시 true로 바꾸세요.
let changeSetting = true

// 위젯 새로고침 시간(단위 : 초)
const refreshTime = 60 * 10

/*
아래 사이트에 들어가서 활용 신청한 후 발급받은 일반 인증키를 붙여넣으시면 됩니다!
웬만하면 발급 받으시는게 좋을겁니다... 터지면 저는 재발급받을테니까요..
https://data.go.kr/tcs/dss/selectApiDataDetailView.do?publicDataPk=15057682
*/
const appKey = 'e8AFfWnF9M5a355DPc9CSmzWHBW5JhXMfqg7vsEVIcqr9ZaS70Ahr%2FETSdFC1o5TUybHaANphNqbJR0aeZj6dA%3D%3D'

// 글자 크기
const fontSizeExtraSmall = 12 //코로나 전국,지역명,증감 / 큰사이즈 날씨
const fontSizeSmall = 13      //날짜의 년,월,요일 / 배터리 / 중간사이즈 날씨
const fontSizeMedium = 16     //작은 사이즈 코로나 정보
const fontSizeLarge = 18      //중간과 큰사이즈 코로나 정보
const fontSizeDate = 32       //날짜 '일'
const fontSizeMonthly = 10    //큰사이즈 달력



// 여기부터는 건들지 마세요.
// =======================================================
// Do not change from this line.
// Version of this script.
const scriptVersion = 'covid-widget-v3.32'

// 글꼴 : 프로파일 이름과 정확히 일치해야합니다.
// 프로파일 : 설정 > 일반 > 프로파일//
let font //= 'NanumSquare_ac Regular'
let boldFont //= 'NanumSquare ExtraBold'

// 버튼 크기,
const buttonSize = 20
const buttonSpacer = 12

// Content color
const color_increase = 'F51673'
const color_decrease = '2B69F0'
const color_gray = '545454'
let color_sunday = color_gray   // 일요일 색상을 hex로 넣으세요.
let color_saturday = color_gray // 토요일 색상을 hex로 넣으세요.

// Etc...
const localFM = FileManager.local()
const directory = localFM.documentsDirectory()
const path = localFM.joinPath(directory,'Gofo-covid-widget-data-')
const fcstPath = localFM.joinPath(directory,'Gofo-Fcst-info')

const widget = new ListWidget()
let dateFormatter = new DateFormatter()
dateFormatter.locale = 'ko-Kore_KR'

let VIEW_MODE
let covidJSON, calendarJSON
let settingJSON = {}
let weatherJSON = {}
let localeJSON = {}
let region, contentColor
let container, box, outbox, stack, batteryBox

// About weather
let forceWeatherChange = false
let useCovidLocation

// About calendar [calendar, reminder, monthly]
let showCalendar = [true, true, true]
let isCalendarRight = false
let calendarPeriod

// Start main code. ==============================================
// For test : Reset all setting file.
//removeOldLogs(true)

// Set widget's attributes.
await setWidgetAttribute()

// Bring json files.
await fetchJSONs()

// Create a widget.
createWidget()

// Refresh for every minute.
widget.refreshAfterDate = new Date(Date.now() + 1000*refreshTime)
widget.setPadding(15,15,15,15)

if(settingJSON.isBackgroundColor != 'invisible') {
  if(VIEW_MODE == 1) widget.presentSmall()
  else if(VIEW_MODE == 2) widget.presentMedium()
  else widget.presentLarge()
}

Script.setWidget(widget)
Script.complete()

// Function : reate widget =======================================
function createWidget() {
  container = widget.addStack()
  container.layoutVertically()

  outbox = container.addStack()
  outbox.layoutHorizontally()

  // 1st floor : common
  box = outbox.addStack()
  box.layoutVertically()
  setDateWidget()    // date

  if(VIEW_MODE == 1) {
    box.addSpacer()

    // 1st floor : left
    setWeatherWidget() // weather
    box.addSpacer(2)
    stack = box.addStack() // change line
    setBatteryWidget() // battry

    // 1st floor : right
    box = outbox.addStack()
    setCovidWidget()   // covid count

    widget.url = URLScheme.forRunningScript()
  }
  else if(VIEW_MODE == 2) {
    // 1st floor : Left
    box.addSpacer(14)
    setWeatherWidget() // weather
    setBatteryWidget() // battry

    outbox.addSpacer()

    // 1st floor : Right
    box = outbox.addStack()
    setCovidWidget()   // covid count

    container.addSpacer()

    // 2nd floor : buttons
    outbox = container.addStack()
    box = outbox.addStack()
    setButtonsWidget() // buttons

  }
  else if(VIEW_MODE == 3) {
    // 2nd floor
    stack.addSpacer(5)
    batteryBox = container.addStack()
    batteryBox.layoutHorizontally()
    stack = batteryBox
    setBatteryWidget()  // battry

    // 1st floor : right
    outbox.addSpacer()
    box = outbox.addStack()
    setWeatherWidget()  // weather

    container.addSpacer(14)

    // 3rd floor
    outbox = container.addStack()
    box = outbox.addStack()
    setCovidWidget()    // covid count

    container.addSpacer(14)

    // 4th floor
    outbox = container.addStack()
    if(showCalendar[2]) {
      setMonthlyDateWidget()
      outbox.addSpacer(14)
    }
    setCalendarWidget() // calendar

    container.addSpacer()

    // 5th floor
    outbox = container.addStack()
    box = outbox.addStack()
    setButtonsWidget() // buttons
  }
}

// Functions create widget's components ==========================
// Set date and battery information.
function setDateWidget() {
  let date = new Date()
  let line, content

  // Date information
  stack = box.addStack()
  stack.layoutVertically()

  // 년도 + 월
  dateFormatter.dateFormat = localeJSON.year + ' MMM'
  setText(stack, dateFormatter.string(date), fontSizeSmall)

  // 일
  dateFormatter.dateFormat = 'd'
  line = stack.addStack()
  setText(line, dateFormatter.string(date),
          fontSizeDate, true)

  // 요일
  dateFormatter.dateFormat = localeJSON.day
  setText(stack, dateFormatter.string(date), fontSizeSmall)

  if(VIEW_MODE == 2) stack.url = 'calshow://'
}

// Make battery widget.
function setBatteryWidget() {
  let line, content

  // Battery information.
  const batteryLevel = Device.batteryLevel()
  let image = getBatteryImage(batteryLevel)

  line = stack.addStack()
  line.layoutHorizontally()
  line.centerAlignContent()

  // Add, color, and resize battery icon.
  content = line.addImage(image)
  if(Device.isCharging()) {
    content.imageSize = new Size(20, fontSizeSmall)
    content.tintColor = Color.green()
  } else {
    content.imageSize = new Size(24, fontSizeSmall)
    if(batteryLevel*100 <= 20) content.tintColor = Color.red()
    else content.tintColor = contentColor
  }

  line.addSpacer(2)

  // Text
  setText(line, Math.floor(batteryLevel*100)+'%',
          fontSizeSmall)
}

// Set realtime covid patinet number.
function setCovidWidget() {
  let line, content, tstack

  // Get covid data from 'covid-live.com'
  let overviewData = covidJSON['overview']
  let regionData = covidJSON['current'][region]['cases']

  let currentNum = comma(overviewData['current'][0])
  let currentGap = overviewData['current'][1]
  let totalNum = comma(overviewData['confirmed'][0])
  let yesterdayNum = (overviewData['confirmed'][1])
  let regionNum = comma(regionData[0])
  let regionGap = regionData[1]

  // Add widget.
  if(VIEW_MODE == 1) {
    stack = box.addStack()
    stack.layoutVertically()

    // 전국
    line = stack.addStack()
    line.addSpacer()
    setText(line, localeJSON.country, fontSizeExtraSmall)
    line = stack.addStack()
    line.addSpacer()
    setText(line, currentNum+'', fontSizeMedium, true)

    stack.addSpacer() // 줄간격

    // 지역명
    line = stack.addStack()
    line.addSpacer()
    setText(line, getRegionInfo(0,region), fontSizeExtraSmall)
    line = stack.addStack()
    line.addSpacer()
    setText(line, regionNum+'', fontSizeMedium, true)

    stack.addSpacer() // 줄간격

    // 어제
    line = stack.addStack()
    line.addSpacer()
    setText(line, localeJSON.yesterday, fontSizeExtraSmall)
    line = stack.addStack()
    line.addSpacer()
    setText(line, yesterdayNum+'', fontSizeMedium, true)
    return
  }

  box.url = 'https://corona-live.com'
  if(VIEW_MODE == 2) {
    stack = box.addStack()
    stack.layoutVertically()
    if(dateFormatter.locale == 'en') {
      setText(stack, localeJSON.realtime,
              fontSizeExtraSmall)
    }
    else {
      const text = localeJSON.realtime
                 + ' ('+localeJSON.country + '/'
                 + getRegionInfo(0,region) + ')'
      setText(stack, text, fontSizeExtraSmall)
    }
  }
  else if(VIEW_MODE == 3) {
    tstack = box.addStack()
    tstack.layoutHorizontally()
    stack = tstack.addStack()
    stack.layoutVertically()
    setText(stack, localeJSON.country, fontSizeExtraSmall)
  }

  // Current realtime patinet number
  // Whole country
  line = stack.addStack()
  if(VIEW_MODE == 2) line.centerAlignContent()
  else if(VIEW_MODE == 3) line.bottomAlignContent()
  setText(line, currentNum+'', fontSizeLarge, true)
  if(VIEW_MODE == 2) {
    setText(line, localeJSON.count, fontSizeLarge)
  }

  // Compare with yesterday's
  if(currentGap > 0) {
    setText(line, ' +'+comma(currentGap),
            fontSizeSmall, false, color_increase)
  } else {
    setText(line, ' '+comma(currentGap),
            fontSizeSmall, false, color_decrease)
  }

  // Region
  if(VIEW_MODE == 3) {
     tstack = box.addStack()
     tstack.layoutHorizontally()
     tstack.addSpacer()
     stack = tstack.addStack()
     stack.layoutVertically()
     setText(stack, getRegionInfo(0, region),
             fontSizeExtraSmall)
   }

  line = stack.addStack()
  if(VIEW_MODE == 2) line.centerAlignContent()
  else if(VIEW_MODE == 3) line.bottomAlignContent()

  setText(line, regionNum+'', fontSizeLarge, true)
  if(VIEW_MODE == 2) {
    setText(line, localeJSON.count, fontSizeLarge)
  }

  // compare with yesterday's
  if(regionGap > 0) {
    setText(line, ' +' + comma(regionGap),
            fontSizeSmall, false, color_increase)
  } else {
    setText(line, ' ' + comma(regionGap),
            fontSizeSmall, false, color_decrease)
  }


  // Accumulated number on yesterday-basis.
  if(VIEW_MODE == 2) stack.addSpacer(6)
  else if(VIEW_MODE == 3) {
    tstack.addSpacer()
    tstack = box.addStack()
    tstack.layoutHorizontally()
    stack = tstack.addStack()
    stack.layoutVertically()
  }
  setText(stack, localeJSON.accumulate, fontSizeExtraSmall)

  // Total
  line = stack.addStack()
  line.layoutHorizontally()
  if(VIEW_MODE == 2) line.centerAlignContent()
  else if(VIEW_MODE == 3) line.bottomAlignContent()

  setText(line, totalNum+'', fontSizeLarge, true)
  if(VIEW_MODE == 2)  {
    setText(line, localeJSON.count, fontSizeLarge)
  }
  setText(line, ' +' + comma(yesterdayNum),
          fontSizeSmall, false, color_increase)
}

// Make buttons.
function setButtonsWidget() {
  const shortcutURL = 'shortcuts://run-shortcut?name='
  let url, button, image

  stack = box.addStack()
  for(let i = 0 ; i < buttons.number ; i++) {
    image = SFSymbol.named(buttons.items[i][0]).image
    button = stack.addImage(image)
    button.tintColor = contentColor
    button.imageSize = new Size(buttonSize, buttonSize)
    // If url is url scheme of baisc app
    if(buttons.items[i][1].indexOf('://') < 0) {
      button.url = shortcutURL + encodeURI(buttons.items[i][1])
    }
    else button.url = buttons.items[i][1]
    stack.addSpacer(buttonSpacer)
  }
}

// Make weather widget
async function setWeatherWidget() {
  let response, temp, rain, sky, volume

  try {
    response = weatherJSON.response
  }
  catch {
    console.error('ERROR in extract data frorm weather json.')
    console.error('다시 시도해주시기 바랍니다.')
    return
  }

  // Error code in loading weather
  const errorCode = response.header.resultCode

  if(errorCode != '00') {
    console.error('ERROR in weather loading : ' +
                  response.header.resultCode)
    console.error(response.header.resultMsg)
    return null
  }

  // Extract weather data from JSON file.
  let weatherItems = response.body.items.item
  let totalCount = Number(response.body.totalCount)
  let fcstTime = weatherItems[0].fcstTime


  for(let i in weatherItems) {
    if(weatherItems[i].fcstTime == fcstTime) {
      let category = weatherItems[i].category
      if(category == 'T1H') {
        temp = weatherItems[i].fcstValue+'℃'
      }
      else if(category == 'SKY') {
        sky = Number(weatherItems[i].fcstValue) -1
      }
      else if(category == 'PTY') {
        rain = weatherItems[i].fcstValue
      }
      else if(category == 'RN1') {
        volume = weatherItems[i].fcstValue
      }
    }
  }

  let line, content
  if(VIEW_MODE != 3) {
    stack = box.addStack()
    line = stack.addStack()

    // icon
    content = line.addImage(getWeatherImage(rain, sky, volume))
    content.tintColor = contentColor
    content.imageSize = new Size(16, 15)
    line.centerAlignContent()
    line.addSpacer(2)

    // temperature
    setText(line, temp, fontSizeSmall)
    line.addSpacer(6)
    line.url = 'http://weather.naver.com'
  }
  else if(VIEW_MODE == 3) {
    // icon
    content = box.addImage(getWeatherImage(rain, sky, volume))
    content.tintColor = contentColor
    content.imageSize = new Size(70, 70)
    content.url = 'http://weather.naver.com'

    let text = temp + ' | ' + getWeatherStatus(rain, sky)
    batteryBox.addSpacer()
    setText(batteryBox, text, fontSizeExtraSmall)
  }
}

// Make calendar widget shown in large size.
function setCalendarWidget() {
  let title, color, line, content

  // default : do not show
  let maxNum = 3 // max number of line each has
  let calendarNum = -1
  let reminderNum = -1

  // 0 : calendar / 1 : reminder / 2 : monthly date
  if(!showCalendar[0] || !showCalendar[1]) maxNum = 7
  if(showCalendar[0]) {
    calendarNum = calendarJSON.length > maxNum
                  ? maxNum : calendarJSON.length
  }
  if(showCalendar[1]) {
    reminderNum = reminderJSON.length > maxNum
                  ? maxNum : reminderJSON.length
  }
  if(showCalendar[0] && showCalendar[1]) {
    if(calendarNum <= maxNum &&
       reminderJSON.length > maxNum) {
      reminderNum += maxNum - calendarNum
    }
    else if(calendarJSON.length > maxNum &&
            reminderNum <= maxNum) {
      calendarNum += maxNum - reminderNum
    }
  }

  box = outbox.addStack()
  box.layoutVertically()
  stack = box.addStack()
  stack.layoutVertically()

  // Show calendar
  if(showCalendar[0]) {
    stack.url = 'calshow://'
    line = stack.addStack()
    if(isCalendarRight) line.addSpacer()
    setText(line, localeJSON.calendar,fontSizeSmall, true)
    if(calendarNum == 0) {
      setText(line, ' 0', fontSizeSmall, true, color_gray)
    }
    else {
      if(calendarJSON.length > calendarNum) {
        let text = ' +'+(calendarJSON.length-calendarNum)
        setText(line, text, fontSizeSmall, true, color_gray)
      }
      getCalendarContent(calendarNum, calendarJSON,
                         isCalendarRight, true)
    }
  }

  if(showCalendar[0] && showCalendar[1]) {
    stack.addSpacer(10)
    stack = box.addStack()
    stack.layoutVertically()
  }

  // Show reminder
  if(showCalendar[1]) {
    stack = box.addStack()
    stack.layoutVertically()
    stack.url = 'x-apple-reminderkit://'
    line = stack.addStack()

    if(isCalendarRight) line.addSpacer()
    setText(line, localeJSON.reminder, fontSizeSmall, true)
    if(reminderNum == 0) {
      setText(line, '0', fontSizeSmall, true, color_gray)
    }
    else {
      if(reminderJSON.length > reminderNum) {
        let text = ' +'+(reminderJSON.length-reminderNum)
        setText(line, text, fontSizeSmall, true, color_gray)
      }
      getCalendarContent(reminderNum, reminderJSON,
                         isCalendarRight, false)
    }
  }
}

// Show monthly calendar when user choose option.
function setMonthlyDateWidget() {
  const days = [localeJSON.sun, localeJSON.mon, localeJSON.tue,
                localeJSON.wen, localeJSON.thu, localeJSON.fri,
                localeJSON.sat]
  let width = fontSizeMonthly*1.3
  let content, color

  let date = new Date()
  let nowDate = date.getDate()
  date.setDate(1)
  let firstDay = date.getDay()
  date.setMonth(date.getMonth()+1)
  date.setDate(0)
  let lastDate = date.getDate()

  box = outbox.addStack()
  box.url = 'calshow://'
  box.layoutVertically()

  // month
  dateFormatter.dateFormat = 'MMM'
  setText(box, dateFormatter.string(date), fontSizeSmall, true)
  stack = box.addStack()
  stack.layoutHorizontally()

  // 내용
  for(let i = 0 ; i < 7 ; i++) {
    // 줄바꿈
    let line = stack.addStack()
    line.layoutVertically()
    line.size = new Size(width, 0)

    let inline = line.addStack()
    inline.size = new Size(width, 0)
    inline.layoutHorizontally()
    inline.centerAlignContent()

    let color = (i==0?color_sunday:(i==6?color_saturday:null))

    // 요일
    setText(inline, days[i], fontSizeMonthly, false, color)
    line.addSpacer(5)

    // 공백
    if(i < firstDay) {
      inline = line.addStack()
      inline.size = new Size(width, 0)
      inline.centerAlignContent()
      setText(inline, ' ', fontSizeMonthly)
      line.addSpacer(4)
    }

    // 날짜
    let j = (i<firstDay? 8-firstDay+i : i-firstDay+1)
    for( ; j <= lastDate ; j += 7) {
      inline = line.addStack()
      inline.size = new Size(width, 0)
      inline.centerAlignContent()

      if(nowDate == j) {
        setText(inline,j+'',fontSizeMonthly,true,color_increase)
      }
      else {
        setText(inline,j+'',fontSizeMonthly,false,color)
      }
      line.addSpacer(4)
    }
    if(i < 6) stack.addSpacer(4)
  }
}

// Functions for making each widget.==========================
// Fetch JSON files.
async function fetchJSONs() {
  // Covid data.
  const covidURL = 'https://apiv2.corona-live.com/stats.json'
  try { covidJSON = await new Request(covidURL).loadJSON() }
  catch { console.error('Error : Load covid data') }

  // Weather data.
  let weatherURL
  let nx = -1
  let ny = -1
  if(!useCovidLocation) {
    console.log('Use real-time location as weather location.')
    while(nx+ny < 0) {
      console.log('Loading current location data...')
      try {
        Location.setAccuracyToThreeKilometers()
        let location = await Location.current()
        let lat = location.latitude
        let lon = location.longitude
        // Change current location to grid(x, y)
        let grid = changeLocationGrid(lat, lon)
        nx = grid[0]
        ny = grid[1]
      }
      catch { nx = ny = -1 }
    }
  }
  else {
    nx = getRegionInfo(1, region)
    ny = getRegionInfo(2, region)
  }

//  while(weatherJSON) {
    try {
      weatherURL = await getWeatherURL(nx, ny)
      weatherJSON = await new Request(weatherURL).loadJSON()
    }
    catch {
      console.error('Error : Load weather data')
      console.error('URL : ' + weatherURL)
    }
  //}

  // Calendar and reminder data.
  if(VIEW_MODE == 3) {
    try {
      let end = new Date()
      // Calendar
      if(showCalendar[0]) {
        if(calendarPeriod == 'thisMonth') {
          end.setMonth(end.getMonth() + 1)
          end.setDate(-1)
          calendarJSON
                  = await CalendarEvent.between(new Date(), end)
        }
        else if(calendarPeriod == 'thisWeek') {
          end.setDate(end.getDate() + 6 - end.getDay())
          calendarJSON
                  = await CalendarEvent.between(new Date(), end)
        }
        else if(calendarPeriod == '7days') {
          end.setDate(end.getDate()+7)
          calendarJSON
                  = await CalendarEvent.between(new Date(), end)
        }
        else {
          calendarJSON = await CalendarEvent.today()
        }
      }
      // Reminder
      if(showCalendar[1]) {
        reminderJSON = await Reminder.allIncomplete()
        reminderJSON.sort(sortReminder)
      }
    }
    catch { console.error('Error : Load calendar data') }
  }

  // Function : Sort reminder content for date
  function sortReminder(a, b) {
    if(a.dueDate == null & b.dueDate == null) {
      compareCreationDate()
    }
    else if(a.dueDate != null && b.dueDate == null) return -1
    else if(a.dueDate == null && b.dueDate != null) return 1
    else {
      if(a.dueDate == b.dueDate) compareCreationDate()
      else if(a.dueDate < b.dueDate) return -1
      else return 1
    }

    function compareCreationDate() {
      if(a.creationDate  == b.creationDate) return 0
      else if(a.creationDate < b.creationDate) return -1
      else return 1
    }
  }
}

// Make and return battery icon.
function getBatteryImage(batteryLevel) {
  if(Device.isCharging()) {
    return SFSymbol.named('battery.100.bolt').image
  }

  const batteryWidth = 87
  const batteryHeight = 41

  let draw = new DrawContext()
  let image = SFSymbol.named("battery.0").image
  let rect = new Rect(0, 0, batteryWidth, batteryHeight)
  draw.opaque = false
  draw.respectScreenScale = true
  draw.size = new Size(batteryWidth, batteryHeight)
  draw.drawImageInRect(image,rect)

  // Match the battery level values to the SFSymbol.
  const x = batteryWidth * 0.1525
  const y = batteryHeight * 0.247
  const width = batteryWidth * 0.602
  const height = batteryHeight * 0.505

  // Determine the width and radius of the battery level.
  const current = width * batteryLevel
  let radius = height / 6.5

  // When it gets low, adjust the radius to match.
  if (current < (radius*2)) radius = current / 2

  // Make the path for the battery level.
  let barPath = new Path()
  let barRect = new Rect(x, y, current, height)
  barPath.addRoundedRect(barRect, radius, radius)
  draw.addPath(barPath)
  draw.setFillColor(contentColor)
  draw.fillPath()

  return draw.getImage()
}

// Make components of calender and reminder
function getCalendarContent(num, json, right, isCalendar) {
  if(right != true) right = false

  let draw = new DrawContext()
  draw.opaque = false
  draw.respectScreenScale = true
  draw.fillEllipse(new Rect(0, 0, 200, 200))
  let circle = draw.getImage()

  dateFormatter.dateFormat = 'd'

  for(let i = 0 ; i < num; i++ ) {
    line = stack.addStack()
    line.layoutHorizontally()
    line.centerAlignContent()

    // Get title and bar's color from JSON file.
    title = json[i].title
    color = json[i].calendar.color.hex

    // Draw circle
    if(right) line.addSpacer()
    content = line.addImage(circle)
    content.imageSize = new Size(fontSizeExtraSmall-3,
                                 fontSizeExtraSmall-9)
    content.tintColor = new Color(color)

    // In calendar set period
    let period = ''
    if(isCalendar && calendarPeriod != 'today') {
      let startDate = json[i].startDate
      let endDate = json[i].endDate
      if(startDate != null && endDate != null) {
        startDate = dateFormatter.string(startDate)
        endDate = dateFormatter.string(endDate)
        if(startDate == endDate) period += startDate // 당일
        else period = startDate + '-' + endDate
        period += ' | '
      }
    }

    // Add text
    content = setText(line, period + title, fontSizeExtraSmall)
    content.lineLimit = 1
  }
}

// Functions about weather -----------------------------------
// Function : Make and return weather request url.
async function getWeatherURL(nx, ny) {
  let weatherURL = 'http://apis.data.go.kr/1360000/'
      + 'VilageFcstInfoService/getUltraSrtFcst?serviceKey='
      + appKey + '&numOfRows=60&dataType=JSON&base_date='
  let date = new Date()
  let base_date, base_time

  dateFormatter.dateFormat = 'yyyyMMddHH30'

  // Match with api's update time.
  if(date.getMinutes() < 45) { date.setHours(date.getHours()-1) }
  base_date = dateFormatter.string(date).substring(0, 8)
  base_time = dateFormatter.string(date).substring(8)

  // Return weather URL
  weatherURL += base_date + '&base_time=' + base_time
             + '&nx=' + nx + '&ny=' + ny
  return weatherURL
}

// Function : Change latitude and longitude -> grid(x, y)
function changeLocationGrid(lat, lon) {
  const RE = 6371.00877
  const GRID = 5.0
  const SLAT1 = 30.0
  const SLAT2 = 60.0
  const OLON = 126.0
  const OLAT = 38.0
  const XO = 43
  const YO = 136

  const DEGRAD = Math.PI / 180.0
  const RADDEG = 180.0 / Math.PI

  const re = RE / GRID
  const slat1 = SLAT1 * DEGRAD
  const slat2 = SLAT2 * DEGRAD
  const olon = OLON * DEGRAD
  const olat = OLAT * DEGRAD

  let sn = Math.tan(Math.PI*0.25 + slat2*0.5)
           / Math.tan(Math.PI*0.25 + slat1*0.5)
  sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn)
  let sf = Math.tan(Math.PI*0.25 + slat1*0.5)
  sf = (Math.pow(sf, sn) * Math.cos(slat1)) / sn
  let ro = Math.tan(Math.PI*0.25 + olat*0.5)
  ro = (re*sf) / Math.pow(ro, sn)

  const rs = []
  let ra = Math.tan(Math.PI*0.25 + lat*DEGRAD*0.5)
  ra = (re*sf) / Math.pow(ra, sn)
  let theta = lon*DEGRAD - olon
  if(theta > Math.PI) theta -= 2.0 * Math.PI
  if(theta < -Math.PI) theta += 2.0 * Math.PI
  theta *= sn
  rs[0] = Math.floor(ra*Math.sin(theta) + XO + 0.5)
  rs[1] = Math.floor(ro - ra*Math.cos(theta) + YO + 0.5)

  return rs
}

// Function : Return region's infortmation.
// type : (0 : name), (1 : x), (2 : y)
function getRegionInfo(i, j) {
  const regionsArr = [
    ['서울', '60', '127'], ['부산', '98', '76' ],
    ['인천', '55', '124'], ['대구', '89', '90' ],
    ['광주', '58', '74' ], ['대전', '67', '100'],
    ['울산', '102', '84'], ['세종', '66', '103'],
    ['경기', '60', '120'], ['강원', '73', '134'],
    ['충북', '69', '107'], ['충남', '68', '100'],
    ['경북', '89', '91' ], ['경남', '91', '77' ],
    ['전북', '63', '89' ], ['전남', '51', '67' ],
    ['제주', '52', '38' ]]

  if(i==0 && dateFormatter.locale == 'en') {
    return localeJSON.regions[j]
  }
  return regionsArr[j][i]
}

function getWeatherStatus(rain, sky) {
  const skyArr = ['맑음', '구름조금', '구름많음', '흐림']
  const rainArr = ['없음', '비', '비/눈', '눈', '소나기',
                   '빗방울', '비/눈', '눈날림']
  if(rain == 0) return skyArr[sky]
  else return rainArr[rain]
}

function getWeatherImage(rain, sky, volume) {
  const iconArr = [
                             // 공통
    'cloud.fill',            // 0. 흐림
    'cloud.heavyrain.fill',  // 1. 많은 비(비, 소나기)
    'cloud.sleet.fill',      // 2. 비/눈(빗방울/눈날림)
    'snow',                  // 3. 눈(눈날림)
                             // 아침
    'sun.max.fill',          // 4. 맑음
    'cloud.sun.fill',        // 5. 구름 조금
    'cloud.sun.fill',        // 6. 구름 많음
    'cloud.drizzle.fill',    // 7. 적은 비(비, 빗방울) + 일반
    'cloud.sun.rain.fill',   // 8. 비 + 구름 적음
                             // 저녁
    'moon.stars.fill',       // 9. 맑음
    'cloud.moon.fill',       // 10. 구름 조금
    'cloud.moon.fill',       // 11. 구름 많음
    'cloud.drizzle.fill',    // 12. 적은 비(비, 빗방울)
    'cloud.moon.rain.fill'   // 13. 비 + 구름 적음
  ]

  let iconIndex
  if(rain == 0) { // 맑음, 구름조금, 구름많음, 흐림(공통)
    if(sky == 3) iconIndex = 0
    else iconIndex = sky + 4
  }
  else {
    if(rain == 3 || rain == 7) { iconIndex = 3 } // 눈(공통)
    else if(rain == 2 || rain == 6) { iconIndex= 2 } // 비+눈(공통)
    else { // 비
      if(sky < 2) { iconIndex = 8 } // 비+구름적음
      else if(volume > 5) { iconIndex = 1 } // 많은 비
      else { iconIndex = 7 }// 적은 비
    }
  }

  // A icon that is changed as time. (ex: sun -> moon)
  let currentHour = new Date().getHours()
  if((currentHour<7||currentHour>18) && iconIndex>3) {
    iconIndex += 5
  }

  let height
  if(iconIndex == 1) { height = 180 }
  else if(iconIndex == 0 || iconIndex == 6 || iconIndex == 11) {
    height = 150
  }
  else height = 200

  let icon = SFSymbol.named(iconArr[iconIndex]).image
  let draw = new DrawContext()
  draw.opaque = false
  draw.respectScreenScale = true
  draw.drawImageInRect(icon, new Rect(0, 0, 200, height))

  return draw.getImage()
}



// Functions : etc =============================================
// Function : change text settings.
function setText(stack, text, size, bold, colorHex) {
  if(bold != true) bold = false
  let content = stack.addText(text)

  try {
    if(font == null) throw error
    if(bold) content.font = new Font(boldFont, size)
    else content.font = new Font(font, size)
  }
  catch {
    // bold and size
    if(bold) content.font = Font.boldSystemFont(size)
    else content.font = Font.systemFont(size)
  }

  // color
  if(colorHex == null) content.textColor = contentColor
  else content.textColor = new Color(colorHex)

  return content
}

// Function : make alert
async function setAlert(content, title, message) {
  let alert = new Alert()
  if(title != null) alert.title = title
  if(message != null) alert.message = message
  for(let i in content) alert.addAction(content[i])
  return await alert.present()
}

// Function : Set widget background color or content color
// Argument
// {type} 0(set widget background color) - 1(set content color)
// {colorNumber} -1(make alert) others(just change color)
async function setColor(type, colorNumber) {
  let number
  if(colorNumber == -1) {
    let arr = ['검정색','하얀색','노란색','초록색','파란색','자동']
    let title = type==0 ? '위젯 배경 색상 선택' : '텍스트/아이콘 색상 선택'
    number = await setAlert(arr, title, '아래에서 색상을 선택하세요.')
  } else number = colorNumber

  let color
  if(number == 5) {
    let isDark = Device.isUsingDarkAppearance()
    if(type == 0) number = isDark ? 0 : 1
    else if(type == 1) number = isDark ? 1 : 0
  }

  if(number == 0) color = Color.black()
  else if(number == 1) color = Color.white()
  else if(number == 2) color = Color.yellow()
  else if(number == 3) color = Color.green()
  else if(number == 4) color = Color.blue()

  if(type == 0) widget.backgroundColor = color
  else if(type == 1) contentColor = color

  return number
}

// Function : fetch locale to letters.
function fetchLocale(locale) {
  let fetch = false
  if(locale == 'en') {
    dateFormatter.locale = 'en'
    fetch = true
  }
  else dateFormatter.locale = 'ko-Kore_KR'

  localeJSON.year       = !fetch ? 'yy년'    : 'y,'
  localeJSON.day        = !fetch ? 'EEEE'    : 'E'
  localeJSON.realtime   = !fetch ? '현재'     : 'Real-time'
  localeJSON.country    = !fetch ? '전국'     : 'Korea'
  localeJSON.accumulate = !fetch ? '0시 기준' : 'Total'
  localeJSON.yesterday  = !fetch ? '어제'     : 'Last'
  localeJSON.count      = !fetch ? ' 명'     : ''
  localeJSON.calendar   = !fetch ? '일정'     : 'Calendar'
  localeJSON.reminder   = !fetch ? '미리알림'  : 'Reminder'

  localeJSON.sun        = !fetch ? '일' : 'S'
  localeJSON.mon        = !fetch ? '월' : 'M'
  localeJSON.tue        = !fetch ? '화' : 'T'
  localeJSON.wen        = !fetch ? '수' : 'W'
  localeJSON.thu        = !fetch ? '목' : 'T'
  localeJSON.fri        = !fetch ? '금' : 'F'
  localeJSON.sat        = !fetch ? '토' : 'S'

  localeJSON.regions = ['Seoul', 'Busan', 'Incheon', 'Daegu',
                        'Gwangju', 'Daejeon', 'Ulsan', 'Sejong',
                        'Gyeonggi', 'Gangwon', 'ChungBuk',
                        'ChungNam', 'GyeongBuk', 'GyeongNam',
                        'JeonBuk', 'JeonNam', 'Jeju']
}

// Function : remove old datas
function removeOldLogs(all) {
  const testArr = ['settingJSON', 'weatherJSON']
  const arr = ['region', 'useCovidLocation', 'isBackgroundColor',
               'backgroundColorNumber', 'isForcedColor',
               'contentColorNumber', 'widgetSize',
               'base_time', 'temp', 'sky', 'rain', 'volume']
  const old_path_arr = ['covid-region', 'covid-background',
                        'covid-content-color']

  // Remove first vesion's log.
  console.log('이전 버전의 데이터를 정리합니다.')
  for(let i in old_path_arr) {
    let j = localFM.joinPath(directory, old_path_arr[i])
    if(localFM.fileExists(j)) {
      console.log('Remove 1.0s ' + old_path_arr[i])
      localFM.remove(j)
    }
  }

  // Remove data
  for(let i in arr) {
    if(localFM.fileExists(path+arr[i])) {
      localFM.remove(path+arr[i])
      console.log('Remove 2.0s ' + arr[i])
    }
  }
  console.log('이전 버전의 불필요 데이터가 삭제되었습니다.')

  if(all) {
    console.log('현재 데이터를 삭제합니다.')
    for(let i in testArr) {
      if(localFM.fileExists(path+testArr[i])) {
        localFM.remove(path+testArr[i])
        console.log('Remove current ' + testArr[i])
      }
    }
    console.log('현재 데이터가 삭제되었습니다.')
  }
}

// Function : write ',' for every 3 digit.
function comma(number) {
  return String(number).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// Function : load invisible script and run it. =================
async function fetchInvisibleScript() {
  let message = '투명 위젯은 배경화면을 위젯의 위치와 크기에 맞게 잘라서 '
                  + '배경으로 사용하여 투명한 것처럼 보이게 하는 것입니다.\n\n'
                + '진행 전 홈화면 편집모드에서 빈 배경화면의 스크린샷을 '
                + '준비해주세요.\n\n'
                +'이후 뜨는 사진 선택에서 빈 배경화면의 사진을 선택해주세요.'
  let result = await setAlert(['취소','확인'],'투명 위젯 만들기',message)
  if(result == 0) return null

  // This source is from mzeryck's code.
  let url = 'https://gist.githubusercontent.com/mzeryck/'
            + '3a97ccd1e059b3afa3c6666d27a496c9/raw/'
            + '54587f26d0b1ca7830c8d102cd786382248ff16f/'
            + 'mz_invisible_widget.js'
  const widgetSize = ['Small', 'Medium', 'Large']
  const oldPosition = ['left', 'right', 'top', 'middle', 'bottom',
                       'Top', 'Middle', 'Bottom']
  const newPosition = ['왼쪽', '오른쪽', '상단', '중앙', '하단',
                       '상단', '중앙', '하단']
  const oldMessages = ["It looks like you selected an image that isn't an iPhone screenshot, or your iPhone is not supported. Try again with a different image.",
"What type of iPhone do you have?",
"Note that your device only supports two rows of widgets, so the middle and bottom options are the same.",
'What position will it be in?',
'["Top left","Top right","Middle left","Middle right","Bottom left","Bottom right"]',
'["Top","Middle","Bottom"]',
'["Top","Bottom"]']
  const newMessages = ["휴대폰 사이즈와 선택한 이미지의 크기가 다릅니다. 홈화면 편집모드에서 빈화면의 스크린샷을 찍고, 해당 이미지를 선택하세요.",
"현재 사용 중인 기기의 모델을 선택하세요.",
"이 기종은 '중앙'과 '하단' 옵션의 결과물이 동일합니다.",
"위젯이 홈화면에서 놓일 위치를 선택해주세요",
'["상단 왼쪽","상단 오른쪽","중앙 왼쪽","중앙 오른쪽", "하단 왼쪽", "하단 오른쪽"]',
'["상단","중앙","하단"]',
'["상단","하단"]']

  let request = await new Request(url).loadString()
  for(let i in oldMessages) {
    request = request.replace(oldMessages[i], newMessages[i])
  }
  console.log('Start editing original code.')
  let index0 = request.indexOf('let img = await')
  let index1 = request.indexOf('message = "What size of widget')
  let index2 = request.indexOf('message = "위젯이 홈화면에서 놓일')
  let index3 = request.indexOf
                     ('message = "Your widget background is ready')
  let tailCode = "await FileManager.local().writeImage('"
                 + (path+'backgroundImage') + "',imgCrop)\n\n"
                 + 'let noti = new Notification()\n\n'
                 + 'noti.title = "[Gofo] 코로나 위젯"\n\n'
                 + 'noti.subtitle = "투명배경화면 설정이 완료되었습니다. "'
                 +           '+ "코로나 위젯 스크립트를 실행해주세요."\n\n'
                 + 'noti.openURL = "'+URLScheme.forRunningScript()
                 + '"\n\n'
                 + 'let date = new Date()\n\n'
                 + 'date.setSeconds(date.getSeconds()+1)\n\n'
                 + 'noti.schedule()\n\n\n'
                 + 'noti.setTriggerDate(date)\n\n'
                 + "WebView.loadURL('scriptable:///run/'"
                 + "+ encodeURI('코로나 위젯_업데이트중_투명배경'))\n\n"
  let functions = request.substring(
                  request.indexOf('async function generateAlert'))

  // Edit code.
  let cropCode = request.substring(index2, index3)
  for(let i in oldPosition) {
    cropCode = cropCode.replaceAll(oldPosition[i],newPosition[i])
    functions = functions.replaceAll(oldPosition[i],
                                     '"'+newPosition[i]+'"')
  }

  let file = 'let files = FileManager.local()\n\n'
             + request.substring(index0, index1) + '\n\n'
             + 'let widgetSize = "' + widgetSize[VIEW_MODE-1]
             + '"\n\n' + cropCode + '\n\n' + tailCode
             + '\n\n' + functions

  console.log('Editing original code is completed.')

  let iCloud = FileManager.iCloud()
  let filePath = iCloud.joinPath(iCloud.documentsDirectory(),
                 '투명 위젯 설정.js')
  iCloud.writeString(filePath, file)
  console.log("Save edited code.")

  settingJSON = JSON.stringify(settingJSON)
  localFM.writeString(path+'settingJSON', settingJSON)
  if(localFM.fileExists(path+'backgroundImage')) {
    localFM.remove(path+'backgroundImage')
  }

  // Run script for making widget invisible.
  WebView.loadURL('scriptable:///run/'
                  + encodeURI('투명 위젯 설정'))
}


// Funciton : widget setting ====================================
// Set basic settings of widget.
async function setWidgetAttribute() {
  let haveSettingFile = false
  let haveSettingChange = false
  let changeAttribute = -1
  let isBackgroundColor, isForcedColor

  // If runs in widget, do not change any setting.
  if(!config.runsInApp) changeSetting = false

  // Load settingJSON file.
  try {
    // Load json file saved setting values.
    settingJSON = await JSON.parse(localFM.
                             readString(path+'settingJSON'))
    haveSettingFile = true
    console.log('Load setting JSON file.')
    if(settingJSON.isBackgroundColor == 'invisible') {
      changeSetting = false
      if(!localFM.fileExists(path+'backgroundImage')) {
        settingJSON.isBackgroundColor = null
      }
    }
  }
  catch {
    haveSettingFile = false
    changeSetting = false
    console.log('There is no setting file.')
    console.log('위젯 설정을 진행합니다.')
  }

  if(changeSetting) {
    let alert = ['코로나 알림 지역 설정','날씨 정보 지역 설정','배경 설정',
                 '텍스트/아이콘 색상 설정','위젯 크기 및 구성 변경','언어 설정',
                 '전체 초기화']
    if(haveSettingFile) alert.push('취소')
    changeAttribute = await setAlert(alert)
  }

  // Set region.
  if(settingJSON.region == null ||
     changeAttribute == 6 || changeAttribute == 0) {
    haveSettingChange = true

    let alert = []
    for(let i = 0 ; i < 17 ; i++) alert.push(getRegionInfo(0,i))
    region = await setAlert(alert, '코로나 알림 지역 설정',
                            '실시간 코로나 확진자 현황의 지역을 선택하세요.')
    settingJSON.region = region+''
  }
  else { region = Number(settingJSON.region) }


  // Set weather location
  if(settingJSON.useCovidLocation == null ||
     changeAttribute == 6 || changeAttribute == 1) {
    haveSettingChange = true
    let alert = await setAlert(
                    ['실시간 위치 사용', '코로나 정보의 위치와 같게 설정'],
                    '날씨 정보 지역 설정',
                    '날씨 정보를 얻을 지역 정보를 설정하세요.\n' +
                    '실시간 위치를 사용할 경우 로딩 시간이 길어질 수 있습니다.')
    useCovidLocation = (alert != 0)
    settingJSON.useCovidLocation = useCovidLocation.toString()
  }
  else {
    useCovidLocation = settingJSON.useCovidLocation == 'true'
                       ? true : false
  }

  // Set background.
  if(settingJSON.isBackgroundColor == null ||
     changeAttribute == 6 || changeAttribute == 2) {
    haveSettingChange = true
    let result = -1
    let arr = ['북마크에서 선택','사진에서 선택','색상 선택','투명하게 설정']
    result = await setAlert(arr,'위젯 배경 설정','배경 유형을 선택하세요.')
    if(result == 0) {
      let allList = localFM.allFileBookmarks()
      let allName = []
      for(let i in allList) allName.push(allList[i].name)
      if(allName.length < 1) {
        await setAlert(['북마크가 없습니다.'], '위젯 배경 설정')
        return
      }
      result = await setAlert(allName,'위젯 배경 설정',
                             '배경으로 할 북마크 파일을 선택하세요')
      let imagePath = localFM.bookmarkedPath(allName[result])
      let image = await localFM.readImage(imagePath)
      widget.backgroundImage = image
      settingJSON.isBackgroundColor = 'bookmark'
      settingJSON.bookmark = allName[result]
    }
    else if(result == 1) {
      let image = await Photos.fromLibrary()
      settingJSON.isBackgroundColor = 'background'
      localFM.writeImage(path+'backgroundImage', image)
      widget.backgroundImage = image
    }
    else if(result == 2) {
      settingJSON.isBackgroundColor = 'color'
      settingJSON.backgroundColorNumber = await setColor(0, -1)
    }
    else if(result == 3) {
      settingJSON.isBackgroundColor = 'invisible'
    }
  }
  else {
    isBackgroundColor = settingJSON.isBackgroundColor
    if(isBackgroundColor == 'bookmark') {
      let bookmark = settingJSON.bookmark
      let imagePath = localFM.bookmarkedPath(bookmark)
      let image = await localFM.readImage(imagePath)
      widget.backgroundImage = image
    }
    else if(isBackgroundColor == 'background') {
      widget.backgroundImage = await localFM.
                               readImage(path+'backgroundImage')
    }
    else if(isBackgroundColor == 'color') {
      setColor(0, Number(settingJSON.backgroundColorNumber))
    }
    else if(isBackgroundColor == 'invisible') {
      haveSettingChange = true
      settingJSON.isBackgroundColor = 'background'
      widget.backgroundImage = await localFM.
                               readImage(path+'backgroundImage')
      let iCloud = FileManager.iCloud()
      let filePath = iCloud.joinPath(iCloud.documentsDirectory(),
                                    '투명 위젯 설정.js')
      if(iCloud.fileExists(filePath)) iCloud.remove(filePath)
    }
  }


  // Set contents' color.
  if(settingJSON.contentColor == null ||
     changeAttribute == 6 || changeAttribute == 3) {
    haveSettingChange = true
    let alert = await setColor(1,-1)
    settingJSON.contentColor = alert+''
  }
  else {
    await setColor(1, Number(settingJSON.contentColor))
  }

  // Set widget size.
  if(settingJSON.widgetSize == null ||
     changeAttribute == 6 || changeAttribute == 4) {
    haveSettingChange = true
    VIEW_MODE = 1 + await setAlert(
                     ['작은 사이즈 위젯','중간 사이즈 위젯','큰 사이즈 위젯'],
                     '위젯 크기 설정',
                     '사용할 위젯의 크기를 선택하세요')
    settingJSON.widgetSize = VIEW_MODE+''
  }
  else { VIEW_MODE = Number(settingJSON.widgetSize) }

  // Set widget components if widget size is large.
  if(settingJSON.largeWidgetSetting == null ||
     VIEW_MODE == 3 &&
     (changeAttribute == 6 || changeAttribute == 4)) {
    haveSettingChange = true
    let result = await setAlert(['달력 띄우기', '달력 띄우지 않기'],
                            '큰 사이즈 위젯 설정',
                            '큰 사이즈 위젯의 구성을 설정합니다.'
                            + '\n큰사이즈 위젯에는 "달력", "캘린더 일정", '
                            + '"미리알림 일정"을 나타낼 수 있습니다.')

    showCalendar[2] = result==0 ? true : false

    result = await setAlert(['캘린더 일정만 표시', '미리알림 일정만 표시',
                            '캘린더와 미리알림 모두 표시'],
                            '일정 선택')
    if(result == 2) showCalendar[0] = showCalendar[1] = true
    else {
      showCalendar[result] = true
      showCalendar[1-result] = false
    }

    settingJSON.largeWidgetSetting = showCalendar.toString()

    if(showCalendar[0]) {
      result = await setAlert(['오늘 일정만 보기','이번 주 일정 보기',
                               '7일간 일정 보기','이번 달 일정 보기'],
                              '캘린더 일정 설정')
      if(result == 0) calendarPeriod = 'today'
      else if(result == 1) calendarPeriod = 'thisWeek'
      else if(result == 2) calendarPeriod = '7days'
      else if(result == 3) calendarPeriod = 'thisMonth'

      settingJSON.calendarPeriod = calendarPeriod
    }

    if(showCalendar[2]) {
      result = await setAlert(['좌측 정렬', '우측 정렬'],
                              '일정/미리알림 배열')
      isCalendarRight = result==0 ? false : true
      settingJSON.isCalendarRight = isCalendarRight.toString()
    }
    else {
      isCalendarRight = false
      settingJSON.isCalendarRight = 'false'
    }
  }
  else if(VIEW_MODE == 3) {
    let array = (settingJSON.largeWidgetSetting).split(',')
    showCalendar[0] = (array[0] == 'true' ? true : false)
    showCalendar[1] = (array[1] == 'true' ? true : false)
    showCalendar[2] = (array[2] == 'true' ? true : false)
    if(showCalendar[0]) calendarPeriod = settingJSON.calendarPeriod
    isCalendarRight = settingJSON.isCalendarRight == 'true'
                      ? true : false
  }

  if(settingJSON.locale == null ||
     changeAttribute == 6 || changeAttribute == 5) {
    haveSettingChange = true
    let result = await setAlert(['한국어','영어'], '언어를 선택하세요')
    if(result == 1) {
      fetchLocale('en')
      settingJSON.locale = 'en'
    }
    else {
      fetchLocale()
      settingJSON.locale = 'kr'
    }
  }
  else {
    if(settingJSON.locale == 'en') fetchLocale('en')
    else fetchLocale()
  }

  if(settingJSON.isBackgroundColor == 'invisible') {
    fetchInvisibleScript()
  }
  // Save changes
  if(!haveSettingFile || haveSettingChange) {
    localFM.writeString(path+'settingJSON',
                        JSON.stringify(settingJSON))
    console.log('Save changed setting')
  }
}
