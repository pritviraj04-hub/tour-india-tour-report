document.addEventListener("DOMContentLoaded", async () => {

  // ============================================
  // CONNECTION STATUS
  // ============================================

  TIUtils.setConnection(navigator.onLine);

  window.addEventListener("online", () => {
    TIUtils.setConnection(true);
  });

  window.addEventListener("offline", () => {
    TIUtils.setConnection(false);
  });


  // ============================================
  // RETRY AUTHENTICATION
  // ============================================

  const retryAuthBtn =
    TIUtils.qs("#retryAuthBtn");

  if (retryAuthBtn) {

    retryAuthBtn.addEventListener(
      "click",
      () => location.reload()
    );

  }


  // ============================================
  // INITIAL LOADING STATE
  // ============================================

  const loadingScreen =
    TIUtils.qs("#loadingScreen");

  const mainApp =
    TIUtils.qs("#mainApp");

  if (loadingScreen) {
    loadingScreen.classList.remove("hidden");
  }

  if (mainApp) {
    mainApp.classList.add("hidden");
  }


  // ============================================
  // AUTHENTICATION
  // ============================================

  try {

    const user =
      await TIAuth.init();


    // ------------------------------------------
    // No active session
    // ------------------------------------------

    if (!user) {

      // TIAuth.init() displays the login screen.
      return;
    }


    // ------------------------------------------
    // Authenticated
    // ------------------------------------------

    console.log(
      "Tour India user authenticated:",
      user
    );


    // Initialize application modules only
    // after authentication succeeds.

    TITourForm.init();

    TIDashboard.init();


    if (loadingScreen) {
      loadingScreen.classList.add("hidden");
    }

    if (mainApp) {
      mainApp.classList.remove("hidden");
    }


    // Load dashboard data.

    await TIDashboard.refresh();


  } catch (error) {

    console.error(
      "Application initialization failed:",
      error
    );

  }

});
