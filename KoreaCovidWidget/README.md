# 위젯 : 전국 및 특정 지역 코로나19 실시간 현황과 날짜, 배터리 정보, 단축어 바로가기 버튼을 담은 위젯

![widget Image](./image/widget.jpg)

iOS의 *Scriptable* 어플의 위젯에서 작동하는 코드이다. 이 코드는 baisc components와 사용자가추가하는  custom componets로 구성되어 있다.
위 이미지에서는 custom components	에 headphone, QR code, house, dallar의 SF symbol을 가진 버튼들이 추가되어 있다.

## Basic components
기본적으로 위젯을 구성하는 요소들이다.
이 basic componets는 `refreshTime`마다 새로 고침된다. `refreshTime`의 단위는 milisecond이다.
-	날짜
	-	년
	-	월
	-	일
	-	요일
-	배터리 저옵
	-	배터리 percentage를 보여준다.
- 	코로나-19 현황
	-	전국 실시간 확진자
        - 특정지역 실시간 확진자
        - 정부 발표 기준 누적 화긴자
        - 정부 발표 기준 전일 확진자
        - 각 확진 현황 별 전일 대비 증감 수(빨간색/파란색)
-	새로고침 버튼
	-	위 현황들을 수동으로 업데이트 해준다.

## Custom components
새로고침 버튼 옆에 사용자가 버튼을 추가할 수 있다.
*SF symbol*과 *단축어 이름*을 이용하여 버튼을 생성한다.

[코드 수정](bear://x-callback-url/open-note?id=EA3E01E9-3261-4DCA-9F64-D8BE0EED942D-1851-0000034A8B335907&header=Set%20up)이 부분은 코드를 직접 수정하여야 한다.

## Set up

1.	버튼 설정
> - number 변경
	-  `number`는 새로고침 버튼 외의 버튼 개수이다.
	-   아래 추가하는 `items`  row 수 만큼 입력한다.
> - items 항목 변경
>   - Format : `['SF symbol name', 'shortcut name'],`
> 	 -	첫번째 column은 SF symbol의 name이고, 두번째 column은 iOS **Shortcut**의 이름이다.
  	  >> -	둘 다 link이기 때문에 띄어쓰기가 정확해야 한다.
	  >> -	shortcut name은 url로 실행되기 때문에 대/소문자까지 정확해야한다.
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
