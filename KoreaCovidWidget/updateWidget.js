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
  const url = 'https://raw.githubusercontent.com/sunung007/IosScriptable/main/KoreaCovidWidget/test/add_Calendar.js'
  
  console.log('파일 로드 중...')
  
  // 새로운 스크립트 파일
  let newFile = await new Request(url).loadString()
  
  // 새로운 파일의 버전
  let vstart = newFile.indexOf('covid-widget-v')
  let vend = newFile.indexOf("'", vstart)
  let newVersion = newFile.substring(vstart, vend)
  console.log('새로 로드한 파일의 버전 : ' + newVersion)
  
  // 바꿀 기준점
  let newIndex = newFile.indexOf('// Do not change from this line.')
  // 바꿀 새로운 스크립트 부분
  let newScript = newFile.substring(newIndex)
  
  // ------------------------------------------------------------
  
  // 예전 스크립트
  let fileManager = FileManager.iCloud()
  let directory = fileManager.documentsDirectory()
  let path = fileManager.joinPath(directory, '코로나 위젯.js')
  
  let tempScript
  
  // 파일 확인
  if(!fileManager.isFileStoredIniCloud(path)) {
    console.log('기존에 저장된 스크립트가 없습니다. 새로운 스크립트를 로드합니다.')
    tempScript = newFile
  } else {
    // 바꿀 예전 스크립트 파일
    let oldFile = fileManager.readString(path)
    
    // 예전 파일의 버전
    vstart = oldFile.indexOf('covid-widget-v')
    vend = oldFile.indexOf("'", vstart)
    let oldVersion = vstart<0 ? 
        null : oldFile.substring(vstart, vend)
    console.log('현재 버전 : ' + oldVersion)
    
    // 바꾸면 안되는 부분(단축어)
    let oldIndex = oldFile.indexOf(
                           '// Do not change from this line.')
    let oldScript = oldFile.substring(0, oldIndex)
    
    // ---------------------------------------------------------
    
    if(newVersion == oldVersion) {
      console.log('새로운 업데이트가 없습니다. 업데이트를 종료합니다.')
      return
    } else {
      // 새로운 스크립트
      tempScript = oldScript + newScript
    }
  }

  // 파일 작성
  try {
    fileManager.writeString(path, tempScript)
    console.log('성공적으로 업데이트가 종료했습니다.')
  } catch {
    console.log('업데이트에 실패했습니다.')
  }
}
