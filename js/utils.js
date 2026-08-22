window.TIUtils = {
  qs: (selector, root=document) => root.querySelector(selector),
  qsa: (selector, root=document) => [...root.querySelectorAll(selector)],
  esc(value="") {
    return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  },
  debounce(fn, delay) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  },
  toast(message, type="") {
    const el = this.qs("#toast");
    el.textContent = message;
    el.className = `toast ${type}`;
    setTimeout(() => el.classList.add("hidden"), 3200);
  },
  setConnection(online) {
    const el = this.qs("#connectionBadge");
    el.textContent = online ? "Online" : "Offline";
    el.className = `status-badge ${online ? "online" : "offline"}`;
  },
  academicYear(date = new Date()) {
    const y = date.getFullYear();
    const start = date.getMonth() >= 3 ? y : y - 1;
    return `${start}-${String(start + 1).slice(-2)}`;
  }
};
