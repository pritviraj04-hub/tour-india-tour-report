var SearchService = {
  headers: ['Tour ID','School','Destination','From','To','Tour Leader','Status','Drive Folder ID','Last Updated'],

  getSheet_: function() {
    var id = AppConfig.sheetId();
    if (!id) return null;
    var ss = SpreadsheetApp.openById(id);
    var sheet = ss.getSheets()[0];
    if (sheet.getLastRow() === 0) sheet.appendRow(this.headers);
    return sheet;
  },

  upsert: function(tour) {
    var sheet = this.getSheet_();
    if (!sheet) return;

    if (sheet.getLastRow() === 0) sheet.appendRow(this.headers);

    var values = sheet.getDataRange().getValues();
    var row = -1;
    for (var i=1; i<values.length; i++) {
      if (String(values[i][0]) === String(tour.tourId)) { row = i+1; break; }
    }

    var record = [
      tour.tourId, tour.school, tour.destination, tour.fromDate || '',
      tour.toDate || '', tour.tourLeader || '', tour.status || 'Draft',
      tour.driveFolderId || '', tour.lastUpdated || new Date().toISOString()
    ];

    if (row === -1) sheet.appendRow(record);
    else sheet.getRange(row, 1, 1, record.length).setValues([record]);
  },

  remove: function(tourId) {
    var sheet = this.getSheet_();
    if (!sheet) return;
    var values = sheet.getDataRange().getValues();
    for (var i=1; i<values.length; i++) {
      if (String(values[i][0]) === String(tourId)) {
        sheet.deleteRow(i+1);
        return;
      }
    }
  },

  search: function(query) {
    var sheet = this.getSheet_();
    if (!sheet) return [];

    var values = sheet.getDataRange().getValues();
    var q = String(query || '').toLowerCase().trim();
    var result = [];

    for (var i=1; i<values.length; i++) {
      var row = values[i];
      var text = row.join(' ').toLowerCase();
      if (!q || text.indexOf(q) !== -1) {
        result.push({
          tourId:String(row[0]), school:String(row[1]), destination:String(row[2]),
          fromDate:String(row[3]), toDate:String(row[4]), tourLeader:String(row[5]),
          status:String(row[6]), driveFolderId:String(row[7]), lastUpdated:String(row[8])
        });
      }
    }

    result.reverse();
    return result.slice(0, 100);
  }
};
