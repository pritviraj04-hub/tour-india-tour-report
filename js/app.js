document.addEventListener("DOMContentLoaded", async () => {
  TIUtils.setConnection(navigator.onLine);
  window.addEventListener("online", () => TIUtils.setConnection(true));
  window.addEventListener("offline", () => TIUtils.setConnection(false));

  TITourForm.init();
  TIDashboard.init();

  TIUtils.qs("#retryAuthBtn").addEventListener("click", () => location.reload());

  try {
    await TIAuth.init();
    TIUtils.qs("#loadingScreen").classList.add("hidden");
    TIUtils.qs("#mainApp").classList.remove("hidden");
    await TIDashboard.refresh();
  } catch (_) {
    // Auth module displays the access/error screen.
  }
});
