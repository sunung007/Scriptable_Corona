// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: blue; icon-glyph: briefcase-medical;
const localFM = FileManager.local()
const iCloud = FileManager.iCloud()

const directory = localFM.documentsDirectory()
const path = localFM.joinPath(directory,'Gofo-covid-widget-data-')
let settingJSON = {}

if(localFM.fileExists(path+'settingJSON')) {
  settingJSON = JSON.parse(localFM.readString(path+'settingJSON'))
}

// ============================================================

const region_list = ['서울','부산','인천','대구','광주','대전','울산','세종','경기','강원','충북','충남','경북','경남','전북','전남','제주']
const background_list = ['단색으로 설정', '이미지에서 선택', '북마크에서 선택', '새로운 투명위젯']
const color_list = ['검정색','하얀색','노란색','초록색','파란색','시스템']
const size_list = ['작은 크기', '중간 크기', '큰 크기']
const monthly_list = ['보이기', '보이지 않기']
const large_list = ['캘린더만', '리마인더만', '캘린더 + 리마인더']
const align_list = ['왼쪽 정렬', '오른쪽 정렬']
const calendar_list = ['오늘 일정만', '이번 주 일정 보기', '이번 달 일정 보기', '7일간 일정 보기', '30일간 일정 보기', '기타']
let calendar_source_list = []
let calendar_source_status = []
const language_list = ['한국어', '영어']


const all_calendar_source = await Calendar.forEvents()
let saved_calendar_source

if(settingJSON.calendarSource != null) {
  saved_calendar_source = settingJSON.calendarSource.split(',')
}

for(let i in all_calendar_source) {
  calendar_source_list.push(all_calendar_source[i].title)
  for(let j in saved_calendar_source) {
    if(saved_calendar_source[j]==calendar_source_list[i]) {
      calendar_source_status.push(true)
      break
    }
  }
  if(calendar_source_status[i] != true) {
    calendar_source_status[i] = false
  }
}

// ============================================================

let region_change = settingJSON.region == null ?
                    0 : Number(settingJSON.region)
let background_change = settingJSON.isBackgroundColor == null ?
                        0 : settingJSON.isBackgroundColor
let back_color_change = settingJSON.backgroundColorNumber == null ?
                      0 : Number(settingJSON.backgroundColorNumber)
let background_image
let background_bookmark
let content_change = settingJSON.contentColor == null ?
                     0 : Number(settingJSON.contentColor)
let size_change = settingJSON.widgetSize == null ?
                  0 : Number(settingJSON.widgetSize)-1
let large_setting = settingJSON.largeWidgetSetting == null ?
                    ['true','true','true'] :
                    settingJSON.largeWidgetSetting.split(',')
let monthly_change = large_setting[2] == 'true' ? 0 : 1
let large_change
let align_change = settingJSON.isCalendarRight == 'true' ? 1 : 0
let calendar_change = settingJSON.calendarPeriod
let calendar_period = 0
let language_change = settingJSON.locale == 'en' ? 1 : 0

if(background_change == 'color') background_change = 0
else if(background_change == 'background') {
  background_change = 1
  if(localFM.fileExists(path+'backgroundImage')) {
    background_image = await localFM.readImage(path+'backgroundImage')
  }
}
else if(background_change == 'bookmark') {
  background_change = 2
  background_bookmark = settingJSON.bookmark
}
else if(background_change == 'invisible') background_change = 3

if(large_setting[0]=='true' && large_setting[1]=='true') {
  large_change = 2
}
else if(large_setting[0]=='true') large_change = 0
else if(large_setting[1]=='true') large_change = 1

if(calendar_change==null) calendar_change = 0
else if(calendar_change=='today') calendar_change = 0
else if(calendar_change=='thisWeek') calendar_change = 1
else if(calendar_change=='thisMonth') calendar_change = 2
else if(calendar_change=='7days') calendar_change = 3
else if(calendar_change=='30days') calendar_change = 4
else {
  calendar_change = 5
  calendar_period = parseInt(calendar_change)
}

