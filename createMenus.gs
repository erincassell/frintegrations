function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Process Data').addItem('Parse XML', 'parseFile').addToUi();
}