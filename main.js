// Part : user
const userSetting = {
  // 버튼
  buttons  : {    // 위젯 아래의 버튼들
    number : 4,  // 버튼의 개수
    items  : [    // 버튼 내용
      // 형식 : ['SF symbol name', '단축어 이름이나 앱 url scheme']
      ['headphones.circle', '단축어 이름'],
      ['house.circle', '단축어 이름'],
      ['viewfinder.circle', 'kakaotalk://con/web?url=https://accounts.kakao.com/qr_check_in'], // QR 체크인
      ['k.circle', 'kakaopay://'],                // 카카오페이
      ['p.circle', 'photos-redirect://'],         // 사진
      ['pencil.circle', 'mobilenotes://'],        // 메모
      ['envelope.circle', 'message://'],          // 메일
      ['folder.circle', 'shareddocuments://'],    // 파일
      ['circle.grid.2x2', 'App-prefs://'],        // 설정
    ]
  },

  buttonSize   : 20,   // 버튼 크기
  buttonSpacer : 12, // 버튼 사이 간격


  // 글자
  fontSize : {       // 글자 크기
    extraSmall : 12, //코로나 전국,지역명,증감 / 큰사이즈 날씨
    small      : 13, //날짜의 년,월,요일 / 배터리 / 중간사이즈 날씨
    medium     : 16, //작은 사이즈 코로나 정보
    large      : 18, //중간과 큰사이즈 코로나 정보
    date       : 32, //날짜 '일'
    monthly    : 10, //큰사이즈 달력
  },

  font : {
    // 글꼴 : 프로파일 이름과 정확히 일치해야합니다.
    // 프로파일 : 설정 > 일반 > 프로파일
    normal : null,
    bold : null,
  },

  // 색상
  color  : {
    red  : 'F51673',
    blue : '2B69F0',
    gray : '545454',  
    // 월간 달력 색상 : hex값으로 넣으세요.
    saturday : '545454',
    sunday   : '545454',
  },
  
  calendarSpacer : 0, // 캘린더/리마인더 일정 내용 사이 줄간격

  refreshTime : 60 * 10, // 새로고침 시간(단위 : 초)
  
  /*
  아래 사이트에 들어가서 활용 신청한 후 발급받은 일반 인증키를 붙여넣으시면 됩니다!
  웬만하면 발급 받으시는게 좋을겁니다... 터지면 저는 재발급받을테니까요..
  https://data.go.kr/tcs/dss/selectApiDataDetailView.do?publicDataPk=15057682
  */
  appKey : 'e8AFfWnF9M5a355DPc9CSmzWHBW5JhXMfqg7vsEVIcqr9ZaS70Ahr%2FETSdFC1o5TUybHaANphNqbJR0aeZj6dA%3D%3D',
}

// ============================================================
// Part : Developer
const scriptVersion = 'covid-widget-v3.41'

const localFM = FileManager.local()
const iCloud = FileManager.iCloud()

const localDirectory = localFM.documentsDirectory()
const iCloudDirectory = iCloud.documentsDirectory()
const path = localFM.joinPath(localDirectory,'Gofo-covid-widget-data-')

const widget = new ListWidget()
const dateFormatter = new DateFormatter()
dateFormatter.locale = 'ko-Kore_KR'

let settingJSON = {}
let weatherJSON = {}
let covidJSON = {}
let calendarJSON = {}
let reminderJSON = {}
let localeJSON = {}

let VIEW_MODE
let region, contentColor
let container, box, outbox, stack, batteryBox

// About weather
let forceWeatherChange = false
let useCovidLocation

// About calendar [calendar, reminder, monthly]
let showCalendar = [true, true, true]
let calendarSource = []
let isCalendarRight = false
let calendarPeriod

// Start main code. ==============================================
// Check version and update.
await updateScript()

// Set widget's attributes.
await setWidgetAttribute()

// Bring json files.
await fetchJSONs()

// Create a widget.
createWidget()

// Refresh for every minute.
widget.refreshAfterDate = new Date(Date.now() + 
                                  (1000 * userSetting.refreshTime))
widget.setPadding(15,15,15,15)

if(settingJSON.isBackgroundColor != 'invisible') {
  if(VIEW_MODE == 1) widget.presentSmall()
  else if(VIEW_MODE == 2) widget.presentMedium()
  else widget.presentLarge()
}

