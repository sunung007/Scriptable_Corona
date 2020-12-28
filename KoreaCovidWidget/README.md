Widget : Real-time Korean covid-19 patient number
=================================================

![widget Image](./image/widget.jpg)

This is a widget that runs on 'Scriptable' application in iOS. This widget shows basic items like date, battery and covid-19 patient number, and custom items like buttons like headphone, QR code etc.

Basic components
----------------

-	Date
	-	Year
	-	Month
	-	Date
	-	Day
-	Battery
	-	Showing remaining battery percentage
-	Covid-19
	-	Number of covid-19 patinet in Korea
	-	Accumulated patient number
	-	Increasing or decreasing in comparison to yesterday
-	Refresh button
	-	Updating each components above.

Custom components
-----------------

Each user can add buttons he or she want to, which is linked to Apple's 'Shortcut' application

Set up
------

1.	버튼 설정 
    >- number 변경
	 >> -	`number`는 새로고침 버튼 외의 버튼 개수이다.
	 >> -	즉, 아래 `items` array의 row 개수인 셈이다. -items 항목 변경
	>- items 항목 수정
	  >> - ['SF symbol name', 'shortcut name']
	  >> -	첫번째 column은 SF symbol의 name이고, 두번째 column은 iOS **Shortcut**의 이름이다.
  	  >> -	둘 다 link이기 때문에 띄어쓰기가 정확해야 한다.
	  >> -	shortcut name은 url로 실행되기 때문에 대/소문자까지 정확해야한다.

```
const buttons = {
  number : 04,
  items : [
    ['headphones', '버즈+지니'],
    ['qrcode', 'QR 체크인'],
    ['house', '집으로 가기'],
    ['dollarsign.circle', '계좌 공유'],
  ]
}
```
