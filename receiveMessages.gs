function getMediaAssets(messageSid, accountSid, options) {
  var reqUrl = "https://api.twilio.com/2010-04-01/Accounts/" + accountSid + "/Messages/" + messageSid + "/Media.json";
  var response = UrlFetchApp.fetch(reqUrl,options);
  var dataAll = JSON.parse(response.getContentText());
  Logger.log("Media List: \n");
  Logger.log(dataAll.media_list);
  var assets = dataAll.media_list;
  var mediaLinks = [];
  for (var k = 0; k < assets.length; k++) {
    mediaLinks.push("https://api.twilio.com" + assets[k].uri.slice(0, assets[k].uri.length - 5));
  }
  Logger.log("\n Media links: \n" + mediaLinks)
  return mediaLinks;
}

function myFunction() {
  const ACCOUNT_SID = "XXXXXXXXXXXXXXXX";
  const ACCOUNT_TOKEN = "XXXXXXXXXXXXXXXX";
  const toPhoneNumber = "+1XXXXXXXXXX";
  const numberToRetrieve = 200;
  const hoursOffset = 0;

  var options = {
    "method" : "get"
  };
  options.headers = {
    "Authorization" : "Basic " + Utilities.base64Encode(ACCOUNT_SID + ":" + ACCOUNT_TOKEN)
  };
  var url="https://api.twilio.com/2010-04-01/Accounts/" + ACCOUNT_SID + "/Messages.json?To=" + toPhoneNumber + "&PageSize=" + numberToRetrieve;
  var response = UrlFetchApp.fetch(url,options);
  // -------------------------------------------
  // Parse the JSON data and put it into the spreadsheet's active page.
  // Documentation: https://www.twilio.com/docs/api/rest/response
  var theSheet = SpreadsheetApp.getActive().getSheetByName('Receive');
  var theRow = 3;
  var startColumn = 2;
  var dataAll = JSON.parse(response.getContentText());
  for (i = 0; i < dataAll.messages.length; i++) {
    theColumn = startColumn;
    // -------------------------------------
    // Date and Time
    rowDate = dataAll.messages[i].date_sent;
    var theDate = new Date (rowDate);
    if(isNaN(theDate.valueOf())) {
      theDate = 'Not a valid date-time';
      theColumn++;
      theColumn++;
    }
    else {
      theDate.setHours(theDate.getHours()+hoursOffset);
      theSheet.getRange(theRow, theColumn).setValue(theDate);
      theColumn++;
      theSheet.getRange(theRow, theColumn).setValue(theDate);
      theColumn++;
    }
    // -------------------------------------
    theSheet.getRange(theRow, theColumn).setValue(dataAll.messages[i].to);
    theColumn++;
    theSheet.getRange(theRow, theColumn).setValue(dataAll.messages[i].from);
    theColumn++;
    theSheet.getRange(theRow, theColumn).setValue(dataAll.messages[i].body);
    theColumn++;
    /** Check for media assets */
    if (dataAll.messages[i].num_media > 0) {
      Logger.log("message with media assets: \n\n")
      Logger.log(dataAll.messages[i])
      var mediaLinks = getMediaAssets(dataAll.messages[i].sid, ACCOUNT_SID, options);
      for (let j = 0; j < mediaLinks.length; j++) {
        theSheet.getRange(theRow, theColumn).setValue(mediaLinks[j]);
        theColumn++;
      }
    }
    theRow++;
  }
}