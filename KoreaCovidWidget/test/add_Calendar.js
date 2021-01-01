// 개인 변경 부분
// 위젯에 띄울 단축어 버튼들
// itmes 안에는 ['SF symbol name', '단축어 이름']을 넣으세요.
const buttons = {
  number : 4,  // 버튼의 개수
  items : [ // 버튼 내용
    ['headphones', '버즈+지니'],
    ['qrcode', 'QR 체크인'],
    ['house', '집으로 가기'],
    ['dollarsign.circle', '계좌 공유'],
    /*...*/
  ]}

// 배경, 색상, 지역을 변경하려면 true로 설정하세요
// 최초 실행 시 지역, 배경, 글자색 등을 선택하는 창이 뜹니다.
let changeSetting = false


// 위젯 새로고침 시간(단위 : 초)
const refreshTime = 60 * 10

// 아래 사이트에 들어가서 활용 신청한 후
// 발급받은 일반 인증키를 붙여넣으시면 됩니다!
// 웬만하면 발급 받으시는게 좋을겁니다... 터지면 저는 재발급받을테니까요..
// https://data.go.kr/tcs/dss/selectApiDataDetailView.do?publicDataPk=15057682
const appKey = 'e8AFfWnF9M5a355DPc9CSmzWHBW5JhXMfqg7vsEVIcqr9ZaS70Ahr%2FETSdFC1o5TUybHaANphNqbJR0aeZj6dA%3D%3D'





// 여기부터는 건들지 마세요.
// =======================================================
// Do not change from this line.
// Version of this script.
const scriptVersion = 'covid-widget-v2.3'

const colorIncrease = '#F51673'
const colorDecrease = '#2B69F0'
const covidURL = 'https://apiv2.corona-live.com/stats.json'

const fileManager = FileManager.local()
const directory = fileManager.documentsDirectory()
const path = fileManager.joinPath(directory,
                         'Gofo-covid-widget-data-')
                        
let widget = new ListWidget()
let date = new Date()
let dateFormatter = new DateFormatter()

let VIEW_MODE
let covidJSON, weatherJSON, calendarJSON
let region, contentColor
let container, box, outbox, stack

// About weather
let weatherSettingJSON = {}
let forceWeatherChange = false
let useCovidLocation

// About calendar
let showCalendar = [true, true, true]

// Start main code. ==============================================
//fileManager.remove(path+'base_time')
//fileManager.remove(path+'temp')
//fileManager.remove(path+'sky')
//fileManager.remove(path+'rain')
//fileManager.remove(path+'volume')
//fileManager.remove(path+'settingJSON')
//fileManager.remove(path+'weatherSettingJSON')

// Set widget's attributes.
await setWidgetAttribute()


// Bring json datas.
try {covidJSON = await new Request(covidURL).loadJSON()}
catch {console.error('Error : Load covid data')}


try {
  let weatherURL = await getWeatherURL(forceWeatherChange)
  if(weatherURL != null) {
    weatherJSON = await new Request(weatherURL).loadJSON()
  }
}
catch {console.error('Error : Load weather data')}

if(VIEW_MODE == 3) {
  try { calendarJSON = await CalendarEvent.today() }
  catch { console.error('Error : Load calendar data') }
  try { reminderJSON = await Reminder.allIncomplete() }
  catch { console.error('Error : Load reminder data') }
}

// Create a widget.
createWidget()

// Refresh for every minute. Term : 15 minutes.
widget.refreshAfterDate = new Date(Date.now() + 1000*refreshTime)
widget.setPadding(15,15,15,15)

/*if(VIEW_MODE == 1) widget.presentSmall()
else */ if(VIEW_MODE == 2) widget.presentMedium()
else widget.presentLarge()

Script.setWidget(widget)
Script.complete()


