// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: blue; icon-glyph: briefcase-medical;
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

  calendarSpacer : 0,     // 캘린더/리마인더 일정 내용 사이 줄간격
  refreshTime : 60 * 10,  // 새로고침 시간(단위 : 초)
};


// ============================================================
// Part : Developer
const
  scriptVersion = 'covid-widget-v4.02',

  localFM = FileManager.local(),
  iCloud = FileManager.iCloud(),
  localDirectory = localFM.documentsDirectory(),
  iCloudDirectory = iCloud.documentsDirectory(),
  path = localFM.joinPath(localDirectory,'Gofo-covid-widget-data-'),

  widget = new ListWidget(),
  dateFormatter = new DateFormatter();

let
  settingJSON = {},
  serverJSON = {},
  calendarJSON = {},
  reminderJSON = {},
  localeJSON = {},

  VIEW_MODE,
  region, contentColor,
  container, box, outbox, stack, batteryBox,

  // About calendar [calendar, reminder, monthly]
  showCalendar = [true, true, true],
  calendarSource = [],
  isCalendarRight = false,
  calendarPeriod;


// Start main code. ==============================================
dateFormatter.locale = 'ko-Kore_KR';

await updateScript();         // 버전확인
await setWidgetAttribute();   // 위젯 설정파일 읽기
await fetchJSONs();           // BE 데이터 로드

if('error' in serverJSON) {
  console.error("ERROR : 데이터 통신이 원활하지 않습니다.");
} else createWidget();        // 위젯 생성

// 새로고침 설정
widget.refreshAfterDate = new Date(Date.now() + (1000 * userSetting.refreshTime));

widget.setPadding(15,15,15,15);
if(settingJSON.isBackgroundColor !== 'invisible') {
  if(VIEW_MODE === 1) widget.presentSmall();
  else if(VIEW_MODE === 2) widget.presentMedium();
  else widget.presentLarge();
}

// 위젯 등록
Script.setWidget(widget);
Script.complete();


// Function : update =============================================
async function updateScript() {
  const url = 'https://raw.githubusercontent.com/sunung007/Scriptable_Corona/main/version.json';
  const updatePath = iCloud.joinPath(iCloudDirectory, 'Gofo_코로나 위젯 업데이트.js');

  if(iCloud.fileExists(updatePath)) iCloud.remove(updatePath);

  // version check
  const request = await new Request(url).loadJSON();
  const new_version = Number(request.version);
  const cur_version = Number(scriptVersion.substring(14));

  // install update file
  if(new_version > cur_version) {
    const noti = new Notification();
    noti.title = '[Gofo] 코로나 위젯';
    noti.body = '새로운 업데이트 파일이 있습니다. 업데이트를 진행합니다.';
    noti.schedule();

    const update = await new Request(request.path).loadString();
    iCloud.writeString(updatePath, update);
    await WebView.loadURL('scriptable:///run/' + encodeURI('Gofo_코로나 위젯 업데이트'));
  }
}


// Function : create widget ======================================
function createWidget() {
  container = widget.addStack();
  container.layoutVertically();
  outbox = container.addStack();
  outbox.layoutHorizontally();

  box = outbox.addStack();
  box.layoutVertically();
  setDateWidget();

  if(VIEW_MODE === 1) {
    box.addSpacer();
    setWeatherWidget();
    box.addSpacer(2);
    stack = box.addStack(); // change line
    setBatteryWidget();
    box = outbox.addStack();
    setCovidWidget();
    widget.url = URLScheme.forRunningScript();
  }
  else if(VIEW_MODE === 2) {
    box.addSpacer(14);
    setWeatherWidget();
    setBatteryWidget();

    outbox.addSpacer();

    box = outbox.addStack();
    setCovidWidget();

    container.addSpacer();

    outbox = container.addStack();
    box = outbox.addStack();
    setButtonsWidget();
  }
  else if(VIEW_MODE === 3) {
    stack.addSpacer(5);
    batteryBox = container.addStack();
    batteryBox.layoutHorizontally();
    stack = batteryBox;
    setBatteryWidget();

    outbox.addSpacer();
    box = outbox.addStack();
    setWeatherWidget();

    container.addSpacer(14);
    outbox = container.addStack();
    box = outbox.addStack();
    setCovidWidget();

    container.addSpacer(14);
    outbox = container.addStack();
    if(showCalendar[2]) {
      setMonthlyDateWidget();
      outbox.addSpacer(14);
    }
    setCalendarWidget();

    container.addSpacer();
    outbox = container.addStack();
    box = outbox.addStack();
    setButtonsWidget();
  }
}


