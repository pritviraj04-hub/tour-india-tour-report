var AppConfig = {
  get: function(key, fallback) {
    var value = PropertiesService.getScriptProperties().getProperty(key);
    return value === null ? fallback : value;
  },

  mainFolderId: function() {
    var id = this.get('MAIN_DRIVE_FOLDER_ID', '');
    if (!id) throw new Error('MAIN_DRIVE_FOLDER_ID is not configured in Script Properties.');
    return id;
  },

  sheetId: function() {
    return this.get('INDEX_SHEET_ID', '');
  },

  authorizedUsers: function() {
    var raw = this.get('AUTHORIZED_USERS', '');
    if (!raw) return [];
    return raw.split(',').map(function(x){ return x.trim().toLowerCase(); }).filter(Boolean);
  },

  googleClientId: function() {
    return this.get('GOOGLE_OAUTH_CLIENT_ID', '');
  }
};