// Functions ==================================================
// Functions about widget.-------------------------------------
// Function : create the widget.
function createWidget() {
  container = widget.addStack()
  container.layoutVertically()

  outbox = container.addStack()
  outbox.layoutHorizontally()

  // 1st floor : common
  box = outbox.addStack()
  box.layoutVertically() 
  setDateWidget()    // date
  

  if(VIEW_MODE == 2) {
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
    // 1st floor 
    stack.addSpacer(5)
    setBatteryWidget() // battry
      
    // 1st floor : right
    outbox.addSpacer()
    box = outbox.addStack()
    box.layoutVertically()
    setWeatherWidget() // weather
    
    container.addSpacer(10)
 
    // 2nd floor
    outbox = container.addStack()
    box = outbox.addStack()
    setCovidWidget()   // covid count
    
    container.addSpacer(10)
    
    // 3rd floor
    outbox = container.addStack()
    box = outbox.addStack()
    setCalendarWidget()
    
    container.addSpacer(10) // minimum space
    container.addSpacer()
        
    // 4th floor
    outbox = container.addStack()
    box = outbox.addStack()
    setButtonsWidget()
  }
}


// Function : Set date and battery information.
function setDateWidget() {
  let line, content

  // Date information
  stack = box.addStack()
  stack.layoutVertically()

  // 년도 + 월
  dateFormatter.dateFormat = 'yy년 MMM'
  content = stack.addText(dateFormatter.string(date))
  content.font = Font.regularSystemFont(13)
  content.textColor = contentColor

  // 일
  dateFormatter.dateFormat = 'd'
  line = stack.addStack()
  content = line.addText(dateFormatter.string(date))
  content.font = Font.boldMonospacedSystemFont(32)
  content.textColor = contentColor

  // 요일
  dateFormatter.dateFormat = 'EEEE'
  content = stack.addText(dateFormatter.string(date))
  content.font = Font.systemFont(13)
  content.textColor = contentColor

  stack.url = 'calshow://'
}


// Function : make battery widget.
function setBatteryWidget() {
  let line, content

  // Battery information.
  const batteryLevel = Device.batteryLevel()
  let image = getBatteryImage(batteryLevel)

  line = stack.addStack()
  line.centerAlignContent()

  content = line.addImage(image)

  // Coloring and resize battery icon
  if(Device.isCharging()) {
    content.imageSize = new Size(20, 13)
    content.tintColor = Color.green()
  } else {
    content.imageSize = new Size(24, 13)
    if(batteryLevel*100 < 20) content.tintColor = Color.red()
    else content.tintColor = contentColor
  }
  line.addSpacer(2)

  content = line.addText(Math.floor(batteryLevel*100)+'')
  content.font = Font.systemFont(13)
  content.textColor = contentColor
  content = line.addText('%')
  content.font = Font.systemFont(13)
  content.textColor = contentColor
}

