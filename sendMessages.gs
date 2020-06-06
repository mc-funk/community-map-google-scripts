function sendSms(to, body) {
    const ACCOUNT_SID = "XXXXXXXXXXXXXXXX";
    const ACCOUNT_TOKEN = "XXXXXXXXXXXXXXXX";
    const fromPhoneNumber = "+1XXXXXXXXXX";
    
    var messages_url = "https://api.twilio.com/2010-04-01/Accounts/" + ACCOUNT_SID + "/Messages.json";
  
    var payload = {
      "To": to,
      "Body" : body,
      "From" : fromPhoneNumber
    };
  
    var options = {
      "method" : "post",
      "payload" : payload
    };
  
    options.headers = { 
      "Authorization" : "Basic " + Utilities.base64Encode(ACCOUNT_SID +":"+ ACCOUNT_TOKEN)
    };
  
    UrlFetchApp.fetch(messages_url, options);
  }
  
  /*
  Spreadsheet setup idea:
  Phone Number  |  Message Body | Status  |
  xxx-xxx-xxxx  |    msg here   | sent (or error) | <SEND BUTTON that runs this function> 
  */
  function sendResponses() {
    var sheet = SpreadsheetApp.getActive().getSheetByName('SendResponses');
    var startRow = 2; // start after column title row
    var numRows = sheet.getLastRow() - 1; // subtract column title row from total row count
    var dataRange = sheet.getRange(startRow, 1, numRows, 3) // row, column, numRows, numColumns
    var data = dataRange.getValues();
  
    for (i in data) {
      var row = data[i];
      var msgSentStatus = row[2]
      if (msgSentStatus == "sent") {
        continue; // skip sending this message. It was already sent
      } else {
        try {
          response_data = sendSms(row[0], row[1]);
          status = "sent";
        } catch(err) {
          Logger.log(err);
          status = "error";
        }
        sheet.getRange(startRow + Number(i), 3).setValue(status);
      }
    }
  }
  
  function flatten(nestedArr){
    return [].concat.apply([], nestedArr);
  }
  
  /*
  Spreadsheet setup idea:
  Send to       |    Reminder info    |    Status     |
  xxx-xxx-xxxx  |     msg to send     |  sent (or error) |  <SEND BUTTON that runs this function> 
  xxx-xxx-xxxx  |  -------------------------------------------
  xxx-xxx-xxxx  |  -------------------------------------------
  ...           |  -------------------------------------------
  */
  
  function sendReminders() {
    var sheet = SpreadsheetApp.getActive().getSheetByName('SendReminders');
    var reminderMessage = sheet.getRange("B2").getValue(); // get the current reminder message to be sent
    
    var numbersCol = sheet.getRange("A2:A").getValues();
    numbersCol = numbersCol.filter(String);
    var lenNums = numbersCol.length; // get length of a
    var sendToNumbers = flatten(sheet.getRange("A2:A" + (lenNums + 1)).getValues()); // arr of all #s to send reminder to
    
    for (i in sendToNumbers) {
      try {
        response_data = sendSms(sendToNumbers[i], reminderMessage);
        status = "sent"
      } catch(err) {
        Logger.log(err);
        status = "error";
      }
    }
    // @todo: some way to denote whether the reminder was sent or errored when trying to send to
    // each number in the list. @todo: move current message down to previous message category in
    // spreadsheet
  }