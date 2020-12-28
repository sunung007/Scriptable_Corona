

let widget = new ListWidget()
let uiTable = new UITable()

setUiTable()
uiTable.showSeparators = true
uiTable.present()

Script.setWidget(widget)
Script.complete()
widget.presentLarge()

function runShortcuts(number) {
  let url = 'shortcuts://run-shortcut?name='
  switch (number) {
    case 1 : // 버즈+로그인
      url += '%eb%b2%84%ec%a6%88%2b%ec%a7%80%eb%8b%88'
      break
    case 2 : // QR 체크인
      url += 'QR%20%ec%b2%b4%ed%81%ac%ec%9d%b8'
      break
    case 3 : // 집으로 가기
      url += '%ec%a7%91%ec%9c%bc%eb%a1%9c%20%ea%b0%80%ea%b8%b0'
      break
    case 4 : // 계좌 공유
      url += '%ea%b3%84%ec%a2%8c%20%ea%b3%b5%ec%9c%a0'
      break
  }
  Safari.open(url)
}

function setUiTable() {
  let uiRow1, uiRow2
  let uiCell11, uiCell12
  let uiCell21, uiCell22
  
  // Make 2 rows in ui table.
  uiRow1 = new UITableRow()
  uiRow2 = new UITableRow()
  
  // Make buttons with title.
  uiCell11 = UITableCell.button('버즈+지니')
  uiCell12 = UITableCell.button('QR 체크인')
  uiCell21 = UITableCell.button('집으로 가기')
  uiCell22 = UITableCell.button('계좌 공유')
  
  // when each button is touched.
  uiCell11.onTap = () => {
    console.log('1-1 clicked')
    runShortcuts(1)
  }
  uiCell12.onTap = () => {
    console.log('1-2 clicked')
    runShortcuts(2)
  }
  uiCell21.onTap = () => {
    console.log('2-1 clicked')
    runShortcuts(3)
  }
  uiCell22.onTap = () => {
    console.log('2-2 clicked')
    runShortcuts(4)
  }
  
  
  // TODO : Design

  
  uiRow1.addCell(uiCell11)
  uiRow1.addCell(uiCell12)
  uiRow2.addCell(uiCell21)
  uiRow2.addCell(uiCell22)

  uiTable.addRow(uiRow1)
  uiTable.addRow(uiRow2)
}