// ============================================================

const table = new UITable()
let rows = []
let row

// ============================================================

const region_row = () => {
  row = new UITableRow()

  const region_left = UITableCell.button('◀️')
  const region_name = UITableCell.button(region_list[region_change])
  const region_right = UITableCell.button('▶️')

  region_left.centerAligned()
  region_name.centerAligned()
  region_right.centerAligned()

  row.addCell(region_left)
  row.addCell(region_name)
  row.addCell(region_right)

  region_left.onTap = () => {
    region_change = region_change==0 ? 13:region_change-1
    rows[4] = region_row()
    refreshAllRows()
  }

  region_name.onTap = async () => {
    region_change = await setAlert(region_list, '코로나 알림 지역 설정')
    rows[4] = region_row()
    refreshAllRows()
  }

  region_right.onTap = () => {
    region_change = (region_change+1) % 17
    rows[4] = region_row()
    refreshAllRows()
  }

  return row
}

const background_row = () => {
  let arr = []

  row = new UITableRow()
  const background_left = UITableCell.button('◀️')
  const background_name = UITableCell.button(background_list[background_change])
  const background_right = UITableCell.button('▶️')

  background_left.centerAligned()
  background_name.centerAligned()
  background_right.centerAligned()

  row.addCell(background_left)
  row.addCell(background_name)
  row.addCell(background_right)

  arr.push(row)


  row = new UITableRow()
  let cell = UITableCell.text('','배경 색상 설정')
  row.addCell(cell)
  if(background_change == 0) arr.push(row)

  row = new UITableRow()
  const color_left = UITableCell.button('◀️')
  const color_name = UITableCell.button(color_list[back_color_change])
  const color_right = UITableCell.button('▶️')

  color_left.centerAligned()
  color_name.centerAligned()
  color_right.centerAligned()

  row.addCell(color_left)
  row.addCell(color_name)
  row.addCell(color_right)

  if(background_change == 0) arr.push(row)


  row = new UITableRow()
  const background_choice = UITableCell.button('선택하기')
  background_choice.centerAligned()
  row.addCell(background_choice)
  if(background_change == 1 || background_change == 2) {
    arr.push(row)
  }


  background_left.onTap = () => {
    background_change = background_change==0 ?
                        3:background_change-1
    rows[7] = background_row()
    refreshAllRows()
  }

  background_name.onTap = async () => {
    background_change = await setAlert(background_list, '배경 설정')
    rows[7] = background_row()
    refreshAllRows()
  }

  background_right.onTap = () => {
    background_change = (background_change+1) % 4
    rows[7] = background_row()
    refreshAllRows()
  }

  color_left.onTap = () => {
    back_color_change = back_color_change==0 ?
                        5:back_color_change-1
    rows[7] = background_row()
    refreshAllRows()
  }

  color_name.onTap = async () => {
    back_color_change = await setAlert(color_list, '배경 색상 설정')
    rows[7] = background_row()
    refreshAllRows()
  }

  color_right.onTap = () => {
    back_color_change = (back_color_change+1) % 6
    rows[7] = background_row()
    refreshAllRows()
  }

  background_choice.onTap = async () => {
    if(background_change == 1) {
      let img = await Photos.fromLibrary()
      if(img != null) background_image = img
    }
    else if(background_change == 2) {
      const allBookmarks = await localFM.allFileBookmarks()
      let list = []
      for(let i in allBookmarks) {
        list.push(allBookmarks[i].name)
      }
      let result = await setAlert(list, '북마크 선택')
      if(result > -1) {
        background_bookmark = localFM.bookmarkedPath(list[result])
      }
    }
  }

  return arr
}

