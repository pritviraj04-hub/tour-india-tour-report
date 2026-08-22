window.TIAPI = (() => {

  const cfg = window.TOUR_INDIA_CONFIG;

  if (!cfg) {
    throw new Error(
      "Tour India configuration has not been loaded."
    );
  }

  async function request(
    action,
    payload = {},
    method = "POST"
  ) {

    if (
      !cfg.API_BASE_URL ||
      cfg.API_BASE_URL.includes("PASTE_")
    ) {
      throw new Error(
        "Apps Script API URL has not been configured."
      );
    }

    const controller =
      new AbortController();

    const timeout =
      setTimeout(
        () => controller.abort(),
        cfg.REQUEST_TIMEOUT_MS || 15000
      );

    try {

      let url =
        `${cfg.API_BASE_URL}?action=${encodeURIComponent(action)}`;

      const options = {
        method: method,
        signal: controller.signal,
        credentials: "omit"
      };


      // ==========================================
      // GET
      // ==========================================

      if (method === "GET") {

        Object.entries(payload)
          .forEach(([key, value]) => {

            if (
              value !== undefined &&
              value !== null
            ) {

              url +=
                `&${encodeURIComponent(key)}=` +
                encodeURIComponent(
                  typeof value === "object"
                    ? JSON.stringify(value)
                    : value
                );
            }

          });

      }


      // ==========================================
      // POST
      // ==========================================

      else {

        /*
         * Send actual JSON as text/plain.
         *
         * This matches the Apps Script
         * parseRequest_() function and avoids
         * unnecessary CORS preflight.
         */

        options.headers = {
          "Content-Type":
            "text/plain;charset=utf-8"
        };

        options.body =
          JSON.stringify({
            action: action,
            ...payload
          });
      }


      const response =
        await fetch(
          url,
          options
        );


      const text =
        await response.text();


      let result;

      try {

        result =
          JSON.parse(text);

      } catch (error) {

        console.error(
          "Invalid API response:",
          text
        );

        throw new Error(
          "Invalid API response."
        );
      }


      if (!result.success) {

        const err =
          new Error(
            result.message ||
            result.error ||
            "Request failed."
          );

        err.code =
          result.errorCode;

        throw err;
      }


      return result.data;

    } finally {

      clearTimeout(timeout);

    }
  }


  // ==========================================
  // PUBLIC API
  // ==========================================

  return {


    // ------------------------------------------
    // LOGIN
    // ------------------------------------------

    login: function(
      username,
      password
    ) {

      return request(
        "login",
        {
          username: username,
          password: password
        },
        "POST"
      );

    },


    // ------------------------------------------
    // LOGOUT
    // ------------------------------------------

    logout: function(
      token
    ) {

      return request(
        "logout",
        {
          token: token
        },
        "POST"
      );

    },


    // ------------------------------------------
    // CURRENT USER
    // ------------------------------------------

    getCurrentUser: function(
      token
    ) {

      return request(
        "currentUser",
        {
          token: token
        },
        "GET"
      );

    },


    // ------------------------------------------
    // DASHBOARD
    // ------------------------------------------

    getDashboardStats: function(
      token
    ) {

      return request(
        "getDashboardStats",
        {
          token: token
        },
        "GET"
      );

    },


    // ------------------------------------------
    // SEARCH TOURS
    // ------------------------------------------

    searchTours: function(
      query = "",
      token
    ) {

      return request(
        "searchTours",
        {
          query: query,
          token: token
        },
        "GET"
      );

    },


    // ------------------------------------------
    // GET TOUR
    // ------------------------------------------

    getTour: function(
      tourId,
      token
    ) {

      return request(
        "getTour",
        {
          tourId: tourId,
          token: token
        },
        "GET"
      );

    },


    // ------------------------------------------
    // CREATE TOUR
    // ------------------------------------------

    createTour: function(
      tour,
      token
    ) {

      return request(
        "createTour",
        {
          tour: tour,
          token: token
        },
        "POST"
      );

    },


    // ------------------------------------------
    // UPDATE TOUR
    // ------------------------------------------

    updateTour: function(
      tour,
      token
    ) {

      return request(
        "updateTour",
        {
          tour: tour,
          token: token
        },
        "POST"
      );

    },


    // ------------------------------------------
    // ARCHIVE TOUR
    // ------------------------------------------

    archiveTour: function(
      tourId,
      token
    ) {

      return request(
        "archiveTour",
        {
          tourId: tourId,
          token: token
        },
        "POST"
      );

    },


    // ------------------------------------------
    // DUPLICATE TOUR
    // ------------------------------------------

    duplicateTour: function(
      tourId,
      copyOptions,
      token
    ) {

      return request(
        "duplicateTour",
        {
          tourId: tourId,
          copyOptions: copyOptions,
          token: token
        },
        "POST"
      );

    }

  };

})();
