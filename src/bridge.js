(() => {
  if (window.__cfbBridge) return;
  window.__cfbBridge = true;

  const csrf = () =>
    document.querySelector("meta[name='X-Csrf-Token']")?.content ||
    document.querySelector("input[name='csrf_token']")?.value ||
    "";

  async function post(url, data) {
    const body = new URLSearchParams(data);
    const token = csrf();
    if (token && !body.has("csrf_token")) body.set("csrf_token", token);
    try {
      const tta = window.Codeforces?.tta?.();
      if (tta) body.set("_tta", tta);
    } catch {}
    const response = await fetch(url, {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "X-Requested-With": "XMLHttpRequest",
        "X-Csrf-Token": token,
      },
      body,
    });
    const text = await response.text();
    try {
      return { ok: true, json: JSON.parse(text) };
    } catch {
      return { ok: false, status: response.status, text: text.slice(0, 300) };
    }
  }

  document.addEventListener("cfb:request", async (event) => {
    const { id, url, data } = JSON.parse(event.detail);
    let result;
    try {
      result = await post(url, data);
    } catch (error) {
      result = { ok: false, error: String(error) };
    }
    document.dispatchEvent(new CustomEvent("cfb:response", { detail: JSON.stringify({ id, result }) }));
  });

  const HANDOFF_KEY = "forcesBetter:handoff";

  function fillSubmitPage() {
    let handoff;
    try {
      handoff = JSON.parse(localStorage.getItem(HANDOFF_KEY));
    } catch {}
    if (!handoff || Date.now() - handoff.time > 120000) return;
    const form = document.querySelector("form.submit-form, form.submitForm");
    if (!form) return;
    localStorage.removeItem(HANDOFF_KEY);

    const change = (el) => el.dispatchEvent(new Event("change", { bubbles: true }));
    const index = form.querySelector("select[name='submittedProblemIndex']");
    if (index && handoff.index) {
      index.value = handoff.index;
      change(index);
    }
    const code = form.querySelector("input[name='submittedProblemCode']");
    if (code && handoff.code) code.value = handoff.code;
    const lang = form.querySelector("select[name='programTypeId']");
    if (lang && handoff.lang) {
      lang.value = handoff.lang;
      change(lang);
    }
    const textarea = form.querySelector("textarea[name='source']");
    if (textarea) textarea.value = handoff.source;
    const host = document.getElementById("editor");
    if (window.ace && host?.classList.contains("ace_editor")) {
      ace.edit(host).setValue(handoff.source, -1);
    }
    const button = form.querySelector("input[type='submit'], button[type='submit']");
    button?.scrollIntoView({ block: "center" });
    button?.classList.add("cfb-handoff");
  }

  if (/\/submit(\/|$)/.test(location.pathname)) {
    if (document.readyState === "complete") fillSubmitPage();
    else window.addEventListener("load", fillSubmitPage, { once: true });
  }
})();
