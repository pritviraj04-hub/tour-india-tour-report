var TourService = {
  generateTourId_: function() {
    var lock = LockService.getScriptLock();
    lock.waitLock(30000);
    try {
      var props = PropertiesService.getScriptProperties();
      var year = new Date().getFullYear();
      var key = 'TOUR_SEQUENCE_' + year;
      var next = Number(props.getProperty(key) || 0) + 1;
      props.setProperty(key, String(next));
      return 'TIR-' + year + '-' + String(next).padStart(4, '0');
    } finally {
      lock.releaseLock();
    }
  },

  prepare_: function(tour, isNew) {
    tour = tour || {};
    if (isNew) tour.tourId = this.generateTourId_();
    if (!tour.tourId) throw new Error('Tour ID is required.');

    tour.status = tour.status || 'Draft';
    tour.academicYear = tour.academicYear || this.academicYear_();
    tour.group = tour.group || {};
    tour.group.students = tour.group.students || {boys:0,girls:0};
    tour.group.teachers = tour.group.teachers || {male:0,female:0};
    tour.group.escorts = tour.group.escorts || {male:0,female:0};

    tour.createdAt = tour.createdAt || new Date().toISOString();
    tour.lastUpdated = new Date().toISOString();

    var totals = {
      students: Number(tour.group.students.boys || 0) + Number(tour.group.students.girls || 0),
      teachers: Number(tour.group.teachers.male || 0) + Number(tour.group.teachers.female || 0),
      escorts: Number(tour.group.escorts.male || 0) + Number(tour.group.escorts.female || 0)
    };
    totals.total = totals.students + totals.teachers + totals.escorts;
    tour.group.totals = totals;

    return tour;
  },

  academicYear_: function() {
    var d = new Date();
    var start = d.getMonth() >= 3 ? d.getFullYear() : d.getFullYear() - 1;
    return start + '-' + String(start + 1).slice(-2);
  },

  createTour_: function(input) {
    var tour = this.prepare_(input, true);
    var folder = DriveService.getTourFolder(tour.tourId, tour.school, tour.academicYear);
    tour.driveFolderId = folder.getId();
    DriveService.writeTourJson(folder, tour);
    SearchService.upsert(tour);
    return {tour:tour};
  },

  updateTour_: function(input) {
    if (!input.tourId) throw new Error('Tour ID is required.');
    var existing = this.getTour(input.tourId);
    var merged = this.deepMerge_(existing, input);
    merged = this.prepare_(merged, false);

    var folder = DriveApp.getFolderById(existing.driveFolderId);
    merged.driveFolderId = existing.driveFolderId;
    DriveService.writeTourJson(folder, merged);
    SearchService.upsert(merged);
    return {tour:merged};
  },

  getTour: function(tourId) {
    if (!tourId) throw new Error('Tour ID is required.');
    var search = SearchService.search(tourId);
    var row = search.find(function(x){ return x.tourId === tourId; });
    if (!row || !row.driveFolderId) throw new Error('Tour not found.');
    return DriveService.readTourJson(DriveApp.getFolderById(row.driveFolderId));
  },

  searchTours: function(query) {
    return SearchService.search(query);
  },

  getDashboardStats: function() {
    var tours = SearchService.search('');
    var currentYear = this.academicYear_();
    var stats = {total:tours.length,currentYear:0,draft:0,confirmed:0,onTour:0,completed:0,cancelled:0};
    tours.forEach(function(t) {
      var date = t.fromDate ? new Date(t.fromDate) : null;
      if (date && !isNaN(date) && (date.getFullYear() + '-' + String(date.getFullYear()+1).slice(-2)) === currentYear) stats.currentYear++;
      var key = String(t.status || '').replace(/\s/g,'').toLowerCase();
      if (key === 'draft') stats.draft++;
      else if (key === 'confirmed') stats.confirmed++;
      else if (key === 'ontour') stats.onTour++;
      else if (key === 'completed') stats.completed++;
      else if (key === 'cancelled') stats.cancelled++;
    });
    return stats;
  },

  archiveTour_: function(tourId) {
    var tour = this.getTour(tourId);
    tour.status = 'Archived';
    tour.lastUpdated = new Date().toISOString();
    var folder = DriveApp.getFolderById(tour.driveFolderId);
    DriveService.writeTourJson(folder, tour);
    SearchService.remove(tourId);
    return {tourId:tourId, archived:true};
  },

  duplicateTour_: function(tourId, copyOptions) {
    var source = this.getTour(tourId);
    var copy = JSON.parse(JSON.stringify(source));
    delete copy.tourId;
    delete copy.driveFolderId;
    delete copy.createdAt;
    delete copy.lastUpdated;
    copy.status = 'Draft';

    // Operational/commercial history must not be carried over.
    copy.financial = {};
    copy.expenses = [];
    copy.payments = [];
    copy.advances = [];

    if (!copyOptions || !copyOptions.hotels) copy.accommodation = [];
    if (!copyOptions || !copyOptions.itinerary) copy.itinerary = [];
    if (!copyOptions || !copyOptions.guides) copy.guides = [];
    if (!copyOptions || !copyOptions.sightseeing) copy.sightseeing = [];
    if (!copyOptions || !copyOptions.transport) copy.transport = [];
    if (!copyOptions || !copyOptions.safari) copy.safari = [];
    if (!copyOptions || !copyOptions.meals) copy.meals = [];

    return this.createTour_(copy);
  },

  deepMerge_: function(a,b) {
    var out = JSON.parse(JSON.stringify(a || {}));
    Object.keys(b || {}).forEach(function(k) {
      if (b[k] && typeof b[k] === 'object' && !Array.isArray(b[k]) &&
          out[k] && typeof out[k] === 'object' && !Array.isArray(out[k])) {
        out[k] = TourService.deepMerge_(out[k], b[k]);
      } else {
        out[k] = b[k];
      }
    });
    return out;
  }
};
