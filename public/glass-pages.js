(() => {
  const UI_KEY = "cc_ui_version";
  const THEME_KEY = "cc_glass_theme";
  const root = document.documentElement;
  const media = window.matchMedia("(prefers-color-scheme: dark)");

  function savedUi() {
    return localStorage.getItem(UI_KEY) === "glass" ? "glass" : "classic";
  }
  function savedTheme() {
    const value = localStorage.getItem(THEME_KEY);
    return value === "light" || value === "dark" || value === "system" ? value : "system";
  }
  function resolveTheme(value) {
    return value === "system" ? (media.matches ? "dark" : "light") : value;
  }
  function apply() {
    const ui = savedUi();
    const theme = savedTheme();
    root.classList.toggle("cc-static-glass", ui === "glass");
    if (ui === "glass") root.dataset.ccTheme = resolveTheme(theme);
    else delete root.dataset.ccTheme;
  }
  function setUi(value) {
    localStorage.setItem(UI_KEY, value);
    apply();
    renderControls();
  }
  function cycleTheme() {
    const current = savedTheme();
    const next = current === "system" ? "light" : current === "light" ? "dark" : "system";
    localStorage.setItem(THEME_KEY, next);
    apply();
    renderControls();
  }
  function renderControls() {
    document.querySelector(".cc-static-controls")?.remove();
    if (!document.body) return;
    const ui = savedUi();
    const controls = document.createElement("div");
    controls.className = "cc-static-controls";
    controls.innerHTML = '<button type="button" data-ui></button><button type="button" data-theme></button>';
    const uiButton = controls.querySelector("[data-ui]");
    const themeButton = controls.querySelector("[data-theme]");
    uiButton.textContent = ui === "glass" ? "Glass UI" : "Classic UI";
    themeButton.textContent = ui === "glass" ? "Theme: " + savedTheme() : "Try Glass";
    uiButton.addEventListener("click", () => setUi(ui === "glass" ? "classic" : "glass"));
    themeButton.addEventListener("click", () => ui === "glass" ? cycleTheme() : setUi("glass"));
    document.body.appendChild(controls);
  }

  apply();
  media.addEventListener?.("change", () => { if (savedTheme() === "system") apply(); });
  window.addEventListener("storage", () => {
    apply();
    renderControls();
  });
  document.addEventListener("DOMContentLoaded", renderControls);
})();