// Function : Set realtime covid patinet number.
function setCovidWidget() {
  let line, content, tstack
  let currentNum, currentGap, regionNum, regionGap
  let totalNum, yesterdayNum

  // Get covid data from 'covid-live.com'
  let overviewData = covidJSON['overview']
  let regionData = covidJSON['current'][region]['cases']

  currentNum = comma(overviewData['current'][0])
  currentGap = overviewData['current'][1]
  totalNum = comma(overviewData['confirmed'][0])
  yesterdayNum = (overviewData['confirmed'][1])
  regionNum = comma(regionData[0])
  regionGap = regionData[1]

  // Add widget.
  if(VIEW_MODE == 3) {
    tstack = box.addStack()
    tstack.layoutHorizontally()

    stack = tstack.addStack()
    stack.layoutVertically()

    content = stack.addText('전국')
    content.textColor = contentColor
    content.font = Font.systemFont(12)
  } else if(VIEW_MODE == 2) {
    stack = box.addStack()
    stack.layoutVertically()

    content = stack.addText('현재 (전국/'+
                             getRegionInfo(0, region)+')')
    content.font = Font.systemFont(12)
    content.textColor = contentColor
  }

  // Current realtime patinet number
  // Whole country
  line = stack.addStack()

  if(VIEW_MODE == 2) line.centerAlignContent()
  else if(VIEW_MODE == 3) line.bottomAlignContent()

  content = line.addText(currentNum+'')
  content.font = Font.boldSystemFont(18)
  content.textColor = contentColor

  if(VIEW_MODE == 2) {
    content = line.addText(' 명')
    content.font = Font.systemFont(18)
    content.textColor = contentColor
  }

  // Compare with yesterday's
  if(currentGap > 0) {
    content = line.addText(' +' + comma(currentGap))
    content.textColor = new Color(colorIncrease)
  } else {
    content = line.addText(' ' + comma(currentGap))
    content.textColor = new Color(colorDecrease)
  }
  content.font = Font.systemFont(12)


  // Region
  if(VIEW_MODE == 3) {
     tstack = box.addStack()
     tstack.layoutHorizontally()
     tstack.addSpacer()
    
     stack = tstack.addStack()
     stack.layoutVertically()
    
     content = stack.addText(getRegionInfo(0, region))
     content.font = Font.systemFont(12)
     content.textColor = contentColor
   }
  
  
  line = stack.addStack()
  if(VIEW_MODE == 2) line.centerAlignContent()
  else if(VIEW_MODE == 3) line.bottomAlignContent()

  content = line.addText(regionNum+'')
  content.font = Font.boldSystemFont(18)
  content.textColor = contentColor

  if(VIEW_MODE == 2) {
    content = line.addText(' 명')
    content.font = Font.systemFont(18)
    content.textColor = contentColor
  }

  // compare with yesterday's
  if(regionGap > 0) {
    content = line.addText(' +' + comma(regionGap))
    content.textColor = new Color(colorIncrease)
  } else {
    content = line.addText(' ' + comma(regionGap))
    content.textColor = new Color(colorDecrease)
  }
  content.font = Font.systemFont(12)


  // Accumulated number on yesterday-basis.
  if(VIEW_MODE == 2) stack.addSpacer(6)
  else if(VIEW_MODE == 3) {
    tstack.addSpacer()
    tstack = box.addStack()
    tstack.layoutHorizontally()

    stack = tstack.addStack()
    stack.layoutVertically()
  }

  content = stack.addText('0시 기준')
  content.font = Font.systemFont(12)
  content.textColor = contentColor

  // Total
  line = stack.addStack()
  line.layoutHorizontally()
  if(VIEW_MODE == 2) line.centerAlignContent()
  else if(VIEW_MODE == 3) line.bottomAlignContent()

  content = line.addText(totalNum + '')
  content.font = Font.boldSystemFont(18)
  content.textColor = contentColor

  if(VIEW_MODE == 2) {
    content = line.addText(' 명')
    content.font = Font.systemFont(18)
    content.textColor = contentColor
  }

  content = line.addText(' +' + comma(yesterdayNum))
  content.textColor = new Color(colorIncrease)
  content.font = Font.systemFont(12)
}


// Function : make buttons.
function setButtonsWidget() {
  const shortcutURL = 'shortcuts://run-shortcut?name='
  let url, button

  // Add renew button.
  stack = box.addStack()
  button = stack.addImage(
                 SFSymbol.named('arrow.clockwise.circle').image)
  button.url = URLScheme.forRunningScript()
  button.tintColor = contentColor
  button.imageSize = new Size(14, 14)

  // Add custom buttons.
  for(let i = 0 ; i < buttons.number ; i++) {
    stack.addSpacer(10)
    button = stack.addImage(
                   SFSymbol.named(buttons.items[i][0]).image)
    button.url = shortcutURL + encodeURI(buttons.items[i][1])
    button.tintColor = contentColor
    button.imageSize = new Size(15, 15)
  }
}


