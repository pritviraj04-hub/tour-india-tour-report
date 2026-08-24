window.TIAPI = (() => {

  const cfg = window.TOUR_INDIA_CONFIG;

  const TOKEN_KEY = "tourIndiaSessionToken";


  /* ============================================================
     TOKEN MANAGEMENT
     ============================================================ */

  function getToken() {

    return (
      sessionStorage.getItem(TOKEN_KEY) ||
      localStorage.getItem(TOKEN_KEY) ||
      ""
    );

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


    /* ==========================================================
       TIMEOUT

       Normal requests:
       15 seconds

       Create / Update / Archive / Duplicate:
       60 seconds

       Drive operations can take longer than normal API reads.
       ========================================================== */

    const isLongRunningAction = [
      "createTour",
      "updateTour",
      "archiveTour",
      "duplicateTour"
    ].includes(action);


    const timeoutMs =
      isLongRunningAction
        ? 60000
        : (
            Number(
              cfg.REQUEST_TIMEOUT_MS
            ) || 15000
          );


    const controller =
      new AbortController();


    const timeout =
      setTimeout(
        () => controller.abort(),
        timeoutMs
      );


    try {

      /* ========================================================
         BUILD URL
         ======================================================== */

      let url =
        `${cfg.API_BASE_URL}?action=${encodeURIComponent(action)}`;


      const token =
        getToken();


      /*
       * Protected requests receive the
       * current session token.
       */

      if (token) {

        url +=
          `&token=${encodeURIComponent(token)}`;

      }


      /* ========================================================
         REQUEST OPTIONS
         ======================================================== */

      const options = {

        method: method,

        signal:
          controller.signal,

        credentials:
          "omit"

      };


      /* ========================================================
         GET REQUEST
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
         POST REQUEST
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
         * Token is included in the body as well
         * as the URL.
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


      /* ========================================================
         SEND REQUEST
         ======================================================== */

      console.log(
        `[TIAPI] ${method} ${action} request started. Timeout: ${timeoutMs}ms`
      );


      const response =
        await fetch(
          url,
          options
        );


      console.log(
        `[TIAPI] ${action} response received. HTTP ${response.status}`
      );


      const text =
        await response.text();


      let result;


      /* ========================================================
         PARSE RESPONSE
         ======================================================== */

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
         * Authentication failure.
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


      console.log(
        `[TIAPI] ${action} completed successfully.`
      );


      return result.data;

    }


    catch (error) {

      /* ========================================================
         TIMEOUT ERROR
         ======================================================== */

      if (
        error.name ===
        "AbortError"
      ) {

        const timeoutError =
          new Error(
            isLongRunningAction
              ? "The server is taking longer than expected. Please wait a moment and check the dashboard before trying again."
              : "Request timed out. Please try again."
          );


        timeoutError.code =
          "REQUEST_TIMEOUT";


        console.error(
          `[TIAPI] ${action} timed out after ${timeoutMs}ms.`
        );


        throw timeoutError;

      }


      console.error(
        `[TIAPI] ${action} failed:`,
        error
      );


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
  tour,
  requestId
) {

  return request(
    "createTour",
    {
      tour,
      requestId:
        requestId ||
        (
          "REQ-" +
          Date.now() +
          "-" +
          Math.random()
            .toString(36)
            .substring(2, 10)
        )
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
