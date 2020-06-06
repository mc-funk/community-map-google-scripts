/** 
  Helper Scripts for Google Spreadsheets used as sources for maps, e.g. https://github.com/jdalt/twin-cities-aid-distribution-locations/
  Script available on GitHub at https://github.com/mc-funk/community-map-google-scripts/
  Open Tools > Script Editor in Google Sheets and then copy & paste script and edit items in USER-DEFINED CONSTANTS AND CHECKS section.
*/

/** Return a [lat, long] pair for a given address using the 
* Google Geocoder API: https://developers.google.com/maps/documentation/javascript/reference/geocoder 
* Code adapted from https://willgeary.github.io/data/2016/11/04/Geocoding-with-Google-Sheets.html 
*/
function getPositionByAddress(address) {
  // Geocode the address
  var geocoder = Maps.newGeocoder().setRegion('us');
  var location;

  location = geocoder.geocode(address);
  
  // Only return a latLong if geocoder seems to have gotten a 
  // valid response.
  if (location.status == 'OK') {
    lat = location["results"][0]["geometry"]["location"]["lat"];
    lng = location["results"][0]["geometry"]["location"]["lng"];
    Logger.log('lat', lat, 'lng', lng);
    return [lat, lng];
  } else {
    return [];
  }
 };


/** onEdit is from google sheets API, it runs whenever any cell or range in the workbook changes */
function onEdit(e) {
    /* USER-DEFINED CONSTANTS AND CHECKS: EDIT THESE FOR YOUR SPREADSHEET */
  
    /** The name of the spreadsheet you want this script to run on, exactly.
     * This is the name that should appear in the tab at the bottom of the screen. */
    var spreadsheetName = 'Twin Cities Distribution Locations';  
  
    /* TIMESTAMP-RELATED CONSTANTS */
    /** Column, 1-indexed, where automatic timestamps are to be placed */
    var timestampCol = 1;
  
  /** Takes in the row and column of the cell edited and returns true if the timestamp should be updated, 
  false if it should not. */
  function shouldTimestampUpdateByEditedCell(row, col) {
    // Don't timestamp the header row.
    if (row == 1) return false;
    
    // Only timestamp if edits are to the cells our data entry folks will be updating. 
    // Columns are 1-indexed; A = 1, B = 2, C = 3 etc.
    if (column < 5) return false;
    
    return true;
  };

    /* CONSTANTS FOR INSERTING LAT AND LONG */ 
    /** Column, 1-indexed, where users will enter the address to be geocoded */  
    var addressCol = 4;
 
    /** Column, 1-indexed, where this script will insert the latitude */  
    var latColumn = 16;
  
    /** Column, 1-indexed, where this script will insert the longitude */   
    var lngColumn = 17;

    /* END USER-DEFINED CONSTANTS AND CHECKS */
  
  
    /** Active sheet in Google workbook */
    var sh = e.source.getActiveSheet();
  
    // Prevent useless errors on debug
    if (!sh || !e.range) return;
  
    // Don't bother doing anything if the active sheet isn't the designated spreadsheet 
    if (sh.getName() !== spreadsheetName) return;
  
    // e.range is the range that has actually changed, we get the row and column.
    var row = e.range.getRow();
    var column = e.range.getColumn();
  
    // This will show up in Google Apps Script Dashboard
    console.log('row', row, 'col', column);
  
    /**
    LOGIC TO INSERT LATITUDE AND LONGITUDE ON EDIT
    If change is to address column, update lat and long
    */
     if (column == addressCol) {
       // Must use the range.getValue() method as e.value does not reflect pasted values
       var newAddress = e.range.getValue();       
       if (!newAddress) return; 

       var latLong = getPositionByAddress(newAddress, row);
       var lat = latLong[0];
       var long = latLong[1];
       
       sh.getRange(row, latColumn).setValue(lat);
       sh.getRange(row, lngColumn).setValue(long);
     }
  
    /** 
    If change is to key data entry columns, update a timestamp 
    */
    if (!shouldTimestampUpdateByEditedCell(row, column)) return;
  
    // For the row changed, set the 1st cell (1-indexed!) to the current datetime.
    sh.getRange(row, timestampCol).setValue(new Date());
}