// Functions create widget's components ==========================
function setDateWidget() {
  let line;
  const date = new Date();

  stack = box.addStack();
  stack.layoutVertically();

  // 년도 + 월
  dateFormatter.dateFormat = localeJSON.year + ' MMM';
  setText(stack, dateFormatter.string(date), userSetting.fontSize.small);

  // 일
  dateFormatter.dateFormat = 'd';
  line = stack.addStack();
  setText(line, dateFormatter.string(date), userSetting.fontSize.date, true);

  // 요일
  dateFormatter.dateFormat = localeJSON.day;
  setText(stack, dateFormatter.string(date), userSetting.fontSize.small);

  if(VIEW_MODE === 2) stack.url = 'calshow://';
}
function setBatteryWidget() {
  const getBatteryImage = (batteryLevel) => {
    if(Device.isCharging()) {
      return SFSymbol.named('battery.100.bolt').image;
    }

    const
      [batteryWidth, batteryHeight] = [87, 41],
      x = batteryWidth * 0.1525,
      y = batteryHeight * 0.247,
      width = batteryWidth * 0.602,
      height = batteryHeight * 0.505,
      current = width * batteryLevel,

      draw = new DrawContext(),
      image = SFSymbol.named("battery.0").image,
      rect = new Rect(0, 0, batteryWidth, batteryHeight),
      barPath = new Path(),
      barRect = new Rect(x, y, current, height);

    draw.opaque = false;
    draw.respectScreenScale = true;
    draw.size = new Size(batteryWidth, batteryHeight);
    draw.drawImageInRect(image,rect);

    // When it gets low, adjust the radius to match.
    let radius = height/6.5;
    if (current < radius*2) radius = current/2;

    // Make the path for the battery level.
    barPath.addRoundedRect(barRect, radius, radius);
    draw.addPath(barPath);
    draw.setFillColor(contentColor);
    draw.fillPath();

    return draw.getImage();
  };

  let line, content;

  // Battery information.
  const batteryLevel = Device.batteryLevel();
  const image = getBatteryImage(batteryLevel);

  line = stack.addStack();
  line.layoutHorizontally();
  line.centerAlignContent();

  // Add, color, and resize battery icon.
  content = line.addImage(image);
  if(Device.isCharging()) {
    content.imageSize = new Size(20, userSetting.fontSize.small);
    content.tintColor = Color.green();
  }
  else {
    content.imageSize = new Size(24, userSetting.fontSize.small);
    if(batteryLevel <= 0.2) content.tintColor = Color.red();
    else content.tintColor = contentColor;
  }

  line.addSpacer(2);
  setText(line, `${Math.floor(batteryLevel*100)}%`, userSetting.fontSize.small);
}
function setCovidWidget() {
  const getRegionInfo = (i, j) => {
    const regionsArr = [
      ['서울', '60', '127'], ['부산', '98', '76' ],
      ['인천', '55', '124'], ['대구', '89', '90' ],
      ['광주', '58', '74' ], ['대전', '67', '100'],
      ['울산', '102', '84'], ['세종', '66', '103'],
      ['경기', '60', '120'], ['강원', '73', '134'],
      ['충북', '69', '107'], ['충남', '68', '100'],
      ['경북', '89', '91' ], ['경남', '91', '77' ],
      ['전북', '63', '89' ], ['전남', '51', '67' ],
      ['제주', '52', '38' ]
    ];
    return (i===0&&dateFormatter.locale==='en') ? localeJSON.regions[j] : regionsArr[j][i];
  };
  const comma = (number) =>
    String(number).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  let line, stackTmp;

  // Get covid data from 'covid-live.com'
  const
    covid = serverJSON.covid,
    currentNum = comma(covid.today[0]),
    currentGap = covid.today[1],
    totalNum = comma(covid.total[0]),
    yesterNum = covid.total[1]===0 ? "취합 중" : covid.total[1],
    yesterGap = covid.total[1]===0 ? covid.yesterday : covid.yesterday - yesterNum,
    regionNum = covid.city[0],
    regionGap = covid.city[1];

  // Add widget.
  if(VIEW_MODE === 1) {
    stack = box.addStack();
    stack.layoutVertically();

    // 전국
    line = stack.addStack();
    line.addSpacer();
    setText(line, localeJSON.country, userSetting.fontSize.extraSmall);

    line = stack.addStack();
    line.addSpacer();
    setText(line, currentNum+'', userSetting.fontSize.medium, true);

    // 줄간격
    stack.addSpacer();

    // 지역명
    line = stack.addStack();
    line.addSpacer();
    setText(line, getRegionInfo(0,region), userSetting.fontSize.extraSmall);

    line = stack.addStack();
    line.addSpacer();
    setText(line, regionNum+'', userSetting.fontSize.medium, true);

    // 줄간격
    stack.addSpacer()

    // 어제
    line = stack.addStack();
    line.addSpacer();
    setText(line, localeJSON.yesterday, userSetting.fontSize.extraSmall);

    line = stack.addStack();
    line.addSpacer();
    setText(line, yesterNum+'', userSetting.fontSize.medium, true);

    return
  }

  box.url = 'https://corona-live.com';

  if(VIEW_MODE === 2) {
    stack = box.addStack();
    stack.layoutVertically();

    const text = dateFormatter.locale==='en' ?
      localeJSON.realtime :
      `${localeJSON.realtime} (${localeJSON.country}/${getRegionInfo(0,region)})`;
    setText(stack, text, userSetting.fontSize.extraSmall);
  }
  else if(VIEW_MODE === 3) {
    stackTmp = box.addStack();
    stackTmp.layoutHorizontally();
    stack = stackTmp.addStack();
    stack.layoutVertically();
    setText(stack, localeJSON.country, userSetting.fontSize.extraSmall);
  }

  // Current realtime patinet number
  // Whole country
  line = stack.addStack();
  if(VIEW_MODE === 2) line.centerAlignContent();
  else if(VIEW_MODE === 3) line.bottomAlignContent();
  setText(line, currentNum+'', userSetting.fontSize.large, true);

  // Compare with yesterday's
  if(VIEW_MODE === 2) setText(line, localeJSON.count, userSetting.fontSize.large);
  if(currentGap > 0) {
    setText(line, ' +' + comma(currentGap), userSetting.fontSize.small, false, userSetting.color.red);
  } else {
    setText(line, ' ' + comma(currentGap), userSetting.fontSize.small, false, userSetting.color.blue);
  }

  // Region
  if(VIEW_MODE === 3) {
     stackTmp = box.addStack();
     stackTmp.layoutHorizontally();
     stackTmp.addSpacer();
     stack = stackTmp.addStack();
     stack.layoutVertically();
     setText(stack, getRegionInfo(0, region), userSetting.fontSize.extraSmall);
   }

  line = stack.addStack();
  if(VIEW_MODE === 2) line.centerAlignContent();
  else if(VIEW_MODE === 3) line.bottomAlignContent();

  setText(line, String(regionNum), userSetting.fontSize.large, true);
  if(VIEW_MODE === 2) setText(line, localeJSON.count, userSetting.fontSize.large);

  // compare with yesterday's
  if(regionGap > 0) {
    setText(line, ' +' + comma(regionGap), userSetting.fontSize.small, false, userSetting.color.red);
  } else {
    setText(line, ' ' + comma(regionGap), userSetting.fontSize.small, false, userSetting.color.blue);
  }


  // Accumulated number on yesterday-basis.
  if(VIEW_MODE === 2) stack.addSpacer(6);
  else if(VIEW_MODE === 3) {
    stackTmp.addSpacer();
    stackTmp = box.addStack();
    stackTmp.layoutHorizontally();
    stack = stackTmp.addStack();
    stack.layoutVertically();
  }
  setText(stack, localeJSON.accumulate, userSetting.fontSize.extraSmall);

  // Total
  line = stack.addStack();
  line.layoutHorizontally();
  if(VIEW_MODE === 2) line.centerAlignContent();
  else if(VIEW_MODE === 3) line.bottomAlignContent();

  setText(line, comma(yesterNum || 0), userSetting.fontSize.large, true);
  if(VIEW_MODE === 2) setText(line, localeJSON.count, userSetting.fontSize.large);

  if(yesterGap !== "" && yesterGap > 0) {
    setText(line, ' +' + comma(yesterGap), userSetting.fontSize.small, false, userSetting.color.red);
  } else {
    setText(line, ' ' + comma(yesterGap), userSetting.fontSize.small, false, userSetting.color.blue);
  }
}
function setButtonsWidget() {
  const btnSize = userSetting.buttonSize;
  stack = box.addStack();
  userSetting.buttons.items.map(button => {
    const icon = stack.addImage(SFSymbol.named(button[0]).image);
    icon.tintColor = contentColor;
    icon.imageSize = new Size(btnSize, btnSize);
    icon.url = button[1].includes("://") ?
      button[1] :
      `shortcuts://run-shortcut?name=${encodeURI(button[1])}`;
    stack.addSpacer(userSetting.buttonSpacer);
  });
}
async function setWeatherWidget() {
  const getWeatherImage = (info) => {
    const icon = SFSymbol.named(info.icon).image;
    const draw = new DrawContext();
    draw.opaque = false;
    draw.respectScreenScale = true;
    draw.drawImageInRect(icon, new Rect(0, 0, info.size[0], info.size[1]));
    return draw.getImage();
  };

  let line, content;
  const weather = serverJSON.weather;
  if(VIEW_MODE !== 3) {
    stack = box.addStack();
    line = stack.addStack();

    // 아이콘
    content = line.addImage(getWeatherImage(weather.icon));
    content.tintColor = contentColor;
    content.imageSize = new Size(16, 15);
    line.centerAlignContent();
    line.addSpacer(2);

    // 온도
    setText(line, weather.temperature, userSetting.fontSize.small);
    line.addSpacer(6);
    line.url = 'http://weather.naver.com';
  }
  else {
    // 아이콘
    content = box.addImage(getWeatherImage(weather.icon));
    content.tintColor = contentColor;
    content.imageSize = new Size(70, 70);
    content.url = 'http://weather.naver.com';

    // 텍스트
    batteryBox.addSpacer();
    const tmp = batteryBox.addStack();
    tmp.layoutVertically();
    const text = serverJSON.region[1] + ' | ' + weather.temperature + ' | ' + weather.sky;
    setText(tmp, text, userSetting.fontSize.extraSmall);
  }
}
function setCalendarWidget() {
  const getContent = (num, json, right=false, isCalendar) => {
    dateFormatter.dateFormat = 'd';

    const draw = new DrawContext();
    draw.opaque = false;
    draw.respectScreenScale = true;
    draw.fillEllipse(new Rect(0, 0, 200, 200));
    const circle = draw.getImage();

    json.slice(0, num).map(entry => {
      line = stack.addStack();
      line.layoutHorizontally();
      line.centerAlignContent();

      // Draw circle
      if(right) line.addSpacer();
      content = line.addImage(circle);
      content.imageSize = new Size(
        userSetting.fontSize.extraSmall-3,
        userSetting.fontSize.extraSmall-9
      );
      content.tintColor = new Color(entry.calendar.color.hex);

      // In calendar set period
      let period = '';
      if(isCalendar && calendarPeriod !== 'today') {
        let startDate = entry.startDate;
        let endDate = entry.endDate;

        if(startDate && endDate) {
          startDate = dateFormatter.string(startDate);
          endDate = dateFormatter.string(endDate);
          if(startDate === endDate) period += startDate; // 당일
          else period = startDate + '-' + endDate;
          period += ' | ';
        }
      }

      // Add text
      content = setText(line, period + entry.title, userSetting.fontSize.extraSmall);
      content.lineLimit = 1;
      stack.addSpacer(userSetting.calendarSpacer);
    });
  }

  let
    line,
    // default : do not show
    maxNum = 3, // max number of line each has
    calendarNum = -1,
    reminderNum = -1,
    calendarLength,
    reminderLength;

  // 0 : calendar / 1 : reminder / 2 : monthly date
  if(!showCalendar[0] || !showCalendar[1]) maxNum = 7;
  if(showCalendar[0]) {
    calendarLength = calendarJSON.length;
    calendarNum = Math.min(calendarLength, maxNum);
  }
  if(showCalendar[1]) {
    reminderLength = reminderJSON.length;
    reminderNum = Math.min(reminderLength, maxNum);
  }
  if(showCalendar[0] && showCalendar[1]) {
    if(calendarNum <= maxNum && reminderLength > maxNum) {
      reminderNum += maxNum - calendarNum;
      reminderNum = Math.min(reminderNum, reminderLength);
    }
    else if(calendarLength > maxNum && reminderNum <= maxNum) {
      calendarNum += maxNum - reminderNum;
      calendarNum = Math.min(calendarNum, calendarLength);
    }
  }

  box = outbox.addStack();
  box.layoutVertically();
  stack = box.addStack();
  stack.layoutVertically();

  // 캘린더
  if(showCalendar[0]) {
    stack.url = 'calshow://';
    line = stack.addStack();
    if(isCalendarRight) line.addSpacer();
    setText(line, localeJSON.calendar,userSetting.fontSize.small, true);
    if(calendarNum === 0) {
      setText(line, ' 0', userSetting.fontSize.small, true, userSetting.color.gray);
    }
    else {
      if(calendarJSON.length > calendarNum) {
        let text = ' +' + (calendarJSON.length-calendarNum);
        setText(line, text, userSetting.fontSize.small, true, userSetting.color.gray);
      }
      stack.addSpacer(userSetting.calendarSpacer);
      getContent(calendarNum, calendarJSON, isCalendarRight, true);
    }
  }

  // 캘린더-리마인더 사이 간격
  if(showCalendar[0] && showCalendar[1]) {
    stack.addSpacer(10);
    stack = box.addStack();
    stack.layoutVertically();
  }

  // 리마인더
  if(showCalendar[1]) {
    stack = box.addStack();
    stack.layoutVertically();
    stack.url = 'x-apple-reminderkit://';
    line = stack.addStack();

    if(isCalendarRight) line.addSpacer();
    setText(line, localeJSON.reminder, userSetting.fontSize.small, true);
    if(reminderNum === 0) {
      setText(line, '0', userSetting.fontSize.small, true, userSetting.color.gray);
    }
    else {
      if(reminderJSON.length > reminderNum) {
        let text = ' +' + (reminderJSON.length-reminderNum);
        setText(line, text, userSetting.fontSize.small, true, userSetting.color.gray);
      }
      stack.addSpacer(userSetting.calendarSpacer);
      getContent(reminderNum, reminderJSON, isCalendarRight, false);
    }
  }
}
function setMonthlyDateWidget() {
  const days = [localeJSON.sun, localeJSON.mon, localeJSON.tue,
                localeJSON.wen, localeJSON.thu, localeJSON.fri,
                localeJSON.sat];
  const width = userSetting.fontSize.monthly*1.4;
  const date = new Date();
  const nowDate = date.getDate();

  date.setDate(1);
  const firstDay = date.getDay();

  date.setMonth(date.getMonth()+1);
  date.setDate(0);
  const lastDate = date.getDate();

  box = outbox.addStack();
  box.url = 'calshow://';
  box.layoutVertically();

  // month
  dateFormatter.dateFormat = 'MMM';
  setText(box, dateFormatter.string(date), userSetting.fontSize.small, true);
  stack = box.addStack();
  stack.layoutHorizontally();

  // 내용
  for(let i = 0 ; i < 7 ; i++) {
    // 줄바꿈
    const line = stack.addStack();
    line.layoutVertically();
    line.size = new Size(width, 0);

    let inline = line.addStack();
    inline.size = new Size(width, 0);
    inline.layoutHorizontally();
    inline.centerAlignContent();

    const color = i===0 ?
      userSetting.color.sunday:
      (i===6 ?
        userSetting.color.saturday:
        null);

    // 요일
    setText(inline, days[i], userSetting.fontSize.monthly, false, color);
    line.addSpacer(5);

    // 공백
    if(i < firstDay) {
      inline = line.addStack();
      inline.size = new Size(width, 0);
      inline.centerAlignContent();
      setText(inline, ' ', userSetting.fontSize.monthly);
      line.addSpacer(4);
    }

    // 날짜
    for(let j = (i<firstDay? 8-firstDay+i : i-firstDay+1) ; j <= lastDate ; j += 7) {
      inline = line.addStack();
      inline.size = new Size(width, 0);
      inline.centerAlignContent();

      if(nowDate === j) {
        setText(inline,j+'',userSetting.fontSize.monthly,true,userSetting.color.red);
      }
      else {
        setText(inline,j+'',userSetting.fontSize.monthly,false,color);
      }
      line.addSpacer(4);
    }
    if(i < 6) stack.addSpacer(4);
  }
}


