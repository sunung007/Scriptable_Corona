// 경고창
let alert = new Alert()
alert.title = '코로나 위젯 업데이트'
alert.message = '업데이트 전 기존 스크립트의 이름이 "코로나 위젯"으로 되어있는지 확인해 주십시오.' + '\n이름이 올바르지 않으면 새로운 스크립트를 설치합니다.'
alert.addAction('계속')
alert.addCancelAction('취소')
let result = await alert.present()

// 진행
if(result == 0) update()
else console.log('업데이트 취소')


// Functions ======================================================
async function update() {
  console.log('업데이트를 시작합니다.')
  
  // file link
  const url = 'https://raw.githubusercontent.com/sunung007/IosScriptable/main/KoreaCovidWidget/main.js'
  
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
  let path = fileManager.joinPath(directory, '코로나 위젯_구버전.js')
  
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
       >= 3.4) {
      return console.log('3.4 이전 버전이 아닙니다.')
    }
       
    const new_button_start = newFile.indexOf('number :')
    const new_button_end = newFile.indexOf('}', new_button_start)
    
    const old_button_start = oldFile.indexOf('number : ')
    const old_button_end = oldFile.indexOf('}', old_button_start)
   
    
    const new_appkey_start = newFile.indexOf("'", newFile.indexOf('appKey :'))
    const new_appkey_end = newFile.indexOf("'", new_appkey_start+1)
    
    const old_appkey_start = oldFile.indexOf("'", oldFile.indexOf('const appKey = '))
    const old_appkey_end = oldFile.indexOf("'", old_appkey_start+1)
    
    newScript = newFile.substring(0,new_button_start)
              + oldFile.substring(old_button_start, old_button_end)
              + newFile.substring(new_button_end, new_appkey_start)
              + oldFile.substring(old_appkey_start, old_appkey_end)
              + newFile.substring(new_appkey_end)
    // ---------------------------------------------------------
    
    if(newVersion == oldVersion) {
      console.log('새로운 업데이트가 없습니다. 업데이트를 종료합니다.')
      return
    }
  }

  // 파일 작성
  try {
    const newPath = fileManager.joinPath(directory, '코로나 위젯_3.4버전 업데이트 테스트.js')
    fileManager.writeString(newPath, newScript)
    console.log('성공적으로 업데이트가 종료했습니다.')
  } catch {
    console.log('업데이트에 실패했습니다.')
  }
}
