// 개인 변경 부분
        // 위젯에 띄울 단축어 버튼들
        // itmes 안에는 ['SF symbol name', '단축어 이름']을 넣으세요.
        const buttons = {
          number : 4,  // 버튼의 개수
          items : [ // 버튼 내용
            ['headphones', '음악'],
            ['qrcode', 'QR 체크인'],
            ['house', '집'],
            ['dollarsign.circle', '계좌'],
            /*...*/
          ]}
    
        // 배경, 색상, 지역을 변경하시려면 true로 바꾸고 실행하세요.
        // 최초 실행 시 지역, 배경, 글자색 등을 선택하는 창이 뜹니다.
        const changeSetting = false
    
        // 위젯 새로고침 시간(단위 : 초)
        const refreshTime = 60 * 10
    
    
    // 여기부터는 건들지 마세요.
    // =======================================================
    // Do not change from this line.
    const colorIncrease = '#F51673'
    const colorDecrease = '#2B69F0'
    const covidURL = 'https://apiv2.corona-live.com/stats.json'
    
    
    const fileManager = FileManager.local()
    const directory = fileManager.documentsDirectory()
    
    let widget = new ListWidget()
    let date = new Date()
    let dateFormatter = new DateFormatter()
    
    let covidJSON, weatherJSON
    let region
    let contentColor
    let container, box, stack
    
    
    // Set widget's attributes.
    await setWidgetAttribute()
    
    // Bring json data.
    covidJSON = await new Request(covidURL).loadJSON()
    weatherJSON = await new Request(getWeatherURL()).loadJSON()
    
    // Create a widget.
    createWidget()
    
    // Refresh for every minute. Term : 15 minutes.
    widget.refreshAfterDate = new Date(Date.now() + 1000*refreshTime)
    widget.setPadding(0,0,0,0)
    widget.presentMedium()
    
    Script.setWidget(widget)
    Script.complete()
    
    
    // Functions ==================================================
    // Functions about widget.-------------------------------------
    // Set basic settings of widget.
    async function setWidgetAttribute() {
      let alert
      let changeAttribute = -1 //= [false, false, false, false, false]
      let path = fileManager.joinPath(directory,
                             'Gofo-covid-widget-data-')
    
      let isBackgroundColor, image, isForcedColor
    
      if(changeSetting) {
        alert = new Alert()
        alert.addAction('지역 설정')
        alert.addAction('배경 설정')
        alert.addAction('글씨/아이콘 색상')
        alert.addAction('전체 초기화')
        alert.addCancelAction('취소')
        changeAttribute = await alert.present()
      }
    
      // Set region.
      if(!fileManager.fileExists(path+'region')
         || changeAttribute == 3 || changeAttribute == 0) {
        alert = new Alert()
        alert.title = '지역 설정'
        alert.message = '실시간 코로나 확진자 현황의 지역을 선택하세요.'
        for(let i = 0 ; i < 17 ; i++) {
          alert.addAction(getRegionInfo(0, i))
        }
        region = await alert.present()
        fileManager.writeString(path+'region', region+'')
      } else {
        region = Number(fileManager.readString(path+'region'))
      }
    
      // Set background.
      if(!fileManager.fileExists(path+'isBackgroundColor') ||
         changeAttribute == 3 || changeAttribute == 1) {
        alert = new Alert()
        alert.title = '위젯 배경 설정'
        alert.message = '배경 유형을 선택하세요.'
        alert.addAction('색상')
        alert.addAction('이미지')
        if(await alert.present() == 0) {
          fileManager.writeString(path+'isBackgroundColor', 'true')
          fileManager.writeString(path+'backgroundColorNumber',
                        await setColor(0,-1))
        } else {
          image = await Photos.fromLibrary()
          console.log(1)
          fileManager.writeString(path+'isBackgroundColor', 'false')
          fileManager.writeImage(path+'backgroundImage', image)
          widget.backgroundImage = image
        }
      } else {
        isBackgroundColor = fileManager.readString(
                            path+'isBackgroundColor') == 'true' ? 
                            true : false
        if(isBackgroundColor) {
          setColor(0, Number(fileManager.
              readString(path+'backgroundColorNumber')))
        } else {
          widget.backgroundImage = await fileManager.
              readImage(path+'backgroundImage')
        }
      }
    
      // Set contents' color.
      if(!fileManager.fileExists(path+'isForcedColor') ||
         changeAttribute == 3 || changeAttribute == 2) {
        alert = new Alert()
        alert.title = '글씨/아이콘 색상 설정'
        alert.message = '색상 강제 고정 여부를 선택하세요.'
        alert.addAction('원하는 색상으로 강제 고정')
        alert.addAction('자동 설정')
        if(await alert.present() == 0) {
          fileManager.writeString(path+'isForcedColor', 'true')
          fileManager.writeString(
              path+'contentColorNumber', await setColor(1,-1))
        } else {
          fileManager.writeString(path+'isForcedColor', 'false')
          Device.isUsingDarkAppearance() ?
                 setColor(1, 0) : setColor(1, 1)
        }
      } else {
        isForcedColor = fileManager.
                        readString(path + 'isForcedColor') == 'true' ? 
                        true : false
        if(isForcedColor) {
          setColor(1, Number(fileManager.
            readString(path + 'contentColorNumber')))
        } else {
          Device.isUsingDarkAppearance() ? 
                 setColor(1, 0) : setColor(1, 1)
        }
      }
    }
    
    // Function : create the widget.
    function createWidget() {
      container = widget.addStack()
      container.layoutHorizontally()
    
      // 1. Left
      box = container.addStack()
      box.layoutVertically()
    
      setDateWidget()    // date
      setBatteryWidget() // battry
      
      box.addSpacer(14)
      
      setButtonsWidget() // buttons
    
      container.addSpacer(40)
      
      
      // 2. Right
      box = container.addStack()
      box.layoutVertically()
      
      setCovidWidget()   // covid count
      box.addSpacer(8)
      setWeatherWidget() // weather
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
      content.font = Font.caption1()
      content.textColor = contentColor
    
      // 일
      dateFormatter.dateFormat = 'd'
      line = stack.addStack()
      content = line.addText(dateFormatter.string(date))
      content.font = Font.boldSystemFont(32)
      content.textColor = contentColor
      stack.addSpacer(4)
    
      // 요일
      dateFormatter.dateFormat = 'EEEE'
      content = stack.addText(dateFormatter.string(date))
      content.font = Font.systemFont(16)
      content.textColor = contentColor
      stack.addSpacer(8)
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
        content.imageSize = new Size(25, 14)
        content.tintColor = Color.green()
        line.addText(' ')
      } else {
        content.imageSize = new Size(35, 14)
        if(batteryLevel*100 < 20) content.tintColor = Color.red()
        else content.tintColor = contentColor
      }
    
      content = line.addText(Number(batteryLevel*100).toFixed(0) + '%')
      content.font = Font.systemFont(14)
      content.textColor = contentColor
    }
    
    // Function : Set realtime covid patinet number.
    function setCovidWidget() {
      let line, content
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
    
      stack = box.addStack()
      stack.layoutVertically()
    
      // Current realtime patient
      content = stack.addText('현재 (전국/'+getRegionInfo(0, region)+')')
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
    
      content = line.addText(' +' + comma(yesterdayNum))
      content.textColor = new Color(colorIncrease)
      content.font = Font.systemFont(14)
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
      button.imageSize = new Size(15, 15)
    
      // Add custom buttons.
      for(let i = 0 ; i < buttons.number ; i++) {
        stack.addSpacer(12)
        button = stack.addImage(
                       SFSymbol.named(buttons.items[i][0]).image)
        button.url = shortcutURL + encodeURI(buttons.items[i][1])
        button.tintColor = contentColor
        button.imageSize = new Size(15, 15)
      }
    }
    
    // Functions : make weather widget
    function setWeatherWidget() {
      let response = weatherJSON['response']
    
      // Error code in loading weather//
      if(response['header']['resultCode'] != '00') {
        console.error('ERROR in weather loading : ' + response['header']['resultCode'])
        console.error(getWeatherURL())
        return null
      }
    
      // Extract weather data from JSON file.
      let weatherItems = response['body']['items']['item']
      let totalCount = Number(response['body']['totalCount'])
      let fcstTime = weatherItems[0].fcstTime
      let temp, rain, sky, volume
    
      for(let i in weatherItems) {
        if(weatherItems[i].fcstTime == fcstTime) {
          let category = weatherItems[i].category
          if(category == 'T1H') {
            temp = weatherItems[i].fcstValue+'℃'
          } else if(category == 'SKY') {
            sky = Number(weatherItems[i].fcstValue) -1
          } else if(category == 'PTY') {
            rain = weatherItems[i].fcstValue
          } else if(category == 'RN1') {
            volume = weatherItems[i].fcstValue
          }
        }
      }
      
      let line, content
      stack = box.addStack()
      line = stack.addStack()
      line.centerAlignContent()
      content = line.addImage(getWeatherImage(rain, sky)) // icon
      content.imageSize = new Size(20, 20)
      content.tintColor = contentColor
      
      line.addSpacer(4)
      
      content = line.addText(temp) // temperature
      content.font = Font.systemFont(14)
      content.textColor = contentColor  
      
      /*
      content = line.addText(getWeatherStatus(rain, sky)) // status
      content.font = Font.systemFont(12)
      content.textColor = contentColor  
      */
    
    }
    
    // Functions for making each widget.---------------------------
    function getWeatherStatus(rain, sky) {
      const skyArr = ['맑음', '구름조금', '구름많음', '흐림']
      const rainArr = ['없음', '비', '비/눈', '눈', '소나기', '빗방울',
                       '빗방울/눈날림', '눈날림']
    
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
          'sun.max.fill', null, 'cloud.sun.fill', 'cloud.drizle.fill',
          'cloud.sun.rain.fill',
          // 저녁
          // 9.맑음 10.구름조금 11.구름많음 12.적은비(비,빗방울) 13.비+구름적음
          'moon.stars.fill', null, 'cloud.moon.fill',
          'cloud.moon.rain.fill']
    
      let iconIndex
    
      if(rain == 0) { // 맑음, 구름조금, 구름많음, 흐림(공통)
        if(sky == 3) iconIndex = 0
        else iconIndex = sky + 4
      } else {
        if(rain == 3 || rain == 7) { // 눈(공통)
          iconIndex = 3
        } else if(rain == 2 || rain == 6) { // 비+눈(공통)
          iconIndex= 2
        } else { // 비
          if(sky < 2) { // 비+구름적음
            iconIndex = 8
          } else if(volume > 5) { // 많은 비
            iconIndex = 1
          } else { // 적은 비
            iconIndex = 7
          }
        }
      }
    
      // A icon that is changed as time. (ex: sun -> moon)
      let currentHour = date.getHours()
      if((currentHour<7||currentHour>18) && iconIndex>3) iconIndex += 5
    
      return SFSymbol.named(iconArr[iconIndex]).image
    }
    
    // Function : Make and return weather request url.
    function getWeatherURL(numberOfRows) {
      let weatherURL = 'http://apis.data.go.kr/1360000/VilageFcstInfoService/getUltraSrtFcst?serviceKey=e8AFfWnF9M5a355DPc9CSmzWHBW5JhXMfqg7vsEVIcqr9ZaS70Ahr%2FETSdFC1o5TUybHaANphNqbJR0aeZj6dA%3D%3D&dataType=JSON&numOfRows=0&base_date='
    
      let base_date, base_time, nx, ny
      dateFormatter.dateFormat = 'yyyyMMddHH30'
    
      // Match with api's update time.
      if(date.getMinutes() < 45) {
        let minus = new Date()
        minus.setHours(minus.getHours()-1)
        base_date = dateFormatter.string(minus).substring(0, 8)
        base_time = dateFormatter.string(minus).substring(8)
      } else {
        base_date = dateFormatter.string(date).substring(0, 8)
        base_time = dateFormatter.string(date).substring(8)
      }
    
      // Bring from array.
      nx = getRegionInfo(1, region)
      ny = getRegionInfo(2, region)
    
      // Make url
      weatherURL += base_date+'&base_time='+base_time
          +'&nx='+nx+'&ny='+ny
      return weatherURL
    }
    
    // Function : Make and return battery icon.
    function getBatteryImage(batteryLevel) {
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
    
      // Determine the width and radius of the battery level.
      const current = width * batteryLevel
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
    
    // Function : Return region's name
    // type : (0 : name), (1 : x), (2 : y)
    function getRegionInfo(i, j) {
      let regionsArr = [
        ['서울', '60', '127'],
        ['부산', '98', '76'],
        ['인천', '55', '124'],
        ['대구', '89', '90'],
        ['광주', '58', '74'],
        ['대전', '67', '100'],
        ['울산', '102', '84'],
        ['세종', '66', '103'],
        ['경기', '60', '120'],
        ['강원', '73', '134'],
        ['충북', '69', '107'],
        ['충남', '68', '100'],
        ['경북', '89', '91'],
        ['경남', '91', '77'],
        ['전북', '63', '89'],
        ['전남', '51', '67'],
        ['제주', '52', '38'],
      ]
      return regionsArr[j][i]
    }
    
    // Functions -------------------------------------------------
    // Function : write ',' for every 3 digit.
    function comma(number) {
      number += ''
      return number.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    }
    
    // Function : Set widget background color or content color
    // Arguments : type - 0(set widget background color)
    //                  - 1(set content color)
    //             makeAlert - -1(make alert)
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
      switch (number) {
        case 0 :
          color = Color.black()
          break
        case 1 :
          color = Color.white()
          break
        case 2 :
          color = Color.yellow()
          break
        case 3 :
          color = Color.green()
          break
        case 4 :
          color = Color.blue()
          break
        default :
          return
          break
      }
    
      switch (type) {
        case 0 :
          widget.backgroundColor = color
          break
        case 1 :
          contentColor = color
          break
      }
    
      return number + ''
    }
