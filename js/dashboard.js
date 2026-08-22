window.TIDashboard = (() => {

  // ==========================================
  // GET CURRENT SESSION TOKEN
  // ==========================================

  function token() {
    if (typeof TIAuth !== "undefined" && typeof TIAuth.getToken === "function") {
      return TIAuth.getToken();
    }

    return null;
  }


  // ==========================================
  // DASHBOARD STATS
  // ==========================================

  async function loadStats() {

    const stats = await TIAPI.getDashboardStats(token());

    const map = {

      // Backend returns totalTours
      statTotal:
        stats?.totalTours,

      // Backend returns currentYearTours
      statCurrentYear:
        stats?.currentYearTours,

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


    return stats;
  }


  // ==========================================
  // FORMAT DATE/TIME
  // ==========================================

  function formatUpdated(value) {

    if (!value) {
      return "—";
    }

    try {

      const date = new Date(value);

      if (isNaN(date.getTime())) {
        return value;
      }

      return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });

    } catch (error) {

      return value;

    }

  }


  // ==========================================
  // RENDER TOURS
  // ==========================================

  function render(tours) {

    const body =
      TIUtils.qs("#tourTableBody");

    if (!body) {
      return;
    }


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
      tours.map(t => {

        const updated =
          t.updatedAt ||
          t.lastUpdated ||
          t.createdAt ||
          "";


        return `

          <tr>

            <td>
              <strong>
                ${TIUtils.esc(
                  t.tourId || "—"
                )}
              </strong>
            </td>


            <td>
              ${TIUtils.esc(
                t.school || "—"
              )}
            </td>


            <td>
              ${TIUtils.esc(
                t.destination || "—"
              )}
            </td>


            <td>
              ${TIUtils.esc(
                t.fromDate || "—"
              )}
            </td>


            <td>
              ${TIUtils.esc(
                t.toDate || "—"
              )}
            </td>


            <td>
              ${TIUtils.esc(
                t.tourLeader || "—"
              )}
            </td>


            <td>

              <span class="pill">
                ${TIUtils.esc(
                  t.status || "Draft"
                )}
              </span>

            </td>


            <td>
              ${TIUtils.esc(
                formatUpdated(updated)
              )}
            </td>


            <td>

              <div class="row-actions">

                <button
                  class="btn secondary open-tour"
                  data-id="${TIUtils.esc(
                    t.tourId || ""
                  )}"
                >
                  Open
                </button>

              </div>

            </td>

          </tr>

        `;

      }).join("");


    // ==========================================
    // OPEN TOUR BUTTONS
    // ==========================================

    TIUtils.qsa(".open-tour")
      .forEach(button => {

        button.addEventListener(
          "click",
          async () => {

            const tourId =
              button.dataset.id;

            if (!tourId) {
              TIUtils.toast(
                "Tour ID is missing.",
                "error"
              );
              return;
            }


            try {

              button.disabled = true;
              button.textContent = "Opening…";


              const tour =
                await TIAPI.getTour(
                  tourId,
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


            } finally {

              button.disabled = false;
              button.textContent = "Open";

            }

          }
        );

      });

  }


  // ==========================================
  // LOAD TOURS
  // ==========================================

  async function load(query = "") {

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

    // ------------------------------------------
    // NEW TOUR
    // ------------------------------------------

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


    // ------------------------------------------
    // SEARCH
    // ------------------------------------------

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


    // ------------------------------------------
    // SEARCH WITH ENTER
    // ------------------------------------------

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


  // ==========================================
  // PUBLIC METHODS
  // ==========================================

  return {
    init,
    load,
    refresh,
    loadStats
  };

})();
