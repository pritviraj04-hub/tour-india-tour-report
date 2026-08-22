window.TIAPI = (() => {
  const cfg = window.TOUR_INDIA_CONFIG;

  async function request(action, payload={}, method="POST") {
    if (!cfg.API_BASE_URL || cfg.API_BASE_URL.includes("PASTE_")) {
      throw new Error("Apps Script API URL has not been configured.");
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), cfg.REQUEST_TIMEOUT_MS);

    try {
      let url = `${cfg.API_BASE_URL}?action=${encodeURIComponent(action)}`;
      const options = {method, signal: controller.signal, credentials: "omit"};

      if (method === "GET") {
        Object.entries(payload).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            url += `&${encodeURIComponent(key)}=${encodeURIComponent(typeof value === "object" ? JSON.stringify(value) : value)}`;
          }
        });
      } else {
        options.headers = {"Content-Type":"application/x-www-form-urlencoded;charset=UTF-8"};
        const body = {action, ...payload};
        options.body = new URLSearchParams({
          payload: JSON.stringify(body)
        }).toString();
      }

      const response = await fetch(url, options);
      const text = await response.text();
      let result;
      try { result = JSON.parse(text); }
      catch { throw new Error("Invalid API response."); }

      if (!result.success) {
        const err = new Error(result.message || result.error || "Request failed.");
        err.code = result.errorCode;
        throw err;
      }
      return result.data;
    } finally {
      clearTimeout(timeout);
    }
  }

  return {
    getCurrentUser: () => request("getCurrentUser", {}, "GET"),
    getDashboardStats: () => request("getDashboardStats", {}, "GET"),
    searchTours: (query="") => request("searchTours", {query}, "GET"),
    getTour: (tourId) => request("getTour", {tourId}, "GET"),
    createTour: (tour) => request("createTour", {tour}, "POST"),
    updateTour: (tour) => request("updateTour", {tour}, "POST"),
    archiveTour: (tourId) => request("archiveTour", {tourId}, "POST"),
    duplicateTour: (tourId, copyOptions) => request("duplicateTour", {tourId, copyOptions}, "POST")
  };
})();