// Functions for making each widget.=============================
/**
 * BE와 통신 및 캘린더/리마인더 로드
 */
async function fetchJSONs() {
  // 리마인더 정렬 함수(기준 : 날짜)
  const sortReminder = (a, b) => {
    if(a.dueDate === null && b.dueDate === null) {
      return a.creationDate - b.creationDate;
    }
    else if(a.dueDate !== null && b.dueDate === null) {
      return -1
    }
    else if(a.dueDate === null && b.dueDate !== null) {
      return 1
    }
    else return a.dueDate===b.dueDate ?
        a.creationDate-b.creationDate :
        a.dueDate-b.dueDate;
  }

  // 날씨
  console.log("현재 위치를 로드합니다.");
  // Location.setAccuracyToThreeKilometers(); // 위치 정보 로드 시간 단축
  Location.setAccuracyToHundredMeters();
  console.log("현재 위치를 로드합니다.");
  let location;
  while(location === undefined) {
    try {
      location = await Location.current();
    }
    catch {
      location = undefined;
    }
  }
  const [lang, long] = [location.latitude, location.longitude];
  console.log("위치 로드가 완료되었습니다.");

  const url = `https://gofo-corona.herokuapp.com/api?lang=${lang}&long=${long}&region=${region||0}`;
  serverJSON = await new Request(url).loadJSON();

  // 캘린더, 리마인더
  if(VIEW_MODE === 3) {
    try {
      // 달력
      if(showCalendar[0]) {
        let today = new Date();
        let end = new Date();

        today.setHours(0);
        today.setMinutes(0);
        today.setSeconds(0);

        if(calendarPeriod === 'today') {
          calendarJSON = await CalendarEvent.today(calendarSource);
        }
        else {
          if (calendarPeriod === 'thisMonth') {
            end.setMonth(end.getMonth() + 1);
            end.setDate(-1);
          }
          else if (calendarPeriod === 'thisWeek') {
            end.setDate(end.getDate() + 6 - end.getDay());
          }
          else {
            end.setDate(end.getDate() + parseInt(calendarPeriod));
          }
          calendarJSON = await CalendarEvent.between(today, end, calendarSource);
        }
      }

      // 리마인더
      if(showCalendar[1]) {
        reminderJSON = await Reminder.allIncomplete();
        reminderJSON.sort(sortReminder);
      }
    }
    catch {
      console.error('Error : 캘린더/리마인더를 읽을 수 없습니다.');
    }
  }
}