const content_row = () => {
  row = new UITableRow()
  const content_left = UITableCell.button('◀️')
  const content_name = UITableCell.button(color_list[content_change])
  const content_right = UITableCell.button('▶️')

  content_left.centerAligned()
  content_name.centerAligned()
  content_right.centerAligned()

  row.addCell(content_left)
  row.addCell(content_name)
  row.addCell(content_right)

  content_left.onTap = () => {
    content_change = content_change==0 ? 5:content_change-1
    rows[10] = content_row()
    refreshAllRows()
  }

  content_name.onTap = async () => {
    content_change = await setAlert(color_list, '텍스트/아이콘 색상 설정')
    rows[10] = content_row()
    refreshAllRows()
  }

  content_right.onTap = () => {
    content_change = (content_change+1) % 6
    rows[10] = content_row()
    refreshAllRows()
  }

  return row
}

const size_row = () => {
  let arr = []

  row = new UITableRow()
  const size_left = UITableCell.button('◀️')
  const size_name = UITableCell.button(size_list[size_change])
  const size_right = UITableCell.button('▶️')

  size_left.centerAligned()
  size_name.centerAligned()
  size_right.centerAligned()

  row.addCell(size_left)
  row.addCell(size_name)
  row.addCell(size_right)

  arr.push(row)

  // Option in large size.
  if(size_change == 2) {

    // Wheater to show monthly calendar
    row = new UITableRow()
    let cell = UITableCell.text('','월간 달력 설정')
    row.addCell(cell)
    arr.push(row)

    row = new UITableRow()
    const monthly_left = UITableCell.button('◀️')
    const monthly_name = UITableCell.button(monthly_list[monthly_change])
    const monthly_right = UITableCell.button('▶️')

    monthly_left.centerAligned()
    monthly_name.centerAligned()
    monthly_right.centerAligned()

    row.addCell(monthly_left)
    row.addCell(monthly_name)
    row.addCell(monthly_right)

    arr.push(row)


    // Wheater to show calendar and reminder
    row = new UITableRow()
    cell = UITableCell.text('','캘린더/리마인더 설정')
    row.addCell(cell)
    arr.push(row)

    row = new UITableRow()
    const large_left = UITableCell.button('◀️')
    const large_name = UITableCell.button(large_list[large_change])
    const large_right = UITableCell.button('▶️')

    large_left.centerAligned()
    large_name.centerAligned()
    large_right.centerAligned()

    row.addCell(large_left)
    row.addCell(large_name)
    row.addCell(large_right)

    arr.push(row)


    // Calendar components
    row = new UITableRow()
    cell = UITableCell.text('','캘린더 기간 설정')
    row.addCell(cell)
    if(large_change == 0 || large_change == 2) arr.push(row)

    row = new UITableRow()
    const calendar_left = UITableCell.button('◀️')
    const calendar_name = UITableCell.button(calendar_list[calendar_change])
    const calendar_right = UITableCell.button('▶️')

    calendar_left.centerAligned()
    calendar_name.centerAligned()
    calendar_right.centerAligned()

    row.addCell(calendar_left)
    row.addCell(calendar_name)
    row.addCell(calendar_right)

    if(large_change == 0 || large_change == 2) arr.push(row)

    // Calendar period
    row = new UITableRow()
    const calendar_period_left = UITableCell.button('◀️')
    const calendar_period_name = UITableCell.button(calendar_period+'')
    const calendar_period_right = UITableCell.button('▶️')

    calendar_period_left.centerAligned()
    calendar_period_name.centerAligned()
    calendar_period_right.centerAligned()

    row.addCell(calendar_period_left)
    row.addCell(calendar_period_name)
    row.addCell(calendar_period_right)

    if(calendar_change == 5) arr.push(row)


    // Calendar source
    row = new UITableRow()
    cell = UITableCell.text('','캘린더 종류 선택')
    row.addCell(cell)
    if(large_change == 0 || large_change == 2) arr.push(row)

    if(large_change == 0 || large_change == 2) {
      for(let i in calendar_source_list) {
        row = new UITableRow()
        cell = UITableCell.button(calendar_source_list[i] + '  |  ' + (calendar_source_status[i] ? '보기' : '보지않기'))
        cell.centerAligned()
        row.addCell(cell)

        arr.push(row)

        cell.onTap = () => {
          calendar_source_status[i] = !calendar_source_status[i]
          rows[13] = size_row()
          refreshAllRows()
        }
      }
    }


    // Wheater to left align or right align
    row = new UITableRow()
    cell = UITableCell.text('','일정 배열 설정')
    row.addCell(cell)
    if(monthly_change == 0) arr.push(row)

    row = new UITableRow()
    const align_left = UITableCell.button('◀️')
    const align_name = UITableCell.button(align_list[align_change])
    const align_right = UITableCell.button('▶️')

    align_left.centerAligned()
    align_name.centerAligned()
    align_right.centerAligned()

    row.addCell(align_left)
    row.addCell(align_name)
    row.addCell(align_right)

    if(monthly_change == 0) arr.push(row)


    // Listeners
    monthly_left.onTap = () => {
      monthly_change = 1-monthly_change
      rows[13] = size_row()
      refreshAllRows()
    }

    monthly_name.onTap = async () => {
      monthly_change = await setAlert(monthly_list, '달력 설정')
      rows[13] = size_row()
      refreshAllRows()
    }

    monthly_right.onTap = () => {
      monthly_change = 1-monthly_change
      rows[13] = size_row()
      refreshAllRows()
    }

    large_left.onTap = () => {
      large_change = large_change==0 ? 2 : large_change-1
      rows[13] = size_row()
      refreshAllRows()
    }

    large_name.onTap = async () => {
      large_change = await setAlert(large_list, '캘린더/리마인더 설정')
      rows[13] = size_row()
      refreshAllRows()
    }

    large_right.onTap = () => {
      large_change = (large_change+1) % 3
      rows[13] = size_row()
      refreshAllRows()
    }

    calendar_left.onTap = () => {
      calendar_change = calendar_change==0 ? 5 : calendar_change-1
      rows[13] = size_row()
      refreshAllRows()
    }

    calendar_name.onTap = async () => {
      calendar_change = await setAlert(calendar_list, '캘린더 기간 설정')
      rows[13] = size_row()
      refreshAllRows()
    }

    calendar_right.onTap = () => {
      calendar_change = (calendar_change+1) % 6
      rows[13] = size_row()
      refreshAllRows()
    }

    calendar_period_left.onTap = () => {
      if(calendar_period > 0) calendar_period--
      rows[13] = size_row()
      refreshAllRows()
    }

    calendar_period_right.onTap = () => {
      if(calendar_period < 365) calendar_period++
      rows[13] = size_row()
      refreshAllRows()
    }

    align_left.onTap = () => {
      align_change = 1-align_change
      rows[13] = size_row()
      refreshAllRows()
    }

    align_name.onTap = async () => {
      align_change = await setAlert(align_list, '배열 설정')
      rows[13] = size_row()
      refreshAllRows()
    }

    align_right.onTap = () => {
      align_change = 1-align_change
      rows[13] = size_row()
      refreshAllRows()
    }
  }

  size_left.onTap = () => {
    size_change = size_change==0 ? 2:size_change-1
    rows[13] = size_row()
    refreshAllRows()
  }

  size_name.onTap = async () => {
    size_change = await setAlert(size_list, '위젯 크기 설정')
    rows[13] = size_row()
    refreshAllRows()
  }

  size_right.onTap = () => {
    size_change = (size_change+1) % 3
    rows[13] = size_row()
    refreshAllRows()
  }

  return arr
}

