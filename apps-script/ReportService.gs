var ReportService = {
  // PDF/report engine is intentionally isolated for Phase 4.
  // It will render a server-side report, convert it to PDF and save it
  // in the tour's Reports folder.
  generatePlaceholder: function(tourId, reportType) {
    var tour = TourService.getTour(tourId);
    return {
      tourId: tour.tourId,
      reportType: reportType,
      status: 'REPORT_ENGINE_PENDING_PHASE_4'
    };
  }
};
