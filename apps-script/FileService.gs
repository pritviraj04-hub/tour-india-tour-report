var FileService = {
  // Phase 1 foundation. Upload endpoint will be added with chunking/size
  // validation in the document-management phase.
  getTourFiles: function(tourId) {
    var tour = TourService.getTour(tourId);
    var folder = DriveApp.getFolderById(tour.driveFolderId);
    var result = [];
    this.walk_(folder, '', result);
    return result;
  },

  walk_: function(folder, path, result) {
    var files = folder.getFiles();
    while (files.hasNext()) {
      var file = files.next();
      result.push({
        fileId:file.getId(),
        filename:file.getName(),
        mimeType:file.getMimeType(),
        path:path,
        url:file.getUrl(),
        updatedAt:file.getLastUpdated().toISOString()
      });
    }
    var folders = folder.getFolders();
    while (folders.hasNext()) {
      var sub = folders.next();
      this.walk_(sub, path ? path + '/' + sub.getName() : sub.getName(), result);
    }
  }
};