const language_row = () => {
  row = new UITableRow()

  const language_left = UITableCell.button('◀️')
  const language_name = UITableCell.button(language_list[language_change])
  const language_right = UITableCell.button('▶️')

  language_left.centerAligned()
  language_name.centerAligned()
  language_right.centerAligned()

  row.addCell(language_left)
  row.addCell(language_name)
  row.addCell(language_right)

  language_left.onTap = () => {
    language_change = 1 - language_change
    rows[16] = language_row()
    refreshAllRows()
  }

  language_name.onTap = async () => {
    language_change = await setAlert(language_list, '언어 선택')
    rows[16] = language_row()
    refreshAllRows()
  }

  language_right.onTap = () => {
    language_change = 1 - language_change
    rows[16] = language_row()
    refreshAllRows()
  }

  return row
}

const save_row = () => {
  row = new UITableRow()
  let cell = UITableCell.text('저장하기')
  cell.titleFont = Font.boldSystemFont(20)
  row.addCell(cell)

  const save = UITableCell.button('저장하기')
  save.rightAligned()
  row.addCell(save)

  save.onTap = async () => {
    if(background_change == 1 && background_image == null) {
      setAlert(['확인'], '배경 사진 설정', '배경 사진을 선택하지 않았습니다.')
      return
    }

    if(background_change == 2 && background_bookmark == null) {
      setAlert(['확인'], '배경 사진 설정', '북마크를 선택하지 않았습니다.')
      return
    }

    if(background_change == 3) {
      const result = await setAlert(['확인','취소'], '투명 위젯 만들기', '"새로운" 홈화면을 이용하여 투명위젯을 만드시겠습니까?')
      if(result == 1) return
    }

    table.removeAllRows()
    table.reload()

    saveSetting()
  }

  return row
}
// ============================================================

