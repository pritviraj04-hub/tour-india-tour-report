window.TICalculations = {
  pax(tour) {
    const students = Number(tour.group?.students?.boys || 0) + Number(tour.group?.students?.girls || 0);
    const teachers = Number(tour.group?.teachers?.male || 0) + Number(tour.group?.teachers?.female || 0);
    const escorts = Number(tour.group?.escorts?.male || 0) + Number(tour.group?.escorts?.female || 0);
    return {students, teachers, escorts, total: students + teachers + escorts};
  },
  lineTotal(quantity, rate) {
    return Number(quantity || 0) * Number(rate || 0);
  },
  balance(total, advance) {
    return Math.max(0, Number(total || 0) - Number(advance || 0));
  }
};
