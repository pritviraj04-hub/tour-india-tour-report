document.addEventListener(
  "DOMContentLoaded",
  async () => {


    // ==========================================
    // CONNECTION STATUS
    // ==========================================

    TIUtils.setConnection(
      navigator.onLine
    );


    window.addEventListener(
      "online",
      () => {
        TIUtils.setConnection(true);
      }
    );


    window.addEventListener(
      "offline",
      () => {
        TIUtils.setConnection(false);
      }
    );


    // ==========================================
    // RETRY AUTH
    // ==========================================

    const retryAuthBtn =
      TIUtils.qs("#retryAuthBtn");


    if (retryAuthBtn) {

      retryAuthBtn.addEventListener(
        "click",
        () => location.reload()
      );

    }


    // ==========================================
    // SIGN OUT
    // ==========================================

    const logoutBtn =
      TIUtils.qs("#logoutBtn");


    if (logoutBtn) {

      logoutBtn.addEventListener(
        "click",
        async () => {

          const originalText =
            logoutBtn.textContent;

          logoutBtn.disabled = true;

          logoutBtn.textContent =
            "Signing out…";


          try {

            await TIAuth.logout();

          } catch (error) {

            console.error(
              "Logout error:",
              error
            );

            // TIAuth.logout() already clears
            // the local session in its finally
            // block, so still return to login.

          } finally {

            logoutBtn.disabled = false;

            logoutBtn.textContent =
              originalText;

          }

        }
      );

    }


    // ==========================================
    // INITIAL LOADING STATE
    // ==========================================

    const loadingScreen =
      TIUtils.qs("#loadingScreen");

    const mainApp =
      TIUtils.qs("#mainApp");


    if (loadingScreen) {
      loadingScreen.classList.remove(
        "hidden"
      );
    }


    if (mainApp) {
      mainApp.classList.add(
        "hidden"
      );
    }


    // ==========================================
    // AUTHENTICATION
    // ==========================================

    try {

      const user =
        await TIAuth.init();


      // No active session.
      // Login screen is displayed by TIAuth.

      if (!user) {
        return;
      }


      console.log(
        "Tour India user authenticated:",
        user
      );


      // ========================================
      // INITIALIZE APPLICATION
      // ========================================

      TITourForm.init();

      TIDashboard.init();


      if (loadingScreen) {

        loadingScreen.classList.add(
          "hidden"
        );

      }


      if (mainApp) {

        mainApp.classList.remove(
          "hidden"
        );

      }


      // ========================================
      // LOAD DASHBOARD
      // ========================================

      try {

        await TIDashboard.refresh();

      } catch (error) {

        console.error(
          "Dashboard loading failed:",
          error
        );

        TIUtils.toast(
          error.message ||
          "Unable to load dashboard data.",
          "error"
        );

      }


    } catch (error) {

      console.error(
        "Application initialization failed:",
        error
      );

    }

  }
);