Script.setWidget(widget)
Script.complete()


// Function : update ============================================
async function updateScript() {
  const url = 'https://raw.githubusercontent.com/sunung007/Scriptable_Corona/main/version.json'
  const updatePath = iCloud.joinPath(iCloudDirectory,
                                     'Gofo_코로나 위젯 업데이트.js')
                                    
  if(iCloud.fileExists(updatePath)) {
    iCloud.remove(updatePath)
  }
  
  // version check
  const request = await new Request(url).loadJSON()
  const new_version = Number(request.version)
  const cur_version = Number(scriptVersion.substring(14))
  
  // install update file
  if(new_version > cur_version) {
    const noti = new Notification()
    noti.title = '[Gofo] 코로나 위젯'
    noti.body = '새로운 업데이트 파일이 있습니다. 업데이트를 진행합니다.'
    noti.schedule()
    
    const update = await new Request(request.path).loadString()
    iCloud.writeString(updatePath, update)
    await WebView.loadURL('scriptable:///run/' 
                          + encodeURI('Gofo_코로나 위젯 업데이트'))
  }
}

// Function : create widget =======================================
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
  setText(stack, dateFormatter.string(date), 
          userSetting.fontSize.small)

  // 일
  dateFormatter.dateFormat = 'd'
  line = stack.addStack()
  setText(line, dateFormatter.string(date),
          userSetting.fontSize.date, true)

  // 요일
  dateFormatter.dateFormat = localeJSON.day
  setText(stack, dateFormatter.string(date), 
          userSetting.fontSize.small)

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
    content.imageSize = new Size(20, userSetting.fontSize.small)
    content.tintColor = Color.green()
  } else {
    content.imageSize = new Size(24, userSetting.fontSize.small)
    if(batteryLevel*100 <= 20) content.tintColor = Color.red()
    else content.tintColor = contentColor
  }

  line.addSpacer(2)

  // Text
  setText(line, Math.floor(batteryLevel*100)+'%',
          userSetting.fontSize.small)
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
    setText(line, localeJSON.country, 
            userSetting.fontSize.extraSmall)
    line = stack.addStack()
    line.addSpacer()
    setText(line, currentNum+'', userSetting.fontSize.medium, true)

    stack.addSpacer() // 줄간격

    // 지역명
    line = stack.addStack()
    line.addSpacer()
    setText(line, getRegionInfo(0,region), 
            userSetting.fontSize.extraSmall)
    line = stack.addStack()
    line.addSpacer()
    setText(line, regionNum+'', userSetting.fontSize.medium, true)

    stack.addSpacer() // 줄간격

    // 어제
    line = stack.addStack()
    line.addSpacer()
    setText(line, localeJSON.yesterday, 
            userSetting.fontSize.extraSmall)
    line = stack.addStack()
    line.addSpacer()
    setText(line, yesterdayNum+'', userSetting.fontSize.medium, 
            true)
    return
  }

  box.url = 'https://corona-live.com'
  if(VIEW_MODE == 2) {
    stack = box.addStack()
    stack.layoutVertically()
    if(dateFormatter.locale == 'en') {
      setText(stack, localeJSON.realtime,
              userSetting.fontSize.extraSmall)
    }
    else {
      const text = localeJSON.realtime
                 + ' ('+localeJSON.country + '/'
                 + getRegionInfo(0,region) + ')'
      setText(stack, text, userSetting.fontSize.extraSmall)
    }
  }
  else if(VIEW_MODE == 3) {
    tstack = box.addStack()
    tstack.layoutHorizontally()
    stack = tstack.addStack()
    stack.layoutVertically()
    setText(stack, localeJSON.country, userSetting.fontSize.extraSmall)
  }

  // Current realtime patinet number
  // Whole country
  line = stack.addStack()
  if(VIEW_MODE == 2) line.centerAlignContent()
  else if(VIEW_MODE == 3) line.bottomAlignContent()
  setText(line, currentNum+'', userSetting.fontSize.large, true)
  if(VIEW_MODE == 2) {
    setText(line, localeJSON.count, userSetting.fontSize.large)
  }

  // Compare with yesterday's
  if(currentGap > 0) {
    setText(line, ' +'+comma(currentGap),
            userSetting.fontSize.small, false, userSetting.color.red)
  } else {
    setText(line, ' '+comma(currentGap),
            userSetting.fontSize.small, false, userSetting.color.blue)
  }

  // Region
  if(VIEW_MODE == 3) {
     tstack = box.addStack()
     tstack.layoutHorizontally()
     tstack.addSpacer()
     stack = tstack.addStack()
     stack.layoutVertically()
     setText(stack, getRegionInfo(0, region),
             userSetting.fontSize.extraSmall)
   }

  line = stack.addStack()
  if(VIEW_MODE == 2) line.centerAlignContent()
  else if(VIEW_MODE == 3) line.bottomAlignContent()

  setText(line, regionNum+'', userSetting.fontSize.large, true)
  if(VIEW_MODE == 2) {
    setText(line, localeJSON.count, userSetting.fontSize.large)
  }

  // compare with yesterday's
  if(regionGap > 0) {
    setText(line, ' +' + comma(regionGap),
            userSetting.fontSize.small, false, userSetting.color.red)
  } else {
    setText(line, ' ' + comma(regionGap),
            userSetting.fontSize.small, false, userSetting.color.blue)
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
  setText(stack, localeJSON.accumulate, userSetting.fontSize.extraSmall)

  // Total
  line = stack.addStack()
  line.layoutHorizontally()
  if(VIEW_MODE == 2) line.centerAlignContent()
  else if(VIEW_MODE == 3) line.bottomAlignContent()

  setText(line, totalNum+'', userSetting.fontSize.large, true)
  if(VIEW_MODE == 2)  {
    setText(line, localeJSON.count, userSetting.fontSize.large)
  }
  setText(line, ' +' + comma(yesterdayNum),
          userSetting.fontSize.small, false, userSetting.color.red)
}

