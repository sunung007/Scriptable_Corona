// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: blue; icon-glyph: briefcase-medical;
update()

// Functions ======================================================
async function update() {
  console.log('업데이트를 시작합니다.')

  // file link
  const url = 'https://raw.githubusercontent.com/sunung007/Scriptable_Corona/main/main.js'

  console.log('파일 로드 중...')

  // 새로운 스크립트 파일
  let newFile = await new Request(url).loadString()

  // 새로운 파일의 버전
  let vstart = newFile.indexOf('covid-widget-v')
  let vend = newFile.indexOf("'", vstart)
  let newVersion = newFile.substring(vstart, vend)
  console.log('새로 로드한 파일의 버전 : ' + newVersion)

  // ------------------------------------------------------------

  // 예전 스크립트
  let fileManager = FileManager.iCloud()
  let directory = fileManager.documentsDirectory()
  let path = fileManager.joinPath(directory, '코로나 위젯.js')

  let newScript // 바꿀 새로운 스크립트 부분

  // 파일 확인
  if(!fileManager.isFileStoredIniCloud(path)) {
    console.log('기존에 저장된 스크립트가 없습니다. 새로운 스크립트를 로드합니다.')
  }
  else {
    // 바꿀 예전 스크립트 파일
    let oldFile = fileManager.readString(path)

    // 예전 파일의 버전
    vstart = oldFile.indexOf('covid-widget-v')
    vend = oldFile.indexOf("'", vstart)
    const oldVersion = vstart < 0 ?
      null : oldFile.substring(vstart, vend)
    console.log('현재 버전 : ' + oldVersion)

    if(Number(oldVersion.substring(oldVersion.indexOf('-v')+2))
      < 3.4) {
      return console.log('기존의 파일이 너무 오래된 버전입니다. 기존의 스크립트를 삭제 후 다시 설치해주세요.');
    }

    const oldEnd = oldFile.indexOf("// Part : Developer")
    const newStart = newFile.indexOf("// Part : Developer")

    newScript = oldFile.substring(0,oldEnd) + newFile.substring(newStart);

    // ---------------------------------------------------------

    if(newVersion <= oldVersion) {
      console.log('새로운 업데이트가 없습니다. 업데이트를 종료합니다.')
      return
    }
  }

  // Refetch setting file
  const settingURL = 'https://raw.githubusercontent.com/sunung007/'
    + 'Scriptable_Corona/main/setting.js'
  const settingPath = fileManager.joinPath(directory,
    'Gofo_코로나 위젯 설정.js')
  if(fileManager.fileExists(settingPath)) {
    console.log("기존의 설정 스크립트를 재설치합니다.")
    const settingRequest = await new Request(settingURL)
      .loadString()
    console.log(settingRequest)
    fileManager.writeString(settingPath, settingRequest)
  }

  // 파일 작성
  try {
    fileManager.writeString(path, newScript)
    console.log('성공적으로 업데이트가 종료했습니다.')

    const noti = new Notification();
    noti.title = '[Gofo] 코로나 위젯';
    noti.body = '👉 변경된 내용 알아보기\n https://gofo-coding.tistory.com/entry/코로나-위젯-업데이트-후-변경된-내용';
    noti.schedule();
    
    WebView.loadURL("scriptable:///run/"+encodeURI("코로나 위젯"))
  } catch {
    console.log('업데이트에 실패했습니다.')
  }
}
