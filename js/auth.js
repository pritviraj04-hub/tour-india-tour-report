window.TIAuth = (() => {

  let currentUser = null;
  let sessionToken = null;

  const STORAGE_KEY =
    window.TOUR_INDIA_CONFIG?.SESSION_STORAGE_KEY ||
    "tourIndiaSession";


  // ============================================
  // STORAGE
  // ============================================

  function loadSession() {

    try {

      const raw =
        localStorage.getItem(STORAGE_KEY);

      if (!raw) {
        return null;
      }

      const session =
        JSON.parse(raw);

      if (
        !session ||
        !session.token
      ) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }

      sessionToken =
        session.token;

      currentUser =
        session.user || null;

      return session;

    } catch (error) {

      console.error(
        "Unable to load session:",
        error
      );

      localStorage.removeItem(
        STORAGE_KEY
      );

      return null;
    }
  }


  function saveSession(data) {

    sessionToken =
      data.token;

    currentUser =
      data.user;

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        token: data.token,
        user: data.user,
        expiresAt: data.expiresAt
      })
    );
  }


  function clearSession() {

    sessionToken = null;
    currentUser = null;

    localStorage.removeItem(
      STORAGE_KEY
    );
  }


  // ============================================
  // LOGIN
  // ============================================

  async function login(
    username,
    password
  ) {

    username =
      String(username || "").trim();

    password =
      String(password || "");


    if (!username) {
      throw new Error(
        "Username is required."
      );
    }

    if (!password) {
      throw new Error(
        "Password is required."
      );
    }


    const data =
      await TIAPI.login(
        username,
        password
      );


    if (
      !data ||
      !data.token ||
      !data.user
    ) {

      throw new Error(
        "Invalid login response."
      );
    }


    saveSession(data);

    return data.user;
  }


  // ============================================
  // LOGOUT
  // ============================================

  async function logout() {

    try {

      if (sessionToken) {

        await TIAPI.logout(
          sessionToken
        );
      }

    } catch (error) {

      console.warn(
        "Server logout failed:",
        error
      );

    } finally {

      clearSession();

      showLogin();

    }
  }


  // ============================================
  // CURRENT USER
  // ============================================

  async function init() {

    const saved =
      loadSession();


    // No saved login
    if (!saved) {

      showLogin();

      return null;
    }


    try {

      const user =
        await TIAPI.getCurrentUser(
          sessionToken
        );


      if (!user) {

        throw Object.assign(
          new Error(
            "Authentication required."
          ),
          {
            code:
              "AUTHENTICATION_REQUIRED"
          }
        );
      }


      currentUser =
        user;

      updateUserDisplay();

      hideLogin();

      return currentUser;


    } catch (error) {

      clearSession();

      showLogin();

      return null;
    }
  }


  // ============================================
  // UI HELPERS
  // ============================================

  function updateUserDisplay() {

    const userEmail =
      document.querySelector(
        "#userEmail"
      );

    if (userEmail && currentUser) {

      userEmail.textContent =
        currentUser.name ||
        currentUser.username ||
        "";
    }


    const userName =
      document.querySelector(
        "#userName"
      );

    if (userName && currentUser) {

      userName.textContent =
        currentUser.name ||
        currentUser.username ||
        "";
    }


    const userRole =
      document.querySelector(
        "#userRole"
      );

    if (userRole && currentUser) {

      userRole.textContent =
        currentUser.role ||
        "";
    }
  }


  function hideLogin() {

    const loginScreen =
      document.querySelector(
        "#loginScreen"
      );

    if (loginScreen) {
      loginScreen.classList.add(
        "hidden"
      );
    }


    const loadingScreen =
      document.querySelector(
        "#loadingScreen"
      );

    if (loadingScreen) {
      loadingScreen.classList.add(
        "hidden"
      );
    }


    const mainApp =
      document.querySelector(
        "#mainApp"
      );

    if (mainApp) {
      mainApp.classList.remove(
        "hidden"
      );
    }


    const accessDenied =
      document.querySelector(
        "#accessDeniedScreen"
      );

    if (accessDenied) {
      accessDenied.classList.add(
        "hidden"
      );
    }
  }


  function showLogin() {

    const loadingScreen =
      document.querySelector(
        "#loadingScreen"
      );

    if (loadingScreen) {
      loadingScreen.classList.add(
        "hidden"
      );
    }


    const mainApp =
      document.querySelector(
        "#mainApp"
      );

    if (mainApp) {
      mainApp.classList.add(
        "hidden"
      );
    }


    const accessDenied =
      document.querySelector(
        "#accessDeniedScreen"
      );

    if (accessDenied) {
      accessDenied.classList.add(
        "hidden"
      );
    }


    let loginScreen =
      document.querySelector(
        "#loginScreen"
      );


    // Create login screen if the
    // existing HTML doesn't have one.
    if (!loginScreen) {

      loginScreen =
        createLoginScreen();

      document.body.prepend(
        loginScreen
      );
    }


    loginScreen.classList.remove(
      "hidden"
    );


    const username =
      document.querySelector(
        "#loginUsername"
      );

    if (username) {
      username.focus();
    }
  }


  function createLoginScreen() {

    const screen =
      document.createElement(
        "section"
      );


    screen.id =
      "loginScreen";


    screen.style.cssText = `
      min-height:100vh;
      display:flex;
      align-items:center;
      justify-content:center;
      padding:24px;
      background:#f5f7fa;
      box-sizing:border-box;
    `;


    screen.innerHTML = `

      <div style="
        width:100%;
        max-width:420px;
        background:#ffffff;
        border-radius:16px;
        padding:32px;
        box-sizing:border-box;
        box-shadow:0 10px 35px rgba(0,0,0,.10);
      ">

        <div style="
          text-align:center;
          margin-bottom:28px;
        ">

          <h1 style="
            margin:0 0 8px;
            font-size:26px;
          ">
            TOUR INDIA
          </h1>

          <p style="
            margin:0;
            color:#667085;
          ">
            Tour Report Management System
          </p>

        </div>


        <form id="tourIndiaLoginForm">

          <label style="
            display:block;
            margin-bottom:7px;
            font-weight:600;
          ">
            Username
          </label>

          <input
            id="loginUsername"
            type="text"
            autocomplete="username"
            required
            style="
              width:100%;
              box-sizing:border-box;
              padding:12px 14px;
              border:1px solid #d0d5dd;
              border-radius:8px;
              margin-bottom:18px;
              font-size:15px;
            "
          />


          <label style="
            display:block;
            margin-bottom:7px;
            font-weight:600;
          ">
            Password
          </label>

          <input
            id="loginPassword"
            type="password"
            autocomplete="current-password"
            required
            style="
              width:100%;
              box-sizing:border-box;
              padding:12px 14px;
              border:1px solid #d0d5dd;
              border-radius:8px;
              margin-bottom:18px;
              font-size:15px;
            "
          />


          <div
            id="loginError"
            style="
              display:none;
              margin-bottom:16px;
              padding:10px 12px;
              border-radius:8px;
              background:#fef3f2;
              color:#b42318;
              font-size:14px;
            "
          ></div>


          <button
            id="loginButton"
            type="submit"
            style="
              width:100%;
              padding:13px;
              border:0;
              border-radius:8px;
              background:#111827;
              color:#ffffff;
              font-size:15px;
              font-weight:600;
              cursor:pointer;
            "
          >
            Sign In
          </button>


          <div
            id="loginStatus"
            style="
              text-align:center;
              margin-top:14px;
              color:#667085;
              font-size:13px;
            "
          ></div>

        </form>

      </div>
    `;


    const form =
      screen.querySelector(
        "#tourIndiaLoginForm"
      );


    form.addEventListener(
      "submit",
      async function(event) {

        event.preventDefault();


        const username =
          screen.querySelector(
            "#loginUsername"
          ).value;


        const password =
          screen.querySelector(
            "#loginPassword"
          ).value;


        const button =
          screen.querySelector(
            "#loginButton"
          );


        const errorBox =
          screen.querySelector(
            "#loginError"
          );


        const status =
          screen.querySelector(
            "#loginStatus"
          );


        errorBox.style.display =
          "none";


        button.disabled =
          true;


        button.textContent =
          "Signing in...";


        status.textContent =
          "Connecting to Tour India server...";


        try {

          await login(
            username,
            password
          );


          status.textContent =
            "Login successful.";


          hideLogin();


          // Allow the rest of the
          // application to initialize.
          document.dispatchEvent(
            new CustomEvent(
              "tourIndiaLoginSuccess",
              {
                detail: currentUser
              }
            )
          );


        } catch (error) {

          console.error(
            "Login failed:",
            error
          );


          errorBox.textContent =
            error.message ||
            "Unable to sign in.";


          errorBox.style.display =
            "block";


          status.textContent =
            "";
        }


        button.disabled =
          false;


        button.textContent =
          "Sign In";
      }
    );


    return screen;
  }


  function showDenied(error) {

    const loadingScreen =
      document.querySelector(
        "#loadingScreen"
      );

    if (loadingScreen) {
      loadingScreen.classList.add(
        "hidden"
      );
    }


    const mainApp =
      document.querySelector(
        "#mainApp"
      );

    if (mainApp) {
      mainApp.classList.add(
        "hidden"
      );
    }


    const accessDeniedScreen =
      document.querySelector(
        "#accessDeniedScreen"
      );

    if (accessDeniedScreen) {

      accessDeniedScreen.classList.remove(
        "hidden"
      );


      const message =
        document.querySelector(
          "#accessDeniedMessage"
        );


      if (message) {

        message.textContent =
          error?.message ||
          "Access denied.";
      }
    }
  }


  // ============================================
  // PUBLIC METHODS
  // ============================================

  return {

    init,

    login,

    logout,

    getUser: function() {
      return currentUser;
    },

    getToken: function() {
      return sessionToken;
    },

    isAuthenticated: function() {
      return !!sessionToken &&
             !!currentUser;
    },

    showDenied

  };

})();