// Functions : make weather widget
function setWeatherWidget() {
  let temp, rain, sky, volume
  
  if(!forceWeatherChange) {
    console.log('Load orninary weather data')  
    temp = weatherSettingJSON.temp
    sky = Number(weatherSettingJSON.sky)
    rain = Number(weatherSettingJSON.rain)
    volume = Number(weatherSettingJSON.volume)
  }
  else {
    console.log('Load new weather data') 
    let response = weatherJSON['response']

    // Error code in loading weather
    let errorCode = response['header']['resultCode']
    if(errorCode != '00') {
      console.error('ERROR in weather loading : ' +
                    response['header']['resultCode'])
      console.error(getWeatherURL())
      if(errorCode == '12' || errorCode == '21') {
        console.error('일시적인 키 오류입니다. 잠시 후 다시 시도해주세요.')
      }
      else if(errorCode == '20' || errorCode == '31') {
        console.error('유효하지 않은 키입니다. 서비스키를 확인해주세요.')
      }
      else if(errorCode == '22') {
        console.eror('서비스 요청 제한 횟수를 초과하였습니다.'
                     + '다음 날부터 정상 이용 가능합니다.')
      }
      return null
    }

    // Extract weather data from JSON file.
    let weatherItems = response['body']['items']['item']
    let totalCount = Number(response['body']['totalCount'])
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
    
    // Save current weather status
    weatherSettingJSON.temp = temp
    weatherSettingJSON.sky = sky+''
    weatherSettingJSON.rain = rain+''
    weatherSettingJSON.volume = volume+''
    fileManager.writeString(path+'weatherSettingJSON', 
                            JSON.stringify(weatherSettingJSON))
    console.log('Save weather setting and log.')
  }
  
  let line, content
  stack = box.addStack()
  line = stack.addStack()

  if(VIEW_MODE == 2) {
    content = line.addImage(getWeatherImage(rain, sky)) // icon
    content.tintColor = contentColor
  
    content.imageSize = new Size(16, 15)
    line.centerAlignContent()
    line.addSpacer(2)
    content = line.addText(temp) // temperature
    content.font = Font.systemFont(13)
    content.textColor = contentColor
    line.addSpacer(6)
    line.url = 'http://weather.naver.com'
  }
  else if(VIEW_MODE == 3) {
    stack.bottomAlignContent()
    stack.size = new Size(60, 0)
    stack.url = 'http://weather.naver.com'
    
    line = stack.addStack()
    line.layoutVertically()

    let inline = line.addStack()
    content = inline.addImage(getWeatherImage(rain, sky)) // icon
    content.tintColor = contentColor
    content.imageSize = new Size(60, 60)
    
    let status = getWeatherStatus(rain, sky)
    let max = temp.length>status.length ? 
              temp.length : status.length
    
    
    inline = line.addStack()
    inline.addSpacer()
    content = inline.addText(temp) // temperature
    content.font = Font.systemFont(12)
    content.textColor = contentColor

    inline = line.addStack()
    inline.addSpacer()
    content = inline.addText(status) // status
    content.font = Font.systemFont(12)
    content.textColor = contentColor
  }
}

function setMonthlyDateWidget() {
  let line, content
  
  box = outbox.addStack()
  stack = box.addStack()
  
  // 월
  line = stack.addStack()
  content = line.addText((date.getMonth()+1) + '월')
  
  // 달력
  line = stack.addStack()
  console.log(date.getDay())
    
}


