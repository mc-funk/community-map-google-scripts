# community-map-google-scripts
Scripts to support Google spreadsheets that use community-generated information to map important points, such as https://github.com/jdalt/twin-cities-aid-distribution-locations/. 

`script.gs` currently has two functions: 
- Inserts a timestamp in a desired column when specific columns of your spreadsheet are edited 
- Inserts a latitude and longitude in desired columns when an address column in your spreadsheet is updated.

`receiveMessages.gs`:
- Script to receive text messages from Twilio number into a Google Sheet

`sendMessages.gs`:
- Idea for how to send text responses to individual phone numbers
- Idea for how to send text reminders to multiple phone numbers