/**
 * 위젯 초기 설정
 */
async function setWidgetAttribute() {
  // 지역 설정에 맞게 언어 변경
  const setLocaleLanguage = (locale) => {
    const fetch = locale === 'en';
    dateFormatter.locale = fetch ? 'en' : 'ko-Kore_KR';

    localeJSON.year       = !fetch ? 'yy년'    : 'y,'
    localeJSON.day        = !fetch ? 'EEEE'    : 'E'
    localeJSON.realtime   = !fetch ? '현재'     : 'Real-time'
    localeJSON.country    = !fetch ? '전국'     : 'Korea'
    localeJSON.accumulate = !fetch ? '어제'     : 'Total'
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
      'Gwangju', 'Daejeon', 'Ulsan', 'Sejong', 'Gyeonggi', 'Gangwon',
      'ChungBuk', 'ChungNam', 'GyeongBuk', 'GyeongNam', 'JeonBuk',
      'JeonNam', 'Jeju'];
  }
  // 잘못 된 설정일 때 설정 스크립트를 실행
  const fetchSettingScript = async (run) => {
    const url = 'https://raw.githubusercontent.com/sunung007/Scriptable_Corona/main/setting.js';
    const filePath = iCloud.joinPath(iCloud.documentsDirectory(), 'Gofo_코로나 위젯 설정.js');

    if(!iCloud.fileExists(filePath)) {
      const request = await new Request(url).loadString();
      console.log('Save setting script.');
      iCloud.writeString(filePath, request);
      run = true;
    }

    if(run) await WebView.loadURL('scriptable:///run/' + encodeURI('Gofo_코로나 위젯 설정'));
  };
  await fetchSettingScript();

  if(!localFM.fileExists(path+'settingJSON')) return await fetchSettingScript(true);

  // 설정 파일 로드
  settingJSON = JSON.parse(localFM.readString(path+'settingJSON'));
  console.log('설정 파일을 로드 성공');

  if(settingJSON.isBackgroundColor === 'invisible' &&
    !localFM.fileExists(path+'backgroundImage')) {
    const noti = new Notification();
    noti.title = '[Gofo] 코로나 위젯';
    noti.body = '투명 설정이 정상적으로 진행되지 않았습니다. 설정을 다시 진행합니다.';
    noti.schedule();

    const scriptPath = iCloud.joinPath(iCloudDirectory, 'Gofo_투명 위젯 설정');
    if(iCloud.fileExists(scriptPath)) {
      await WebView.loadURL(`scriptable:///run/${encodeURI('Gofo_투명 위젯 설정')}`);
    }
    else {
      await fetchSettingScript(true);
    }

    settingModule.invisibleWidget();
    return;
  }


  region = Number(settingJSON.region);
  VIEW_MODE = Number(settingJSON.widgetSize);
  const isBackgroundColor = settingJSON.isBackgroundColor;

  setColor(1, Number(settingJSON.contentColor));
  setLocaleLanguage(settingJSON.locale);

  if(!(isBackgroundColor && VIEW_MODE)) {
    return await fetchSettingScript(true);
  }

  if(VIEW_MODE === 3) {
    showCalendar = settingJSON.largeWidgetSetting.split(',').map(e => e==='true');
    if(showCalendar[0]) calendarPeriod = settingJSON.calendarPeriod
    isCalendarRight = settingJSON.isCalendarRight === 'true'

    try {
      settingJSON.calendarSource.split(',').map(async (e) =>
        calendarSource.push(await Calendar.forEventsByTitle(e)));
    }
    catch {
      const noti = new Notification();
      noti.title = '[Gofo] 코로나 위젯';
      noti.body = '캘린더가 올바르게 지정되지 않았습니다. 다시 지정해주세요.';
      noti.schedule();
      await fetchSettingScript(true);
    }
  }

  // 배경화면
  if(isBackgroundColor === 'bookmark') {
    widget.backgroundImage = await localFM.readImage(settingJSON.bookmark);
  }
  else if(isBackgroundColor === 'background') {
    widget.backgroundImage = await localFM.readImage(path + 'backgroundImage');
  }
  else if(isBackgroundColor === 'color') {
    setColor(0, Number(settingJSON.backgroundColorNumber));
  }
  else if(isBackgroundColor === 'invisible') {
    settingJSON.isBackgroundColor = 'background';
    widget.backgroundImage = await localFM.readImage(path + 'backgroundImage');
    localFM.writeString(path+'settingJSON', JSON.stringify(settingJSON));

    const filePath = iCloud.joinPath(iCloudDirectory, 'Gofo_투명 위젯 설정.js');
    if(iCloud.fileExists(filePath)) iCloud.remove(filePath);
  }
}


