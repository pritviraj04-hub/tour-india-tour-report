window.TIAPI = (() => {

  const cfg = window.TOUR_INDIA_CONFIG;

  const TOKEN_KEY = "tourIndiaSessionToken";


  /* ============================================================
     TOKEN MANAGEMENT
     ============================================================ */

  function getToken() {
    return sessionStorage.getItem(TOKEN_KEY) ||
           localStorage.getItem(TOKEN_KEY) ||
           "";
  }


  function setToken(token) {

    if (token) {
      sessionStorage.setItem(
        TOKEN_KEY,
        token
      );
    }

  }


  function clearToken() {

    sessionStorage.removeItem(
      TOKEN_KEY
    );

    localStorage.removeItem(
      TOKEN_KEY
    );

  }


  /* ============================================================
     API REQUEST
     ============================================================ */

  async function request(
    action,
    payload = {},
    method = "POST"
  ) {

    if (
      !cfg ||
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


      const token =
        getToken();


      /*
       * Every protected request receives
       * the current session token.
       */

      if (token) {

        url +=
          `&token=${encodeURIComponent(token)}`;

      }


      const options = {

        method: method,

        signal:
          controller.signal,

        credentials:
          "omit"

      };


      /* ========================================================
         GET
         ======================================================== */

      if (method === "GET") {

        Object.entries(
          payload || {}
        ).forEach(
          ([key, value]) => {

            if (
              value !== undefined &&
              value !== null
            ) {

              url +=
                `&${encodeURIComponent(key)}=` +
                `${encodeURIComponent(
                  typeof value === "object"
                    ? JSON.stringify(value)
                    : value
                )}`;

            }

          }
        );

      }


      /* ========================================================
         POST
         ======================================================== */

      else {

        options.headers = {

          "Content-Type":
            "application/x-www-form-urlencoded;charset=UTF-8"

        };


        const body = {

          action:
            action,

          ...payload

        };


        /*
         * Token is included inside payload
         * as well as URL.
         */

        if (token) {

          body.token =
            token;

        }


        options.body =
          new URLSearchParams({

            payload:
              JSON.stringify(body)

          }).toString();

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


      /* ========================================================
         API ERROR
         ======================================================== */

      if (
        !result.success
      ) {

        const error =
          new Error(
            result.message ||
            result.error ||
            "Request failed."
          );


        error.code =
          result.errorCode;


        /*
         * Session expired / invalid.
         */

        if (
          result.errorCode ===
            "AUTHENTICATION_REQUIRED" ||
          result.errorCode ===
            "ACCESS_DENIED"
        ) {

          clearToken();

        }


        throw error;

      }


      return result.data;

    }


    catch (error) {

      if (
        error.name ===
        "AbortError"
      ) {

        throw new Error(
          "Request timed out. Please try again."
        );

      }


      throw error;

    }


    finally {

      clearTimeout(
        timeout
      );

    }

  }


  /* ============================================================
     AUTHENTICATION
     ============================================================ */

  async function login(
    username,
    password
  ) {

    const data =
      await request(
        "login",
        {
          username,
          password
        },
        "POST"
      );


    if (
      data &&
      data.token
    ) {

      setToken(
        data.token
      );

    }


    return data;

  }


  async function logout() {

    try {

      await request(
        "logout",
        {},
        "POST"
      );

    } finally {

      clearToken();

    }

  }


  async function getCurrentUser() {

    return request(
      "getCurrentUser",
      {},
      "GET"
    );

  }


  /* ============================================================
     DASHBOARD
     ============================================================ */

  function getDashboardStats() {

    return request(
      "getDashboardStats",
      {},
      "GET"
    );

  }


  /* ============================================================
     TOURS
     ============================================================ */

  function searchTours(
    query = ""
  ) {

    return request(
      "searchTours",
      {
        query
      },
      "GET"
    );

  }


  function getTour(
    tourId
  ) {

    return request(
      "getTour",
      {
        tourId
      },
      "GET"
    );

  }


  function createTour(
    tour
  ) {

    return request(
      "createTour",
      {
        tour
      },
      "POST"
    );

  }


  function updateTour(
    tour
  ) {

    return request(
      "updateTour",
      {
        tour
      },
      "POST"
    );

  }


  function archiveTour(
    tourId
  ) {

    return request(
      "archiveTour",
      {
        tourId
      },
      "POST"
    );

  }


  function duplicateTour(
    tourId,
    copyOptions = {}
  ) {

    return request(
      "duplicateTour",
      {
        tourId,
        copyOptions
      },
      "POST"
    );

  }


  /* ============================================================
     PUBLIC API
     ============================================================ */

  return {

    login,

    logout,

    getCurrentUser,

    getDashboardStats,

    searchTours,

    getTour,

    createTour,

    updateTour,

    archiveTour,

    duplicateTour,

    getToken,

    clearToken

  };

})();
