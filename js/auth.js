window.TIAuth = (() => {
  let currentUser = null;

  async function init() {
    try {
      currentUser = await TIAPI.getCurrentUser();
      if (!currentUser || !currentUser.authorized) {
        throw Object.assign(new Error("Access denied"), {code:"ACCESS_DENIED"});
      }
      TIUtils.qs("#userEmail").textContent = currentUser.email || "";
      return currentUser;
    } catch (error) {
      showDenied(error);
      throw error;
    }
  }

  function showDenied(error) {
    TIUtils.qs("#loadingScreen").classList.add("hidden");
    TIUtils.qs("#mainApp").classList.add("hidden");
    TIUtils.qs("#accessDeniedScreen").classList.remove("hidden");
    TIUtils.qs("#accessDeniedMessage").textContent =
      error.code === "ACCESS_DENIED"
        ? "Your Google account is not authorized for the Tour India system."
        : (error.message || "Unable to authenticate.");
  }

  function getUser() { return currentUser; }

  return {init, getUser};
})();
