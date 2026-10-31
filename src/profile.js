(() => {
  if (window !== window.top) return;
  const userbox = document.querySelector(".userbox");
  if (!userbox) return;
  const root = document.documentElement;

  const ICONS = {
    star_blue: '<path d="M12 3.5l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.8l-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z"/>',
    star_yellow: '<path d="M16 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 18.5V20"/><circle cx="10" cy="8" r="3.5"/><path d="M20 20v-1.5a3.5 3.5 0 0 0-2.5-3.35M15.5 4.65a3.5 3.5 0 0 1 0 6.7"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    mail_generic: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    blog: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4z"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  };
  const svg = (body) =>
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;

  function swapIcons(scope) {
    for (const img of scope.querySelectorAll("li img")) {
      const name = (img.getAttribute("src") || "").split("/").pop().replace(/(_\d+)?\.png.*$/, "");
      if (!ICONS[name]) continue;
      const icon = document.createElement("span");
      icon.className = `cfb-li-icon cfb-li-icon--${name}`;
      icon.title = img.title || "";
      icon.innerHTML = svg(ICONS[name]);
      img.replaceWith(icon);
    }
  }
  swapIcons(userbox);
  for (const li of userbox.querySelectorAll(".info > ul > li")) {
    if (li.querySelector(".cfb-li-icon")) continue;
    const name = /посещ|visit/i.test(li.textContent) ? "clock" : /регистр|registered/i.test(li.textContent) ? "calendar" : "info";
    const icon = document.createElement("span");
    icon.className = `cfb-li-icon cfb-li-icon--${name}`;
    icon.innerHTML = svg(ICONS[name]);
    li.prepend(icon);
  }
  for (const box of document.querySelectorAll("#sidebar .personal-sidebar")) swapIcons(box);

  const RANKS = [
    [0, 1200, "#a1a1aa", "Newbie"],
    [1200, 1400, "#4ade80", "Pupil"],
    [1400, 1600, "#2dd4bf", "Specialist"],
    [1600, 1900, "#60a5fa", "Expert"],
    [1900, 2100, "#c084fc", "Candidate Master"],
    [2100, 2300, "#fbbf24", "Master"],
    [2300, 2400, "#fb923c", "International Master"],
    [2400, 2600, "#f87171", "Grandmaster"],
    [2600, 3000, "#ef4444", "International Grandmaster"],
    [3000, 5000, "#dc2626", "Legendary Grandmaster"],
  ];
  const rankOf = (r) => RANKS.find(([lo, hi]) => r >= lo && r < hi) ?? RANKS[0];

  const placeholder = document.getElementById("usersRatingGraphPlaceholder");
  const graphBox = placeholder?.closest(".roundbox");
  const handle = userbox.querySelector(".main-info h1 a")?.textContent.trim();
  if (!graphBox || !handle) return;

  const card = document.createElement("section");
  card.className = "cfb-rating";
  graphBox.before(card);
  root.setAttribute("data-cfb-rating", "");

  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };

  function stat(label, value, color) {
    const box = el("div", "cfb-rating-stat");
    const v = el("strong", "", value);
    if (color) v.style.color = color;
    box.append(v, el("span", "", label));
    return box;
  }

  function renderEmpty() {
    card.replaceChildren();
    const empty = el("div", "cfb-rating-empty");
    empty.innerHTML = svg('<path d="M3 3v18h18"/><path d="m7 15 4-4 3 3 5-6"/>');
    empty.append(el("strong", "", "No rated contests yet"), el("span", "", "The rating graph appears after the first rated contest."));
    card.append(empty);
  }

  const NS = "http://www.w3.org/2000/svg";
  const node = (tag, attrs = {}) => {
    const n = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    return n;
  };

  function renderChart(history) {
    const current = history.at(-1).newRating;
    const best = Math.max(...history.map((h) => h.newRating));
    card.replaceChildren();

    const head = el("header", "cfb-rating-head");
    head.append(
      stat("Rating", String(current), rankOf(current)[2]),
      stat("Max rating", String(best), rankOf(best)[2]),
      stat("Contests", String(history.length)),
      stat("Best place", String(Math.min(...history.map((h) => h.rank)))),
    );
    const plot = el("div", "cfb-rating-plot");
    const tip = el("div", "cfb-rating-tip");
    tip.hidden = true;
    plot.append(tip);
    card.append(head, plot);

    const draw = () => {
      plot.querySelector("svg")?.remove();
      const W = Math.max(320, plot.clientWidth);
      const H = 260;
      const pad = { l: 44, r: 14, t: 14, b: 26 };
      const ratings = history.flatMap((h) => [h.oldRating || h.newRating, h.newRating]);
      let lo = Math.min(...ratings) - 100;
      let hi = Math.max(...ratings) + 100;
      lo = Math.max(0, Math.floor(lo / 100) * 100);
      hi = Math.ceil(hi / 100) * 100;
      const t0 = history[0].ratingUpdateTimeSeconds;
      const t1 = Math.max(t0 + 86400, history.at(-1).ratingUpdateTimeSeconds);
      const x = (t) => pad.l + ((t - t0) / (t1 - t0)) * (W - pad.l - pad.r);
      const y = (r) => pad.t + (1 - (r - lo) / (hi - lo)) * (H - pad.t - pad.b);

      const chart = node("svg", { viewBox: `0 0 ${W} ${H}`, width: W, height: H });
      let lastLabel = -Infinity;
      for (const [a, b, color] of RANKS) {
        const top = Math.min(hi, b);
        const bottom = Math.max(lo, a);
        if (top <= bottom) continue;
        chart.append(node("rect", { x: pad.l, y: y(top), width: W - pad.l - pad.r, height: y(bottom) - y(top), fill: color, "fill-opacity": "0.09" }));
        if (bottom > lo && Math.abs(y(bottom) - lastLabel) >= 14) {
          lastLabel = y(bottom);
          chart.append(node("line", { x1: pad.l, x2: W - pad.r, y1: y(bottom), y2: y(bottom), class: "cfb-rating-grid" }));
          const label = node("text", { x: pad.l - 8, y: y(bottom) + 4, class: "cfb-rating-axis", "text-anchor": "end" });
          label.textContent = bottom;
          chart.append(label);
        }
      }
      const firstYear = new Date(t0 * 1000).getUTCFullYear() + 1;
      const lastYear = new Date(t1 * 1000).getUTCFullYear();
      const step = Math.max(1, Math.ceil((lastYear - firstYear + 1) / ((W - pad.l - pad.r) / 48)));
      for (let year = firstYear; year <= lastYear; year += step) {
        const tx = x(Date.UTC(year, 0, 1) / 1000);
        const label = node("text", { x: tx, y: H - 6, class: "cfb-rating-axis", "text-anchor": "middle" });
        label.textContent = year;
        chart.append(label);
      }

      const points = history.map((h) => [x(h.ratingUpdateTimeSeconds), y(h.newRating)]);
      const path = points.map(([px, py], i) => `${i ? "L" : "M"}${px.toFixed(1)},${py.toFixed(1)}`).join("");
      const area = `${path}L${points.at(-1)[0].toFixed(1)},${H - pad.b}L${points[0][0].toFixed(1)},${H - pad.b}Z`;
      const gradient = node("linearGradient", { id: "cfb-rating-fill", x1: "0", x2: "0", y1: "0", y2: "1" });
      gradient.append(node("stop", { offset: "0", "stop-color": "var(--cfb-accent)", "stop-opacity": "0.22" }), node("stop", { offset: "1", "stop-color": "var(--cfb-accent)", "stop-opacity": "0" }));
      const defs = node("defs");
      defs.append(gradient);
      chart.append(defs, node("path", { d: area, fill: "url(#cfb-rating-fill)" }), node("path", { d: path, class: "cfb-rating-line" }));

      const dots = history.map((h, i) => {
        const dot = node("circle", { cx: points[i][0], cy: points[i][1], r: history.length > 80 ? 2.5 : 3.5, fill: rankOf(h.newRating)[2], class: "cfb-rating-dot" });
        chart.append(dot);
        return dot;
      });
      const cursor = node("line", { y1: pad.t, y2: H - pad.b, class: "cfb-rating-cursor", visibility: "hidden" });
      chart.append(cursor);

      chart.addEventListener("pointermove", (e) => {
        const box = chart.getBoundingClientRect();
        const mx = ((e.clientX - box.left) / box.width) * W;
        let best = 0;
        points.forEach(([px], i) => {
          if (Math.abs(px - mx) < Math.abs(points[best][0] - mx)) best = i;
        });
        const h = history[best];
        const delta = h.newRating - h.oldRating;
        dots.forEach((d, i) => d.classList.toggle("is-active", i === best));
        cursor.setAttribute("x1", points[best][0]);
        cursor.setAttribute("x2", points[best][0]);
        cursor.setAttribute("visibility", "visible");
        tip.replaceChildren(
          el("strong", "", h.contestName),
          el("span", "", `${h.newRating} (${delta >= 0 ? "+" : ""}${delta}) · rank ${h.rank} · ${rankOf(h.newRating)[3]}`),
          el("small", "", new Date(h.ratingUpdateTimeSeconds * 1000).toLocaleDateString()),
        );
        tip.hidden = false;
        const left = (points[best][0] / W) * box.width;
        tip.style.left = `${Math.min(box.width - tip.offsetWidth - 4, Math.max(4, left - tip.offsetWidth / 2))}px`;
        tip.style.top = `${(points[best][1] / H) * box.height > 120 ? 8 : 150}px`;
      });
      chart.addEventListener("pointerleave", () => {
        tip.hidden = true;
        cursor.setAttribute("visibility", "hidden");
        dots.forEach((d) => d.classList.remove("is-active"));
      });
      plot.append(chart);
    };
    draw();
    let frame = 0;
    new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(draw);
    }).observe(plot);
  }

  card.append(el("div", "cfb-rating-empty cfb-rating-loading", "Loading rating…"));
  fetch(`/api/user.rating?handle=${encodeURIComponent(handle)}`, { credentials: "same-origin" })
    .then((r) => r.json())
    .then((data) => {
      if (data.status !== "OK") throw new Error(data.comment);
      if (data.result.length) renderChart(data.result);
      else renderEmpty();
    })
    .catch(() => {
      card.remove();
      root.removeAttribute("data-cfb-rating");
    });
})();