// Make buttons.
function setButtonsWidget() {
  const shortcutURL = 'shortcuts://run-shortcut?name='
  let url, button, image

  stack = box.addStack()
  const buttons = userSetting.buttons
  for(let i = 0 ; i < buttons.number ; i++) {
    image = SFSymbol.named(buttons.items[i][0]).image
    button = stack.addImage(image)
    button.tintColor = contentColor
    button.imageSize = new Size(userSetting.buttonSize, userSetting.buttonSize)
    // If url is url scheme of baisc app
    if(buttons.items[i][1].indexOf('://') < 0) {
      button.url = shortcutURL + encodeURI(buttons.items[i][1])
    }
    else button.url = buttons.items[i][1]
    stack.addSpacer(userSetting.buttonSpacer)
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
    setText(line, temp, userSetting.fontSize.small)
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
    setText(batteryBox, text, userSetting.fontSize.extraSmall)
  }
}

// Make calendar widget shown in large size.
function setCalendarWidget() {
  let title, color, line, content

  // default : do not show
  let maxNum = 3 // max number of line each has
  let calendarNum = -1
  let reminderNum = -1
  let calendarLength, reminderLength

  // 0 : calendar / 1 : reminder / 2 : monthly date
  if(!showCalendar[0] || !showCalendar[1]) maxNum = 7
  if(showCalendar[0]) {
    calendarLength = calendarJSON.length
    calendarNum = calendarLength > maxNum ? maxNum : calendarLength
  }
  if(showCalendar[1]) {
    reminderLength = reminderJSON.length
    reminderNum = reminderLength > maxNum ? maxNum : reminderLength
  }

  if(showCalendar[0] && showCalendar[1]) {
    if(calendarNum <= maxNum && reminderLength > maxNum) {
      reminderNum += maxNum - calendarNum
      if(reminderNum > reminderLength) {
        reminderNum = reminderLength
      }
    }
    else if(calendarLength > maxNum && reminderNum <= maxNum) {
      calendarNum += maxNum - reminderNum
      if(calendarNum > calendarLength) {
        calendarNum = calendarLength
      }
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
    setText(line, localeJSON.calendar,userSetting.fontSize.small, true)
    if(calendarNum == 0) {
      setText(line, ' 0', userSetting.fontSize.small, true, userSetting.color.gray)
    }
    else {
      if(calendarJSON.length > calendarNum) {
        let text = ' +'+(calendarJSON.length-calendarNum)
        setText(line, text, userSetting.fontSize.small, true, userSetting.color.gray)
      }
      stack.addSpacer(userSetting.calendarSpacer)
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
    setText(line, localeJSON.reminder, userSetting.fontSize.small, true)
    if(reminderNum == 0) {
      setText(line, '0', userSetting.fontSize.small, true, userSetting.color.gray)
    }
    else {
      if(reminderJSON.length > reminderNum) {
        let text = ' +'+(reminderJSON.length-reminderNum)
        setText(line, text, userSetting.fontSize.small, true, userSetting.color.gray)
      }
      stack.addSpacer(userSetting.calendarSpacer)
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
  let width = userSetting.fontSize.monthly*1.4
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
  setText(box, dateFormatter.string(date), userSetting.fontSize.small, true)
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

    let color = (i==0?userSetting.color.sunday:(i==6?userSetting.color.saturday:null))

    // 요일
    setText(inline, days[i], userSetting.fontSize.monthly, false, color)
    line.addSpacer(5)

    // 공백
    if(i < firstDay) {
      inline = line.addStack()
      inline.size = new Size(width, 0)
      inline.centerAlignContent()
      setText(inline, ' ', userSetting.fontSize.monthly)
      line.addSpacer(4)
    }

    // 날짜
    let j = (i<firstDay? 8-firstDay+i : i-firstDay+1)
    for( ; j <= lastDate ; j += 7) {
      inline = line.addStack()
      inline.size = new Size(width, 0)
      inline.centerAlignContent()

      if(nowDate == j) {
        setText(inline,j+'',userSetting.fontSize.monthly,true,userSetting.color.red)
      }
      else {
        setText(inline,j+'',userSetting.fontSize.monthly,false,color)
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

  try {
    weatherURL = await getWeatherURL(nx, ny)
    weatherJSON = await new Request(weatherURL).loadJSON()
  }
  catch {
    console.error('Error : Load weather data')
    console.error('URL : ' + weatherURL)
  }


  // Calendar and reminder data.
  if(VIEW_MODE == 3) {
    try {
      // Calendar
      if(showCalendar[0]) {
        let today = new Date()
        let end = new Date()
        today.setHours(0)
        today.setMinutes(0)
        today.setSeconds(0)

        if(calendarPeriod == 'today') {
          calendarJSON = await CalendarEvent.today(calendarSource)
        }
        else if(calendarPeriod == 'thisMonth') {
          end.setMonth(end.getMonth() + 1)
          end.setDate(-1)
          calendarJSON = await CalendarEvent.between(today, end, 
                                             calendarSource)
        }
        else if(calendarPeriod == 'thisWeek') {
          end.setDate(end.getDate() + 6 - end.getDay())
          calendarJSON = await CalendarEvent.between(today, end, 
                                             calendarSource)
        }
        else {
          end.setDate(end.getDate()+parseInt(calendarPeriod))
          calendarJSON = await CalendarEvent.between(today, end, 
                                             calendarSource)
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
    content.imageSize = new Size(userSetting.fontSize.extraSmall-3,
                                 userSetting.fontSize.extraSmall-9)
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
    content = setText(line, period + title, 
                      userSetting.fontSize.extraSmall)
    content.lineLimit = 1
    
    stack.addSpacer(userSetting.calendarSpacer)
  }
}

// Functions about weather -----------------------------------
// Function : Make and return weather request url.
async function getWeatherURL(nx, ny) {
  let weatherURL = 'http://apis.data.go.kr/1360000/'
      + 'VilageFcstInfoService/getUltraSrtFcst?serviceKey='
      + userSetting.appKey + '&numOfRows=60&dataType=JSON&base_date='
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
    if(userSetting.font.normal == null) throw error
    if(bold) content.font = new Font(userSetting.font.bold, size)
    else content.font = new Font(userSetting.font.normal, size)
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


// Function : Set widget background color or content color
// Argument
// {type} 0(set widget background color) - 1(set content color)
// {colorNumber} -1(make alert) others(just change color)
function setColor(type, colorNumber) {
  let color
  if(colorNumber == 5) {
    colorNumber = Device.isUsingDarkAppearance() ?
                  type : 1-type
  }
  if(colorNumber == 0) color = Color.black()
  else if(colorNumber == 1) color = Color.white()
  else if(colorNumber == 2) color = Color.yellow()
  else if(colorNumber == 3) color = Color.green()
  else if(colorNumber == 4) color = Color.blue()

  if(type == 0) widget.backgroundColor = color
  else if(type == 1) contentColor = color
}

// Function : fetch locale to letters.
function setLocaleLanguage(locale) {
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

// Function : write ',' for every 3 digit.
function comma(number) {
  return String(number).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}


// Funciton : widget setting ====================================
// Set basic settings of widget.
async function setWidgetAttribute() {
  fetchSettingScript()
  
  if(!localFM.fileExists(path+'settingJSON')) {
    return fetchSettingScript(true)
  }

  // Load settingJSON file.
  settingJSON = JSON.parse(localFM.readString(path+'settingJSON'))
  console.log('설정 파일을 로드 성공')

  if(settingJSON.isBackgroundColor == 'invisible' &&
     !localFM.fileExists(path+'backgroundImage')) {
    const noti = new Notification()
    noti.title = '[Gofo] 코로나 위젯'
    noti.body = '투명 설정이 정상적으로 진행되지 않았습니다. '
                + '설정을 다시 진행합니다.'
    noti.schedule()

    const scriptPath = iCloud.joinPath(iCloudDirectory,
                                       'Gofo_투명 위젯 설정')
    if(iCloud.fileExists(scriptPath)) {
      await WebView.loadURL('scriptable:///run/'
                            + encodeURI('Gofo_투명 위젯 설정'))
    }
    else fetchSettingScript(true)
    settingModule.invisibleWidget()
    return
  }

  region = Number(settingJSON.region)
  useCovidLocation = settingJSON.useCovidLocation=='true'
  setColor(1, Number(settingJSON.contentColor))
  setLocaleLanguage(settingJSON.locale)
  VIEW_MODE = Number(settingJSON.widgetSize)
  const isBackgroundColor = settingJSON.isBackgroundColor

  if((region + useCovidLocation + isBackgroundColor 
      + VIEW_MODE).indexOf('undefined') >= 0) {
    return fetchSettingScript(true)
  }

  if(VIEW_MODE == 3) {
    let array = (settingJSON.largeWidgetSetting).split(',')
    let calendarList = settingJSON.calendarSource.split(',')
    
    showCalendar[0] = array[0] == 'true'
    showCalendar[1] = array[1] == 'true'
    showCalendar[2] = array[2] == 'true'
    if(showCalendar[0]) calendarPeriod = settingJSON.calendarPeriod
    isCalendarRight = settingJSON.isCalendarRight == 'true'
    
    try {
      for(let i in calendarList) {
        calendarSource.push(await Calendar.forEventsByTitle
                                           (calendarList[i]))
      }
    }
    catch {
      const noti = new Notification()
      noti.title = '[Gofo] 코로나 위젯'
      noti.body = '캘린더가 올바르게 지정되지 않았습니다. 다시 지정해주세요.'
      noti.schedule()
      
      fetchSettingScript(true)
    }
  }

  if(isBackgroundColor == 'bookmark') {
    const image = await localFM.readImage(settingJSON.bookmark)
    widget.backgroundImage = image
  }
  else if(isBackgroundColor == 'background') {
    const image = await localFM.readImage(path+'backgroundImage')
    widget.backgroundImage = image
  }
  else if(isBackgroundColor == 'color') {
    setColor(0, Number(settingJSON.backgroundColorNumber))
  }
  else if(isBackgroundColor == 'invisible') {
    settingJSON.isBackgroundColor = 'background'
    const image = await localFM.readImage(path+'backgroundImage')
    widget.backgroundImage = image

    localFM.writeString(path+'settingJSON',
                        JSON.stringify(settingJSON))

    const filePath = iCloud.joinPath(iCloudDirectory,
                                     'Gofo_투명 위젯 설정.js')
    if(iCloud.fileExists(filePath)) iCloud.remove(filePath)
  }


  async function fetchSettingScript(run) {
    const url = 'https://raw.githubusercontent.com/sunung007/Scriptable_Corona/main/setting.js'
    const filePath = iCloud.joinPath(iCloud.documentsDirectory(),
                                     'Gofo_코로나 위젯 설정.js')

    if(!iCloud.fileExists(filePath)) {
      const request = await new Request(url).loadString()
      console.log('Save setting script.')
      iCloud.writeString(filePath, request)
      run = true
    }

    if(run) {
      await WebView.loadURL('scriptable:///run/'
                            + encodeURI('Gofo_코로나 위젯 설정'))
    }
  }
}
