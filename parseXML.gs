function parseFile() {
  var thisSheet = SpreadsheetApp.getActive();
  var shtID = thisSheet.getId();
  var thisFile = DriveApp.getFileById(shtID);
  var folders = thisFile.getParents(); //Get the parent folder of this file
  
  if(folders.hasNext()) { //If there is a folder
    var folder = folders.next(); //Get the folder
    var txtFiles = folder.getFilesByType(MimeType.PLAIN_TEXT); //Get all of the plain text files in this folder
    var count = 1; //Initiate the file count
    while(txtFiles.hasNext()) {
      var txtFile = txtFiles.next(); //Get the next file
      var txtFileName = txtFile.getName(); //Get the file name
      if(txtFileName.substring(1, 6) != "PARSED") { //If the text file is not marked as PARSED, move on.
        var fileBlob = txtFile.getBlob(); //Read the file into a blob
        var xmlString = fileBlob.getDataAsString(); //Read the blob into a string
        xmlString = xmlString.split("Custom>").join(">"); //Clean-up the string
        xmlString = xmlString.split("General>").join(">");
        xmlString = xmlString.split("<C").join("<");
        xmlString = xmlString.split("</C").join("</");
        xmlString = xmlString.split("<G").join("<");
        xmlString = xmlString.split("</G").join("</");

        var xmlDoc = XmlService.parse(xmlString); //Parse the string
        var root = xmlDoc.getRootElement(); //Get the root element
        var entries = root.getChildren(); //Get the children
        var player = entries[0].getName(); //Get the first value
        var headers = []; //Initialize the arrays
        var allValues = [];
        var values = [];
        for(var i=0; i < entries.length; i++) { //For each entry
          if(entries[i].getName() == player) { //If the it is the first record, put it in the header array
            headers.push(entries[i].getChildText("F"));
          }
          values.push(entries[i].getChildText("A")); //Put the values is the values array
          
          if(i == entries.length-1) { //If it is not the first value, put them into the allValues array
            allValues.push(values);
            values = [];
          } else if(entries[i].getName() != entries[i+1].getName()) {
            allValues.push(values);
            values = [];
          }
        }
      }
      headers = [headers]; //Wrap the header array in an array, so it can be placed easily in the GSheet
    
      //Get the date information
      var monthDate = new Date().getMonth()+1;
      if(monthDate.toString().length == 1) {
        monthDate = "0" + monthDate.toString();
      } else {
        monthDate = monthDate.toString();
      }
    
      var dayDate = new Date().getDate();
      if(dayDate.length == 1) {
        dayDate = "0" + dayDate.toString();
      } else {
        dayDate = dayDate.toString();
      }
    
      //Create the new sheet and place the header/values
      var sheetName = new Date().getFullYear().toString() + monthDate + dayDate + "-CRMtoFR-" + count;
      var xmlSheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(sheetName); //Create a new sheet
      var headerRange = xmlSheet.getRange(1, 1, 1, headers[0].length);
      headerRange.setValues(headers);
      var dataRange = xmlSheet.getRange(2, 1, allValues.length, allValues[0].length);
      dataRange.setValues(allValues);
      
      //Increment the file count and set the file name to PARSED
      count++;
      txtFile.setName(txtFileName + "-PARSED");
    }
    
    
  }
  
}