function setCalendarWidget() {
  let title, color
  let line, content
  let maxNum = 4 // max number of line each has
  
  // default : do not show
  let calendarNum = -1
  let reminderNum = -1
  
  // 0 : calendar / 1 : reminder / 2 : monthly date
  if(showCalendar[2]) maxNum = 3
  if(showCalendar[0]) {
    calendarNum = calendarJSON.length > maxNum 
                  ? maxNum : calendarJSON.length
  }
  if(showCalendar[1]) {
    reminderNum = reminderJSON.length > maxNum
                  ? maxNum : remindJSON.length
  }
  
  stack = box.addStack()
  stack.layoutVertically()

  // Show calendar
  if(calendarNum > 0) {
    //stack.url = 'calshow://'
    line = stack.addStack()
    content = line.addText('일정 ')
    content.textColor = contentColor
    content.font = Font.boldMonospacedSystemFont(13)
    
    if(calendarJSON.length > calendarNum) {
      content = line.addText('+'+(calendarJSON.length-calendarNum))
      content.textColor = new Color(colorIncrease)
      content.font = Font.systemFont(13)
    }
    getCalendarContent(calendarNum, calendarJSON)
  }
  
  // When not show monthly date
  if(!showCalendar[2] && calendarNum > 0 && reminderNum > 0) {
    box.addSpacer(10)
    stack = box.addStack()
    stack.layoutVertically()
  }
  else { stack.addSpacer(10) }
  
  
  // Show reminder
  if(reminderNum > 0) {
    //stack.url = 'calshow://'
    line = stack.addStack()
    content = line.addText('미리알림 ')
    content.textColor = contentColor
    content.font = Font.boldMonospacedSystemFont(13)
    
    if(reminderJSON.length > reminderNum) {
      content = line.addText('+'+(reminderJSON.length-reminderNum))
      content.textColor = new Color(colorIncrease)
      content.font = Font.systemFont(13)
    }
    getCalendarContent(reminderNum, reminderJSON)
  }
  
  // monthly calendar
  if(showCalendar[2]) setMonthlyDateWidget()
}

function getCalendarContent(num, json) {
  for(let i = 0 ; i < num; i++ ) {
    line =  stack.addStack()
    line.topAlignContent()

    // Get title and bar's color from JSON file.
    title = json[i].title
    color = json[i].calendar.color.hex

    let draw = new DrawContext()
    draw.opaque = false
    draw.fillRect(new Rect(0, 0, 100, 1000))

    content = line.addImage(draw.getImage())
    content.imageSize = new Size(10, 16)
    content.tintColor = new Color(color)
    content = line.addText(title)
    content.font = Font.systemFont(13)
    content.textColor = contentColor
  }
}