/**
 * container에 글자 띄우기
 * @param {container} stack 글자를 띄우려는 container
 * @param {string} text 띄우려는 글자
 * @param {int} size 글자 크기
 * @param {boolean} bold 글자 굵기 여부
 * @param {string} colorHex 글자 색상 코드
 * @returns {stack}
 */
function setText(stack, text, size, bold=false, colorHex=undefined) {
  const content = stack.addText(text);

  try {
    if(userSetting.font.normal === null) throw 'error';
    if(bold) content.font = new Font(userSetting.font.bold, size);
    else content.font = new Font(userSetting.font.normal, size);
  }
  catch(e) {
    if(bold) content.font = Font.boldSystemFont(size);
    else content.font = Font.systemFont(size);
  }

  content.textColor = colorHex ? new Color(colorHex) : contentColor;
  return content;
}

/**
 * 색상 설정(배경, 글자, 아이콘 색상)
 * @param {int} setting 0-위젯 배경 색상 설정, 1-위젯 아이콘/글자 색상 설정
 * @param {int} colorNumber 색상 번호
 */
function setColor(setting, colorNumber) {
  const colorArr = [Color.black(), Color.white(), Color.yellow(), Color.green(), Color.blue()];
  const color = colorArr[
    colorNumber===5 ?
      (Device.isUsingDarkAppearance() ? setting : 1-setting) :
      colorNumber
    ];

  if(setting === 0) widget.backgroundColor = color;
  else if(setting === 1) contentColor = color;
}
