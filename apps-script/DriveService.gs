var DriveService = {
  getRoot: function() {
    return DriveApp.getFolderById(AppConfig.mainFolderId());
  },

  getOrCreateFolder: function(parent, name) {
    var iterator = parent.getFoldersByName(name);
    return iterator.hasNext() ? iterator.next() : parent.createFolder(name);
  },

  getAcademicYearFolder: function(academicYear) {
    return this.getOrCreateFolder(this.getRoot(), academicYear);
  },

  getTourFolder: function(tourId, school, academicYear) {
    var yearFolder = this.getAcademicYearFolder(academicYear);
    var safeSchool = String(school || 'Tour').replace(/[\\/:*?"<>|]/g, '_').trim();
    var folderName = tourId + '_' + safeSchool;
    return this.getOrCreateFolder(yearFolder, folderName);
  },

  getSubfolders: function(tourFolder) {
    return {
      data: this.getOrCreateFolder(tourFolder, 'Tour Data'),
      photos: this.getOrCreateFolder(tourFolder, 'Photos'),
      documents: this.getOrCreateFolder(tourFolder, 'Documents'),
      reports: this.getOrCreateFolder(tourFolder, 'Reports')
    };
  },

  readJson: function(file) {
    return JSON.parse(file.getBlob().getDataAsString('UTF-8'));
  },

  writeTourJson: function(tourFolder, tour) {
    var folders = this.getSubfolders(tourFolder);
    var files = folders.data.getFilesByName('tour-data.json');
    var content = JSON.stringify(tour, null, 2);

    if (files.hasNext()) {
      var file = files.next();
      file.setContent(content);
      return file.getId();
    }
    return folders.data.createFile('tour-data.json', content, MimeType.PLAIN_TEXT).getId();
  },

  readTourJson: function(tourFolder) {
    var folders = this.getSubfolders(tourFolder);
    var files = folders.data.getFilesByName('tour-data.json');
    if (!files.hasNext()) throw new Error('Tour data file not found.');
    return this.readJson(files.next());
  }
};
