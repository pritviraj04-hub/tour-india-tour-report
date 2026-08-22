window.TIDashboard = (() => {

  function token() {
    return TIAuth.getToken();
  }


  // ==========================================
  // DASHBOARD STATS
  // ==========================================

  async function loadStats() {

    const stats =
      await TIAPI.getDashboardStats(
        token()
      );

    const map = {

      statTotal:
        stats?.total,

      statCurrentYear:
        stats?.currentYear,

      statDraft:
        stats?.draft,

      statConfirmed:
        stats?.confirmed,

      statOnTour:
        stats?.onTour,

      statCompleted:
        stats?.completed,

      statCancelled:
        stats?.cancelled

    };


    Object.entries(map).forEach(
      ([id, value]) => {

        const element =
          TIUtils.qs("#" + id);

        if (element) {
          element.textContent =
            value ?? 0;
        }

      }
    );

  }


  // ==========================================
  // RENDER TOURS
  // ==========================================

  function render(tours) {

    const body =
      TIUtils.qs("#tourTableBody");

    if (!body) return;


    if (!Array.isArray(tours) || !tours.length) {

      body.innerHTML = `
        <tr>
          <td colspan="9" class="empty">
            No tours found.
          </td>
        </tr>
      `;

      return;
    }


    body.innerHTML =
      tours.map(t => `

        <tr>

          <td>
            <strong>
              ${TIUtils.esc(t.tourId || "—")}
            </strong>
          </td>

          <td>
            ${TIUtils.esc(t.school || "—")}
          </td>

          <td>
            ${TIUtils.esc(t.destination || "—")}
          </td>

          <td>
            ${TIUtils.esc(t.fromDate || "—")}
          </td>

          <td>
            ${TIUtils.esc(t.toDate || "—")}
          </td>

          <td>
            ${TIUtils.esc(t.tourLeader || "—")}
          </td>

          <td>
            <span class="pill">
              ${TIUtils.esc(t.status || "Draft")}
            </span>
          </td>

          <td>
            ${TIUtils.esc(t.lastUpdated || "—")}
          </td>

          <td>

            <div class="row-actions">

              <button
                class="btn secondary open-tour"
                data-id="${TIUtils.esc(t.tourId)}"
              >
                Open
              </button>

            </div>

          </td>

        </tr>

      `).join("");


    TIUtils.qsa(".open-tour")
      .forEach(button => {

        button.addEventListener(
          "click",
          async () => {

            try {

              const tour =
                await TIAPI.getTour(
                  button.dataset.id,
                  token()
                );

              TITourForm.open(tour);

            } catch (error) {

              console.error(
                "Unable to open tour:",
                error
              );

              TIUtils.toast(
                error.message ||
                "Unable to open tour.",
                "error"
              );

            }

          }
        );

      });

  }


  // ==========================================
  // LOAD TOURS
  // ==========================================

  async function load(
    query = ""
  ) {

    const body =
      TIUtils.qs("#tourTableBody");


    if (body) {

      body.innerHTML = `
        <tr>
          <td colspan="9" class="empty">
            Loading tours…
          </td>
        </tr>
      `;

    }


    try {

      const tours =
        await TIAPI.searchTours(
          query,
          token()
        );

      render(tours);

      return tours;

    } catch (error) {

      console.error(
        "Unable to load tours:",
        error
      );


      if (body) {

        body.innerHTML = `
          <tr>
            <td colspan="9" class="empty">
              Unable to load tours.
              <br>
              <small>
                ${TIUtils.esc(
                  error.message ||
                  "Connection error."
                )}
              </small>
            </td>
          </tr>
        `;

      }


      TIUtils.toast(
        error.message ||
        "Unable to load tours.",
        "error"
      );


      throw error;

    }

  }


  // ==========================================
  // REFRESH
  // ==========================================

  async function refresh() {

    await Promise.all([
      load(),
      loadStats()
    ]);

  }


  // ==========================================
  // INITIALIZE
  // ==========================================

  function init() {

    const newTourBtn =
      TIUtils.qs("#newTourBtn");


    if (newTourBtn) {

      newTourBtn.addEventListener(
        "click",
        () => {

          try {

            TITourForm.open();

          } catch (error) {

            console.error(
              "Unable to open new tour:",
              error
            );

            TIUtils.toast(
              error.message ||
              "Unable to open new tour.",
              "error"
            );

          }

        }
      );

    }


    const searchBtn =
      TIUtils.qs("#searchBtn");


    const searchInput =
      TIUtils.qs("#searchInput");


    if (searchBtn) {

      searchBtn.addEventListener(
        "click",
        () => {

          const query =
            searchInput
              ? searchInput.value.trim()
              : "";

          load(query)
            .catch(() => {});

        }
      );

    }


    if (searchInput) {

      searchInput.addEventListener(
        "keydown",
        event => {

          if (
            event.key === "Enter"
          ) {

            if (searchBtn) {
              searchBtn.click();
            }

          }

        }
      );

    }

  }


  return {
    init,
    load,
    refresh
  };

})();