main()

// ============================================================

function main() {
  setUITable()
}

// ============================================================

function setUITable() {
  division()

  // title
  let text = '아래 설정을 변경한 후 맨 아래의 "👉저장하기" 버튼을 눌러 적용하세요.'
  addTextRow('코로나 위젯 설정', text)

  division()

  // covid region
  addTextRow('코로나 지역', '실시간 확진자 수를 표기할 지역을 선택하세요.')
  addRow(region_row())

  division()

  // background
  addTextRow('배경', '기존에 투명 위젯을 사용 중이고 홈화면이 바뀌지 않았다면, "이미지에서 선택"으로 설정하세요.')
  addRow(background_row())

  division()

  // text/icon color
  addTextRow('텍스트/아이콘 색상')
  addRow(content_row())

  division()

  // widget size and components
  addTextRow('위젯 크기')
  addRow(size_row())

  division()

  // language
  addTextRow('언어')
  addRow(language_row())

  division()

  // Save button
  addRow(save_row())

  division()

  table.showSeparators = false
  table.present()
}

// ============================================================

async function saveSetting() {
  console.log('새로운 설정을 적용합니다.')

  // Set new setting values.
  let newJSON = {}
  let isInvisible = false

  newJSON.region = region_change.toString()
  newJSON.locale = language_change==0 ? 'kr' : 'en'
  newJSON.contentColor = content_change.toString()
  newJSON.widgetSize = (size_change + 1).toString()

  if(background_change == 0) {
    newJSON.isBackgroundColor = 'color'
    newJSON.backgroundColorNumber = back_color_change
  }
  else if(background_change == 1) {
    newJSON.isBackgroundColor = 'background'
    localFM.writeImage(path+'backgroundImage', background_image)
  }
  else if(background_change == 2) {
    newJSON.isBackgroundColor = 'bookmark'
    newJSON.bookmark = background_bookmark
  }
  else if(background_change == 3) {
    newJSON.isBackgroundColor = 'invisible'
    isInvisible = true
  }

  if(size_change == 2) {
    if(large_change == 1) {
      newJSON.largeWidgetSetting = [false, true]
    }
    else {
      const calendarPeriod = ['today', 'thisWeek', 'thisMonth', '7days', '30days', calendar_period+'days']
      newJSON.largeWidgetSetting = [true, large_change==2]
      newJSON.calendarPeriod = calendarPeriod[calendar_change].toString()

      newJSON.calendarSource = []
      for(let i in calendar_source_list) {
        if(calendar_source_status[i]) {
          newJSON.calendarSource.push(calendar_source_list[i])
        }
      }
    }

    if(monthly_change == 0) {
      newJSON.largeWidgetSetting.push('true')
      newJSON.isCalendarRight = (align_change==1).toString()
    }
    else newJSON.largeWidgetSetting.push('false')

    newJSON.largeWidgetSetting = newJSON.largeWidgetSetting.toString()
    newJSON.calendarSource = newJSON.calendarSource.toString()
  }

  // Save new setting values
  localFM.writeString(path+'settingJSON', JSON.stringify(newJSON))

  // Make notification
  let noti = new Notification()
  noti.title = '[Gofo] 코로나 위젯 설정 완료'
  noti.body = '코로나 위젯 설정이 완료되었습니다.'
  noti.schedule()

  if(isInvisible) fetchInvisibleScript()
  else {
    // Run original script.
    const url = 'scriptable:///run/' + encodeURI('코로나 위젯')
    await WebView.loadURL(url)
  }
}