// Funciton : widget setting ======================================
// Set basic settings of widget.
async function setWidgetAttribute() {
  let haveSettingFile = false
  let haveSettingChange = false
  let changeAttribute = -1
  let settingJSON = {}             
  let alert, isBackgroundColor, isForcedColor, image
                                   
  // If runs in widget, do not change any setting.
  if(!config.runsInApp) changeSetting = false

  // Load settingJSON file.
  try {
    // Remove datas under this version stored in device 
    if(!fileManager.fileExists(path+'settingJSON')) {
      let arr = ['region', 'useCovidLocation', 'isBackgroundColor', 
                 'backgroundColorNumber', 'isForcedColor', 
                 'contentColorNumber', 'widgetSize', 
                 'base_time', 'temp', 'sky', 'rain', 'volume']
      console.log('이전 버전의 데이터를 정리합니다.')
      // remove data
      for(let i in a) {
        if(fileManager.fileExists(path+a[i])) {
          fileManager.remove(path+a[i])
          console.log('Remove ' + a[i])
        }
      }  
      console.log('이전 버전의 불필요 데이터가 삭제되었습니다.')
      throw error
    }
    // Load json file saved setting values.
    console.log('Load setting JSON file.')
    settingJSON = JSON.parse(fileManager.
                             readString(path+'settingJSON'))
    haveSettingFile = true
  }
  catch {
    haveSettingFile = false 
    changeSetting = false
    console.log('There is no setting file.')
    console.log('위젯 설정을 진행합니다.')
  }
  
  

  if(changeSetting) {
    alert = new Alert()
    alert.addAction('코로나 알림 지역 설정')
    alert.addAction('날씨 정보 지역 설정')
    alert.addAction('배경 설정')
    alert.addAction('글씨/아이콘 색상')
    alert.addAction('위젯 크기 변경')
    alert.addAction('전체 초기화')
    if(haveSettingFile) alert.addCancelAction('취소')
    changeAttribute = await alert.present()
  }
  

  // Set region.
  if(settingJSON.region == null || 
     changeAttribute == 5 || changeAttribute == 0) {
    haveSettingChange = true
    
    alert = new Alert()
    alert.title = '코로나 알림 지역 설정'
    alert.message = '실시간 코로나 확진자 현황의 지역을 선택하세요.'
    for(let i = 0 ; i < 17 ; i++) {
      alert.addAction(getRegionInfo(0, i))
    }
    region = await alert.present()
    settingJSON.region = region+''
    if(settingJSON.useCovidLocation == 'true') {
      forceWeatherChange = true
    }
  }
  else { region = Number(settingJSON.region) }
  
  
  // Set weather location
  if(settingJSON.useCovidLocation == null ||
     changeAttribute == 5 || changeAttribute == 1) {
    haveSettingChange = true
    
    alert = new Alert()
    alert.title = '날씨 정보 지역 설정'
    alert.message = '날씨 정보를 얻을 지역 정보를 설정하세요.\n' +
                    '실시간 위치를 사용할 경우 로딩 시간이 길어질 수 있습니다.'
    alert.addAction('실시간 위치 사용')
    alert.addAction('코로나 정보의 위치와 같게 설정')
    if(await alert.present() == 0) {
      settingJSON.useCovidLocation = 'false'
      useCovidLocation = false
    }
    else {
      settingJSON.useCovidLocation = 'true'
      useCovidLocation = true
    }
  }
  else {
    useCovidLocation = settingJSON.useCovidLocation == 'true'
                       ? true : false
  }
  
  
  // Set background.
  if(settingJSON.isBackgroundColor == null ||
     changeAttribute == 5 || changeAttribute == 2) {
    haveSettingChange = true
    
    alert = new Alert()
    alert.title = '위젯 배경 설정'
    alert.message = '배경 유형을 선택하세요.'
    alert.addAction('이미지')
    alert.addAction('원하는 색상으로 강제 고정')
    alert.addAction('자동 설정')
    let result = await alert.present()  
    if(result == 0) {
      image = await Photos.fromLibrary()
      settingJSON.isBackgroundColor = 'background'
      fileManager.writeImage(path+'backgroundImage', image)
      widget.backgroundImage = image
    }
    else if(result == 1) {
      settingJSON.isBackgroundColor = 'color'
      settingJSON.backgroundColorNumber = await setColor(0,-1)
    } 
    else {
      settingJSON.isBackgroundColor = 'auto_color'
      Device.isUsingDarkAppearance()
             ? setColor(0, 0) : setColor(0, 1)
    }
  }
  else {
    isBackgroundColor = settingJSON.isBackgroundColor
    if(isBackgroundColor == 'background') {
      widget.backgroundImage = await fileManager.
                               readImage(path+'backgroundImage')
    }
    else if(isBackgroundColor == 'color') {
      setColor(0, Number(settingJSON.backgroundColorNumber))
    }
    else {
      Device.isUsingDarkAppearance()
             ? setColor(0, 0) : setColor(0, 1)
    }
  }


  // Set contents' color.
  if(settingJSON.isForcedColor == null ||
     changeAttribute == 5 || changeAttribute == 3) {
    haveSettingChange = true
    
    alert = new Alert()
    alert.title = '글씨/아이콘 색상 설정'
    alert.message = '색상 강제 고정 여부를 선택하세요.'
    alert.addAction('원하는 색상으로 강제 고정')
    alert.addAction('자동 설정')
    if(await alert.present() == 0) {
      settingJSON.isForcedColor = 'true'
      settingJSON.contentColorNumber = await setColor(1,-1)
    }
    else {
      settingJSON.isForcedColor = 'false'
      Device.isUsingDarkAppearance() ? 
             setColor(1, 1) : setColor(1, 0)
    }
  }
  else {
    isForcedColor = settingJSON.isForcedColor == 'true'
                    ? true : false
    if(isForcedColor) {
      setColor(1, Number(settingJSON.contentColorNumber))
    }
    else {
      Device.isUsingDarkAppearance()
             ? setColor(1, 1) : setColor(1, 0)
    }
  }
  
  // Set widget size.
  if(settingJSON.widgetSize == null ||
     changeAttribute == 5 || changeAttribute == 4) {
    haveSettingChange = true
    
    alert = new Alert()
    alert.title = '위젯 크기 설정'
    alert.message = '사용할 위젯의 크기를 선택하세요'
    alert.addAction('작은 사이즈 위젯')
    alert.addAction('중간 사이즈 위젯')
    alert.addAction('큰 사이즈 위젯')
    VIEW_MODE = (await alert.present()) + 1
    settingJSON.widgetSize = VIEW_MODE+''
  }
  else { VIEW_MODE = Number(settingJSON.widgetSize) }


  // Save changes
  if(!haveSettingFile || haveSettingChange) {
    fileManager.writeString(path+'settingJSON', 
                            JSON.stringify(settingJSON))
    console.log('Save changed setting')
  } 
}





