function doGet(e) {
  return routeRequest_(e, 'GET');
}

function doPost(e) {
  return routeRequest_(e, 'POST');
}

function routeRequest_(e, method) {
  try {
    var action = (e && e.parameter && e.parameter.action) || '';
    var payload = {};

    if (method === 'POST' && e && e.parameter && e.parameter.payload) {
      payload = JSON.parse(e.parameter.payload);
      action = payload.action || action;
    } else if (e && e.parameter) {
      payload = Object.assign({}, e.parameter);
      if (payload.payload) {
        try { payload = Object.assign(payload, JSON.parse(payload.payload)); } catch (_) {}
      }
    }

    var result = ApiRouter.handle(action, payload);

    return ContentService
      .createTextOutput(JSON.stringify({success:true, data:result, message:''}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    console.error(err && err.stack ? err.stack : err);
    var code = err && err.code ? err.code : 'SERVER_ERROR';
    var message = code === 'ACCESS_DENIED' ? 'Access Denied' : (err.message || 'Unable to complete request.');

    return ContentService
      .createTextOutput(JSON.stringify({success:false, errorCode:code, message:message}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

var ApiRouter = {
  handle: function(action, payload) {
    if (action === 'getCurrentUser') return AuthService.requireUser();
    AuthService.requireUser();

    switch (action) {
      case 'getDashboardStats': return TourService.getDashboardStats();
      case 'searchTours': return TourService.searchTours(String(payload.query || ''));
      case 'getTour': return TourService.getTour(String(payload.tourId || ''));
      case 'createTour': return TourService.createTour_(normaliseObject_(payload.tour));
      case 'updateTour': return TourService.updateTour_(normaliseObject_(payload.tour));
      case 'archiveTour': return TourService.archiveTour_(String(payload.tourId || ''));
      case 'duplicateTour': return TourService.duplicateTour_(String(payload.tourId || ''), normaliseObject_(payload.copyOptions));
      default:
        var err = new Error('Unknown API action.');
        err.code = 'BAD_ACTION';
        throw err;
    }
  }
};

function normaliseObject_(value) {
  if (typeof value === 'string') {
    try { return JSON.parse(value); } catch (_) { return {}; }
  }
  return value || {};
}
