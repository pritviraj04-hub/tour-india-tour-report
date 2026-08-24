window.TITourForm = (() => {

  let editingId = null;
  let createRequestId = null;

  // ==========================================
  // FIELD MAP
  // ==========================================

  const fields = {

    tourId: "#tourId",
    school: "#school",
    destination: "#destination",
    tourLeader: "#tourLeader",

    fromDate: "#fromDate",
    toDate: "#toDate",

    status: "#status",
    academicYear: "#academicYear",

    boys: "#boys",
    girls: "#girls",

    teacherMale: "#teacherMale",
    teacherFemale: "#teacherFemale",

    escortMale: "#escortMale",
    escortFemale: "#escortFemale",

    totalPax: "#totalPax",

    remarks: "#remarks"

  };


  // ==========================================
  // HELPERS
  // ==========================================

  function val(name) {

    const element =
      TIUtils.qs(fields[name]);

    return element
      ? element.value
      : "";

  }


  function num(name) {

    return Number(
      val(name) || 0
    );

  }
  function dateValue(value) {

  if (!value) {
    return "";
  }

  const text =
    String(value);

  // Already in HTML date format
  if (
    /^\d{4}-\d{2}-\d{2}$/.test(text)
  ) {
    return text;
  }

  // ISO datetime
  if (
    /^\d{4}-\d{2}-\d{2}T/.test(text)
  ) {
    return text.substring(0, 10);
  }

  // Try normal Date parsing as fallback
  const date =
    new Date(text);

  if (!isNaN(date.getTime())) {

    const year =
      date.getFullYear();

    const month =
      String(
        date.getMonth() + 1
      ).padStart(2, "0");

    const day =
      String(
        date.getDate()
      ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  return "";
}
  function generateRequestId() {

  if (
    window.crypto &&
    typeof window.crypto.randomUUID === "function"
  ) {

    return window.crypto.randomUUID();

  }

  return (
    "REQ-" +
    Date.now() +
    "-" +
    Math.random()
      .toString(36)
      .substring(2, 12)
  );

}


  function token() {

    const sessionToken =
      TIAuth.getToken();

    if (!sessionToken) {

      throw Object.assign(
        new Error(
          "Your session has expired. Please sign in again."
        ),
        {
          code:
            "AUTHENTICATION_REQUIRED"
        }
      );

    }

    return sessionToken;

  }


  // ==========================================
  // CALCULATE GROUP STRENGTH
  // ==========================================

  function calculate() {

    const total =
      num("boys") +
      num("girls") +
      num("teacherMale") +
      num("teacherFemale") +
      num("escortMale") +
      num("escortFemale");


    const totalPax =
      TIUtils.qs(
        fields.totalPax
      );


    if (totalPax) {

      totalPax.value =
        total;

    }

  }


  // ==========================================
  // COLLECT FORM DATA
  // ==========================================

  function collect() {

    return {

      tourId:
        val("tourId") ||
        null,

      school:
        val("school").trim(),

      destination:
        val("destination").trim(),

      tourLeader:
        val("tourLeader").trim(),

      fromDate:
        val("fromDate") ||
        null,

      toDate:
        val("toDate") ||
        null,

      status:
        val("status") ||
        "Draft",

      academicYear:
        val("academicYear") ||
        TIUtils.academicYear(),

      group: {

        students: {

          boys:
            num("boys"),

          girls:
            num("girls")

        },

        teachers: {

          male:
            num("teacherMale"),

          female:
            num("teacherFemale")

        },

        escorts: {

          male:
            num("escortMale"),

          female:
            num("escortFemale")

        }

      },

      remarks:
        val("remarks").trim()

    };

  }


  // ==========================================
  // FILL FORM
  // ==========================================

  function fill(tour = {}) {

    editingId =
      tour.tourId ||
      null;


    const group =
      tour.group || {};


    const students =
      group.students || {};


    const teachers =
      group.teachers || {};


    const escorts =
      group.escorts || {};


    const values = {

      tourId:
        tour.tourId || "",

      school:
        tour.school || "",

      destination:
        tour.destination || "",

      tourLeader:
        tour.tourLeader || "",

      fromDate:
        dateValue(tour.fromDate),

    toDate:
        dateValue(tour.toDate),

      status:
        tour.status || "Draft",

      academicYear:
        tour.academicYear ||
        TIUtils.academicYear(),

      boys:
        students.boys || 0,

      girls:
        students.girls || 0,

      teacherMale:
        teachers.male || 0,

      teacherFemale:
        teachers.female || 0,

      escortMale:
        escorts.male || 0,

      escortFemale:
        escorts.female || 0,

      remarks:
        tour.remarks || ""

    };


    Object.entries(values)
      .forEach(([name, value]) => {

        const element =
          TIUtils.qs(
            fields[name]
          );

        if (element) {

          element.value =
            value;

        }

      });


    calculate();

  }


  // ==========================================
  // BLANK NEW TOUR
  // ==========================================

  function blank() {
  editingId = null;
  createRequestId = null;

  fill({

      tourId: null,

      school: "",

      destination: "",

      tourLeader: "",

      fromDate: "",

      toDate: "",

      status: "Draft",

      academicYear:
        TIUtils.academicYear(),

      group: {

        students: {
          boys: 0,
          girls: 0
        },

        teachers: {
          male: 0,
          female: 0
        },

        escorts: {
          male: 0,
          female: 0
        }

      },

      remarks: ""

    });

  }


  // ==========================================
  // VALIDATION
  // ==========================================

  function validate(tour) {

    if (!tour.school) {

      throw new Error(
        "School name is required."
      );

    }


    if (!tour.destination) {

      throw new Error(
        "Destination is required."
      );

    }


    if (
      tour.fromDate &&
      tour.toDate &&
      tour.toDate < tour.fromDate
    ) {

      throw new Error(
        "To Date cannot be earlier than From Date."
      );

    }


    const counts = [

      tour.group.students.boys,
      tour.group.students.girls,

      tour.group.teachers.male,
      tour.group.teachers.female,

      tour.group.escorts.male,
      tour.group.escorts.female

    ];


    if (
      counts.some(
        value =>
          !Number.isFinite(value) ||
          value < 0
      )
    ) {

      throw new Error(
        "Group counts cannot be negative."
      );

    }

  }


  // ==========================================
  // SAVE TOUR
  // ==========================================

  async function save() {

    const tour =
      collect();


    validate(tour);


    const sessionToken =
      token();


    const saveMessage =
      TIUtils.qs(
        "#saveMessage"
      );


    if (saveMessage) {

      saveMessage.textContent =
        "Saving…";

    }


    const saveButton =
      TIUtils.qs(
        "#saveTourBtn"
      );


    if (saveButton) {

      saveButton.disabled =
        true;

      saveButton.textContent =
        "Saving…";

    }


    try {

      let data;


      // ========================================
      // UPDATE EXISTING TOUR
      // ========================================

      if (editingId) {

        data =
          await TIAPI.updateTour(
            tour,
            sessionToken
          );

      }


      // ========================================
      // CREATE NEW TOUR
      // ========================================

      else {

  /*
   * Generate the idempotency key only once.
   *
   * If the browser times out while Apps Script is
   * still creating the tour, clicking Save again
   * will reuse this same request ID.
   *
   * The backend can therefore return the already-created
   * tour instead of creating another tour.
   */

  if (!createRequestId) {

    createRequestId =
      generateRequestId();

  }


  data =
    await TIAPI.createTour(
      tour,
      createRequestId
    );

}


      if (
        !data ||
        !data.tour
      ) {

        throw new Error(
          "The server returned an invalid tour response."
        );

      }


      editingId =
        data.tour.tourId;
      /*
       * Creation is complete.
       * The idempotency key is no longer needed.
      */
createRequestId = null;


      fill(
        data.tour
      );


      if (saveMessage) {

        saveMessage.textContent =
          `Saved ${data.tour.tourId}`;

      }


      TIUtils.toast(
        `Tour ${data.tour.tourId} saved successfully.`
      );


      // Refresh dashboard in background
      // if it is available.

      if (
        window.TIDashboard &&
        typeof TIDashboard.refresh ===
          "function"
      ) {

        TIDashboard.refresh()
          .catch(error => {

            console.warn(
              "Dashboard refresh failed:",
              error
            );

          });

      }


      return data.tour;


    } catch (error) {

      console.error(
        "Tour save failed:",
        error
      );


      if (saveMessage) {

        saveMessage.textContent =
          error.message ||
          "Unable to save tour.";

      }


      // If session expired, return the
      // user to the login screen.

      if (
        error.code ===
        "AUTHENTICATION_REQUIRED"
      ) {

        await TIAuth.logout();

        return null;

      }


      TIUtils.toast(
        error.message ||
        "Unable to save tour.",
        "error"
      );


      throw error;


    } finally {

      if (saveButton) {

        saveButton.disabled =
          false;

        saveButton.textContent =
          "Save Tour";

      }

    }

  }


  // ==========================================
  // OPEN TOUR MODAL
  // ==========================================

  function open(
    tour = null
  ) {

    const modal =
      TIUtils.qs(
        "#tourModal"
      );


    if (!modal) {

      throw new Error(
        "Tour form is not available."
      );

    }


    modal.classList.remove(
      "hidden"
    );


    const title =
      TIUtils.qs(
        "#tourModalTitle"
      );


    if (title) {

      title.textContent =
        tour
          ? "Edit Tour"
          : "New Tour";

    }


    if (tour) {

      fill(tour);

    } else {

      blank();

    }


    const saveMessage =
      TIUtils.qs(
        "#saveMessage"
      );


    if (saveMessage) {

      saveMessage.textContent =
        "";

    }

  }


  // ==========================================
  // CLOSE TOUR MODAL
  // ==========================================

  function close() {

    const modal =
      TIUtils.qs(
        "#tourModal"
      );


    if (modal) {

      modal.classList.add(
        "hidden"
      );

    }

  }


  // ==========================================
  // INITIALIZE
  // ==========================================

  function init() {

    Object.values(fields)
      .forEach(selector => {

        const element =
          TIUtils.qs(selector);


        if (
          element &&
          [
            "INPUT",
            "SELECT",
            "TEXTAREA"
          ].includes(
            element.tagName
          )
        ) {

          element.addEventListener(
            "input",
            calculate
          );


          element.addEventListener(
            "change",
            calculate
          );

        }

      });


    const saveButton =
      TIUtils.qs(
        "#saveTourBtn"
      );


    if (saveButton) {

      saveButton.addEventListener(
        "click",
        async () => {

          try {

            await save();

          } catch (error) {

            console.error(
              "Save button error:",
              error
            );

          }

        }
      );

    }


    const cancelButton =
      TIUtils.qs(
        "#cancelTourBtn"
      );


    if (cancelButton) {

      cancelButton.addEventListener(
        "click",
        close
      );

    }


    const closeButton =
      TIUtils.qs(
        "#closeTourModal"
      );


    if (closeButton) {

      closeButton.addEventListener(
        "click",
        close
      );

    }

  }


  // ==========================================
  // PUBLIC API
  // ==========================================

  return {

    init,
    open,
    close,
    save,
    collect

  };

})();
