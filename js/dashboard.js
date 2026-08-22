window.TIDashboard = (() => {
  async function loadStats() {
    const stats = await TIAPI.getDashboardStats();
    const map = {
      statTotal:stats.total, statCurrentYear:stats.currentYear,
      statDraft:stats.draft, statConfirmed:stats.confirmed,
      statOnTour:stats.onTour, statCompleted:stats.completed,
      statCancelled:stats.cancelled
    };
    Object.entries(map).forEach(([id,value]) => TIUtils.qs("#"+id).textContent = value ?? 0);
  }

  function render(tours) {
    const body = TIUtils.qs("#tourTableBody");
    if (!tours?.length) {
      body.innerHTML = `<tr><td colspan="9" class="empty">No tours found.</td></tr>`;
      return;
    }
    body.innerHTML = tours.map(t => `
      <tr>
        <td><strong>${TIUtils.esc(t.tourId)}</strong></td>
        <td>${TIUtils.esc(t.school)}</td>
        <td>${TIUtils.esc(t.destination)}</td>
        <td>${TIUtils.esc(t.fromDate || "—")}</td>
        <td>${TIUtils.esc(t.toDate || "—")}</td>
        <td>${TIUtils.esc(t.tourLeader || "—")}</td>
        <td><span class="pill">${TIUtils.esc(t.status || "Draft")}</span></td>
        <td>${TIUtils.esc(t.lastUpdated || "—")}</td>
        <td>
          <div class="row-actions">
            <button class="btn secondary open-tour" data-id="${TIUtils.esc(t.tourId)}">Open</button>
          </div>
        </td>
      </tr>`).join("");

    TIUtils.qsa(".open-tour").forEach(btn => btn.addEventListener("click", async () => {
      try {
        const tour = await TIAPI.getTour(btn.dataset.id);
        TITourForm.open(tour);
      } catch(e) { TIUtils.toast(e.message, "error"); }
    }));
  }

  async function load(query="") {
    const tours = await TIAPI.searchTours(query);
    render(tours);
  }

  async function refresh() {
    await Promise.all([load(), loadStats()]);
  }

  function init() {
    TIUtils.qs("#newTourBtn").addEventListener("click", () => TITourForm.open());
    TIUtils.qs("#searchBtn").addEventListener("click", () => load(TIUtils.qs("#searchInput").value.trim()).catch(e => TIUtils.toast(e.message,"error")));
    TIUtils.qs("#searchInput").addEventListener("keydown", e => {
      if (e.key === "Enter") TIUtils.qs("#searchBtn").click();
    });
  }

  return {init, load, refresh};
})();
