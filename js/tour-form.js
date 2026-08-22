window.TITourForm = (() => {
  let editingId = null;

  const fields = {
    tourId: "#tourId", school: "#school", destination: "#destination",
    tourLeader: "#tourLeader", fromDate: "#fromDate", toDate: "#toDate",
    status: "#status", academicYear: "#academicYear", boys: "#boys",
    girls: "#girls", teacherMale: "#teacherMale", teacherFemale: "#teacherFemale",
    escortMale: "#escortMale", escortFemale: "#escortFemale", totalPax: "#totalPax",
    remarks: "#remarks"
  };

  function val(name) { return TIUtils.qs(fields[name]).value; }
  function num(name) { return Number(val(name) || 0); }

  function calculate() {
    const total = num("boys")+num("girls")+num("teacherMale")+num("teacherFemale")+num("escortMale")+num("escortFemale");
    TIUtils.qs(fields.totalPax).value = total;
  }

  function collect() {
    return {
      tourId: val("tourId") || null,
      school: val("school").trim(),
      destination: val("destination").trim(),
      tourLeader: val("tourLeader").trim(),
      fromDate: val("fromDate") || null,
      toDate: val("toDate") || null,
      status: val("status"),
      academicYear: val("academicYear") || TIUtils.academicYear(),
      group: {
        students: {boys:num("boys"), girls:num("girls")},
        teachers: {male:num("teacherMale"), female:num("teacherFemale")},
        escorts: {male:num("escortMale"), female:num("escortFemale")}
      },
      remarks: val("remarks").trim()
    };
  }

  function fill(tour) {
    editingId = tour.tourId || null;
    Object.entries(fields).forEach(([name, selector]) => {
      const el = TIUtils.qs(selector);
      if (!el) return;
      if (name === "tourId") el.value = tour.tourId || "";
      else if (name === "school") el.value = tour.school || "";
      else if (name === "destination") el.value = tour.destination || "";
      else if (name === "tourLeader") el.value = tour.tourLeader || "";
      else if (name === "fromDate") el.value = tour.fromDate || "";
      else if (name === "toDate") el.value = tour.toDate || "";
      else if (name === "status") el.value = tour.status || "Draft";
      else if (name === "academicYear") el.value = tour.academicYear || TIUtils.academicYear();
      else if (name === "boys") el.value = tour.group?.students?.boys || 0;
      else if (name === "girls") el.value = tour.group?.students?.girls || 0;
      else if (name === "teacherMale") el.value = tour.group?.teachers?.male || 0;
      else if (name === "teacherFemale") el.value = tour.group?.teachers?.female || 0;
      else if (name === "escortMale") el.value = tour.group?.escorts?.male || 0;
      else if (name === "escortFemale") el.value = tour.group?.escorts?.female || 0;
      else if (name === "remarks") el.value = tour.remarks || "";
    });
    calculate();
  }

  function blank() {
    editingId = null;
    fill({
      tourId:null, status:"Draft", academicYear:TIUtils.academicYear(),
      group:{students:{boys:0,girls:0},teachers:{male:0,female:0},escorts:{male:0,female:0}}
    });
  }

  async function save() {
    const tour = collect();
    if (!tour.school || !tour.destination) throw new Error("School and destination are required.");
    if (tour.group.students.boys + tour.group.students.girls < 0) throw new Error("Invalid student count.");

    TIUtils.qs("#saveMessage").textContent = "Saving…";
    const data = editingId ? await TIAPI.updateTour(tour) : await TIAPI.createTour(tour);
    editingId = data.tour.tourId;
    fill(data.tour);
    TIUtils.qs("#saveMessage").textContent = `Saved ${data.tour.tourId}`;
    TIUtils.toast(`Tour ${data.tour.tourId} saved.`);
    return data.tour;
  }

  function open(tour=null) {
    TIUtils.qs("#tourModal").classList.remove("hidden");
    TIUtils.qs("#tourModalTitle").textContent = tour ? "Edit Tour" : "New Tour";
    if (tour) fill(tour); else blank();
    TIUtils.qs("#saveMessage").textContent = "";
  }

  function close() { TIUtils.qs("#tourModal").classList.add("hidden"); }

  function init() {
    Object.values(fields).forEach(selector => {
      const el = TIUtils.qs(selector);
      if (el && ["INPUT","SELECT","TEXTAREA"].includes(el.tagName)) {
        el.addEventListener("input", calculate);
        el.addEventListener("change", calculate);
      }
    });
    TIUtils.qs("#saveTourBtn").addEventListener("click", async () => {
      try { await save(); } catch(e) { TIUtils.toast(e.message, "error"); TIUtils.qs("#saveMessage").textContent = e.message; }
    });
    TIUtils.qs("#cancelTourBtn").addEventListener("click", close);
    TIUtils.qs("#closeTourModal").addEventListener("click", close);
  }

  return {init, open, close, save, collect};
})();
