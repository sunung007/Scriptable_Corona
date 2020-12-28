# 위젯 : 전국 및 특정 지역 코로나19 실시간 현황과 날짜, 배터리 정보, 단축어 바로가기 버튼을 담은 위젯

<img src="./image/widget.jpg" width="40%" height="30%" title="Widget Image" alt="Widget Image"></img>

iOS의 *Scriptable* 어플의 위젯에서 작동하는 코드입니다.
이 코드는 baisc components와 사용자가 추가하는  custom componets로 구성되어 있습니다.
위 이미지에서는 custom components에 headphone, QR code, house, dallar의 SF symbol을 가진 버튼들이 추가되어 있습니다.

최초 실행 시 변경해야 하는 사항 안내는 [여기](https://github.com/sunung007/IosScriptable/blob/main/KoreaCovidWidget/README.md#최초-사용-시-설정-항목--단축어-바로가기-버튼-수정, "first")를 눌러주세요.

## Basic components
기본적으로 위젯을 구성하는 요소들입니다.
이 basic componets는 `refreshTime`마다 새로 고침되며,  `refreshTime`의 단위는 milisecond입니다.
-	날짜
	-	년
	-	월
	-	일
	-	요일
-	배터리 정보
	-	배터리 percentage를 보여줍니다.
- 	코로나-19 현황
	-	전국 실시간 확진자
        - 특정지역 실시간 확진자
        - 정부 발표 기준 누적 화긴자
        - 정부 발표 기준 전일 확진자
        - 각 확진 현황 별 전일 대비 증감 수(빨간색/파란색)
-	새로고침 버튼
	-	위 현황들을 수동으로 업데이트 합니다.

## Custom components
새로고침 버튼 옆에 사용자가 버튼을 추가할 수 있습니다.
__SF symbol__과 __단축어 이름__을 이용하여 버튼을 생성합니다.

이 부분은 코드를 직접 수정하여야 합니다.

## Set up
### 최초 사용 시 설정 항목 : 단축어 바로가기 버튼 수정
 - number 변경
   -  `number`는 새로고침 버튼 외의 버튼 개수입니다.
   - 아래 추가하는 `items`  row 수 만큼 입력해야 합니다.
 - items 항목 변경
   - Format : `['SF symbol name', 'shortcut name'],`
   - 첫번째 column은 SF symbol의 name이고, 두번째 column은 iOS **Shortcut**의 이름입니다.
   - 둘 다 띄어쓰기가 정확해야하며, 특히, 단축어 바로가기가 url scheme를 이용해서 실행되기 때문에 `shorcut name`은  **대/소문자까지 정확**해야합니다.
```
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
```

### 최초 설정 후 변경을 원할 때
#### 배경
  - 기본 background는 기기에 저장되어 있는 이미지를 불러오서 설정합니다. 이를 원하지 않을 경우 `setBackgroundImage`를 `false`로 설정해주세요.
  - background를 이미지로 하는데, 이미지를 변경하고 싶을 경우 `changeBackgroundImage`를 `true`로 변경하세요. 단, 코드 재실행 후 반드시 `false`로 다시 수정해야 합니다. 
	```
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
	```
	
#### 아이콘, 텍스트 색상
  - 최초 실행 시 배경에 어울리는 아이콘, 텍스트 색상을 물어봅니다.
  - 만약 아이콘, 텍스트 색상을 지정하지 않고 싶다면 `forcedColor`를 `false`로 변경해 주세요. 이 경우 다크모드가 사용 중이면 하얀색 색상으로, 그렇지 않다면 검정색으로 지정됩니다.
  - 아이콘/텍스트 색상 지정 후 변경하고 싶다면 `changeContentColor`	를 `true`로 바꿔주세요. 변경 후 재실행하면 색상 선택 창이 뜹니다. 재실행 후 `changeContentColor`의 값을 `false`로 변경해주세요.
	```
	// 2. 내용 색상 --------------------------------------------
	// true : 내용 및 아이콘의 색을 설정합니다.
	//        처음 설정 시 색은 기기의 다크모드 사용 여부에 따라 자동으로 결정됩니다.
	// false : 기본 설정 값
	const forcedColor = true

	// true : 내용 및 아이콘의 색을 변경합니다.
	//        색 변경 후 false로 바꿔야합니다.
	// false : 기본 설정 값
	const changeContentColor = false	
	```

#### 실시간 확진자 정보의 지역 설정
  - 코로나 확진자의 실시간 정보는 전국과 1개 지역이 노출됩니다.
  - 최초 실행 시 지역을 선택하는 창이 자동으로 뜹니다. 그러나 최초 선택 후 지역을 변경하고 싶다면 `changeRegion`을 `true`로 설정해주세요. 설정 후 재실행하면 지역 변경 창이 뜹니다. 재실행 후에는 다시 `false`로 해주세요.
	```
	// 3. 지역 설정 --------------------------------------------
	// true : 전국 실시간 확진자 수와 함께 볼 지역을 '변경'합니다.
	//        처음 설정 시 지역 선택창이 자동으로 뜹니다.
	//        지역 변경 후 false로 바꿔야합니다.
	// false : 기본 설정 값
	const changeRegion = false	
	```

#### 새로고침 시간 설정
  - 기본 새로고침 시간(`refresh time`)은 10분 입니다.
  - `refres time`의 기본 단위는 milisecond입니다.
  - 더 잦은 최신화를 원한다면 `refreshTime`의 값을 줄여 주세요.
  - 분 단위의 최신화를 원할 경우 괄호 안의 숫자만 줄이면 됩니다.
	```
	// 4. 새로고침 시간 -----------------------------------------
	// refresh time(새로고침 시간)을 결정합니다. 단위는 밀리초(ms)입니다.
	// 최초 설정은 10분 입니다.
	// 분 단위 수정은 괄호 안에 있는 숫자만 수정하면 됩니다.
	const refreshTime = 1000 * 60 * (10)	
	```