// ============================================================

function addRow(row) {
  if(row.length > 0) {
    for(let i in row) {
      table.addRow(row[i])
    }
  }
  else {
    table.addRow(row)
  }
  rows.push(row)
}

function addTextRow(title, subtitle) {
  row = new UITableRow()
  cell = UITableCell.text(title, subtitle)
  cell.titleFont = Font.boldSystemFont(20)
  row.addCell(cell)
  addRow(row)
}

function division(isWhite) {
  if(isWhite != true) isWhite = false

  const draw = new DrawContext()
  const rect = new Rect(0,0,2000,2)
  draw.size = new Size(2000,2)

  if(isWhite) draw.setFillColor(Color.white())
  else draw.setFillColor(new Color('575757'))

  draw.fillRect(rect)

  const img = draw.getImage()
  row = new UITableRow()
  row.addImage(img)
  addRow(row)
}

function refreshAllRows() {
  table.removeAllRows()
  for(let i in rows) {
    if(rows[i].length > 0) {
      for(let j in rows[i]) {
        table.addRow(rows[i][j])
      }
    }
    else table.addRow(rows[i])
  }
  table.reload()
}

// ============================================================

async function setAlert(content, title, message) {
  let alert = new Alert()
  if(title != null) alert.title = title
  if(message != null) alert.message = message
  for(let i in content) alert.addAction(content[i])
  return await alert.present()
}

// ============================================================

async function fetchInvisibleScript() {
  let message = '투명 위젯은 배경화면을 위젯의 위치와 크기에 맞게 잘라서 '
                  + '배경으로 사용하여 투명한 것처럼 보이게 하는 것입니다.\n\n'
                + '진행 전 홈화면 편집모드에서 빈 배경화면의 스크린샷을 '
                + '준비해주세요.\n\n'
                +'이후 뜨는 사진 선택에서 빈 배경화면의 사진을 선택해주세요.'
  let result = await setAlert(['취소','확인'],'투명 위젯 만들기',message)
  if(result == 0) return null

  // This source is from mzeryck's code.
  const url = 'https://gist.githubusercontent.com/mzeryck/3a97ccd1e059b3afa3c6666d27a496c9/raw/54587f26d0b1ca7830c8d102cd786382248ff16f/mz_invisible_widget.js';
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
                 + "await WebView.loadURL('scriptable:///run/'"
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
             + 'let widgetSize = "' + widgetSize[size_change]
             + '"\n\n' + cropCode + '\n\n' + tailCode
             + '\n\n' + functions

  console.log('Editing original code is completed.')

  const filePath = iCloud.joinPath(iCloud.documentsDirectory(),
                   'Gofo_투명 위젯 설정.js')
  iCloud.writeString(filePath, file)

  console.log("Save edited code.")

  if(localFM.fileExists(path+'backgroundImage')) {
    localFM.remove(path+'backgroundImage')
  }

  // Run script for making widget invisible.
  await WebView.loadURL('scriptable:///run/'
                  + encodeURI('Gofo_투명 위젯 설정'))
}