// Functions for making each widget.---------------------------
function getWeatherStatus(rain, sky) {
  const skyArr = ['맑음', '구름조금', '구름많음', '흐림']
  const rainArr = ['없음', '비', '비/눈', '눈', '소나기', '빗방울',
                   '비/눈', '눈날림']

  if(rain == 0) return skyArr[sky]
  else return rainArr[rain]
}

function getWeatherImage(rain, sky) {
  const iconArr = [
      // 공통
      // 0.흐림, 1.많은비(비,소나기), 2.비/눈(빗방울/눈날림), 3.눈(눈날림),
      'cloud.fill', 'cloud.heavyrain.fill', 'cloud.sleet.fill',
      'snow',
      // 아침
      // 4.맑음 5.구름조금 6.구름많음 7.적은비(비,빗방울)+일반 8.비+구름적음
      'sun.max.fill', null, 'cloud.sun.fill', 'cloud.drizzle.fill',
      'cloud.sun.rain.fill',
      // 저녁
      // 9.맑음 10.구름조금 11.구름많음 12.적은비(비,빗방울)+일반 13.비+구름적음
      'moon.stars.fill', null, 'cloud.moon.fill', 
      'cloud.drizzle.fill', 'cloud.moon.rain.fill'
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
  let currentHour = date.getHours()
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
  draw.setFillColor(Color.black())
  
  return draw.getImage()
}


// Function : Make and return weather request url.
async function getWeatherURL(force) {
  let base_date, base_time, nx, ny
  let weatherURL = 'http://apis.data.go.kr/1360000/'
      + 'VilageFcstInfoService/getUltraSrtFcst?serviceKey='
      + appKey + '&dataType=JSON&numOfRows=0&base_date='
      
  dateFormatter.dateFormat = 'yyyyMMddHH30'

  // Match with api's update time.
  if(date.getMinutes() < 45) {
    let minus = new Date()
    minus.setHours(minus.getHours()-1)
    base_date = dateFormatter.string(minus).substring(0, 8)
    base_time = dateFormatter.string(minus).substring(8)
  }
  else {
    base_date = dateFormatter.string(date).substring(0, 8)
    base_time = dateFormatter.string(date).substring(8)
  }
  

  // Load weather setting JSON file.
  try {
    if(!fileManager.fileExists(path+'weatherSettingJSON')) {
      throw E
    }
    weatherSettingJSON = JSON.parse(fileManager.
                         readString(path+'weatherSettingJSON'))

    if(weatherSettingJSON.base_time == null) { throw E }
                                          
    // if use current location
    if(!useCovidLocation) {
      console.log('Use real-time location as weather location.')
      console.log('Loading current location data...')
      // Get current location.
      let location = await Location.current()
      let lat = location.latitude
      let lon = location.longitude
      
      // Change current location to grid(x, y)
      let grid = changeLocationGrid(lat, lon)
      nx = grid[0]
      ny = grid[1]
    }
      
    if(weatherSettingJSON.nx == null ||
       weatherSettingJSON.ny == null) { throw E }
    else {
      let onx = Number(weatherSettingJSON.nx)
      let ony = Number(weatherSettingJSON.ny)
      if(nx!=onx || ny!=ony) { throw E }
    }
    return null
  }
  catch { forceWeatherChange = true }
 
  forceWeatherChange = true
  
  // Set grid(x, y)
  if(!useCovidLocation 
     && !fileManager.fileExists(path+'weatherSettingJSON')){
    console.log('Use real-time location as weather location.')
    console.log('Loading current location data...')
    // Get current location.
    let location = await Location.current()
    let lat = location.latitude
    let lon = location.longitude
      
    // Change current location to grid(x, y)
    let grid = changeLocationGrid(lat, lon)
    nx = grid[0]
    ny = grid[1]
  }
  if(useCovidLocation) {
    console.log('Use covid location as weather location.')
    nx = getRegionInfo(1, region)
    ny = getRegionInfo(2, region)
  }
        
  // Save changed weather settings
  weatherSettingJSON.nx = nx+''
  weatherSettingJSON.ny = ny+''
  weatherSettingJSON.base_time = base_time+''

  // Return weather URL
  return weatherURL
         + base_date + '&base_time=' + base_time
         +'&nx='+nx+'&ny='+ny
}



// Function : Make and return battery icon.
function getBatteryImage(batteryLevel) {
  if(Device.isCharging()) {
    return SFSymbol.named('battery.100.bolt').image
  }

  const batteryWidth = 87
  const batteryHeight = 41

  let draw = new DrawContext()
  draw.opaque = false
  draw.respectScreenScale = true
  draw.size = new Size(batteryWidth, batteryHeight)
  draw.drawImageInRect(SFSymbol.named("battery.0").image,
                       new Rect(0, 0, batteryWidth, batteryHeight))

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
  barPath.addRoundedRect(new Rect(x, y, current, height),
                         radius, radius)
  draw.addPath(barPath)
  draw.setFillColor(contentColor)
  draw.fillPath()
  
  return draw.getImage()
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
  let regionsArr = [
    ['서울', '60', '127'], ['부산', '98', '76' ],
    ['인천', '55', '124'], ['대구', '89', '90' ],
    ['광주', '58', '74' ], ['대전', '67', '100'],
    ['울산', '102', '84'], ['세종', '66', '103'],
    ['경기', '60', '120'], ['강원', '73', '134'],
    ['충북', '69', '107'], ['충남', '68', '100'],
    ['경북', '89', '91' ], ['경남', '91', '77' ],
    ['전북', '63', '89' ], ['전남', '51', '67' ],
    ['제주', '52', '38' ],
  ]
  return regionsArr[j][i]
}



// Functions -------------------------------------------------
// Function : write ',' for every 3 digit.
function comma(number) {
  return String(number).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// Function : Set widget background color or content color
// Arguments : type - 0(set widget background color)
//                  - 1(set content color)
//             colorNumber - -1(make alert)
//                         others(just change color)
async function setColor(type, colorNumber) {
  let number
  if(colorNumber == -1) {
    let alert = new Alert()
    if(type == 0) alert.title = '위젯 배경 색상 선택'
    else alert.title = '텍스트/아이콘 색상 선택'
    alert.message = '아래에서 색상을 선택하세요.'
    alert.addAction('검정색')
    alert.addAction('하얀색')
    alert.addAction('노란색')
    alert.addAction('초록색')
    alert.addAction('파란색')
    number = await alert.present()
  } else number = colorNumber

  let color
  if(number == 0) color = Color.black()
  else if(number == 1) color = Color.white()
  else if(number == 2) color = Color.yellow()
  else if(number == 3) color = Color.green()
  else if(number == 4) color = Color.blue()

  if(type == 0) widget.backgroundColor = color
  else if(type == 1) contentColor = color
  
  return number + ''
}
