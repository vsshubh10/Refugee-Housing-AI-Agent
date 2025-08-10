/* script.js
   Shared JS for:
   - mobile nav toggle
   - generate blueprint form (POST)
   - fetching saved blueprints
   - modal viewing
   Keeps same backend API endpoints:
   - POST /api/blueprints/generate
   - GET  /api/blueprints/list
*/

(function () {
  // Mobile nav toggles for all pages
  function setupNavToggle() {
    const toggles = document.querySelectorAll(".nav-toggle");
    toggles.forEach(btn => {
      btn.addEventListener("click", () => {
        document.body.classList.toggle("nav-open");
      });
    });
  }

  // Modal helpers
  const modal = document.getElementById("modal");
  const modalContent = document.getElementById("modalContent");
  const modalClose = document.getElementById("modalClose");
  function openModal(html) {
    if (!modal) return;
    modalContent.innerHTML = html;
    modal.style.display = "flex";
    modal.setAttribute("aria-hidden", "false");
  }
  function closeModal() {
    if (!modal) return;
    modal.style.display = "none";
    modal.setAttribute("aria-hidden", "true");
    modalContent.innerHTML = "";
  }
  if (modalClose) modalClose.addEventListener("click", closeModal);
  if (modal) modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });

  // API helpers
  async function postGenerate(payload) {
    const res = await fetch("/api/blueprints/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      let err = { ok: false, error: `HTTP ${res.status}` };
      try { err = await res.json(); } catch (e) {}
      return err;
    }
    return res.json();
  }

  async function listBlueprints() {
    try {
      const res = await fetch("/api/blueprints/list");
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      return null;
    }
  }

  // Page-specific behavior
  async function initGeneratePage() {
    const form = document.getElementById("blueprintForm");
    const planText = document.getElementById("planText");
    const result = document.getElementById("result");
    const resultMeta = document.getElementById("resultMeta");
    const historySec = document.getElementById("history");
    const historyList = document.getElementById("historyList");
    const saveLocalBtn = document.getElementById("saveLocal");
    const viewPretty = document.getElementById("viewPretty");

    async function refreshHistory() {
      const data = await listBlueprints();
      if (!data || !Array.isArray(data.rows)) {
        if (historySec) historySec.style.display = "none";
        return;
      }
      if (data.rows.length === 0) {
        if (historySec) historySec.style.display = "none";
        return;
      }
      historySec.style.display = "block";
      historyList.innerHTML = "";
      data.rows.forEach(r => {
        const card = document.createElement("div");
        card.className = "bp-card card";
        const title = document.createElement("h3");
        title.textContent = r.location || "Untitled plan";
        const meta = document.createElement("div");
        meta.className = "bp-meta";
        meta.textContent = `${r.materials} • ${new Date(r.created_at).toLocaleString()}`;
        const btnRow = document.createElement("div");
        btnRow.style.marginTop = "10px";
        const viewBtn = document.createElement("button");
        viewBtn.className = "btn";
        viewBtn.textContent = "View";
        viewBtn.addEventListener("click", () => {
          openModal(`<h3>${escapeHtml(r.location || "Plan")}</h3>
            <p class="small">${escapeHtml(r.materials)} — ${escapeHtml(r.budget || "")}</p>
            <pre class="plan" style="white-space:pre-wrap;margin-top:10px;">${escapeHtml(r.plan)}</pre>`);
        });
        btnRow.appendChild(viewBtn);
        card.appendChild(title);
        card.appendChild(meta);
        card.appendChild(btnRow);
        historyList.appendChild(card);
      });
    }

    function escapeHtml(s = "") {
      return String(s).replace(/[&<>"']/g, function (m) {
        return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m];
      });
    }

    if (form) {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const location = document.getElementById("location").value.trim();
        const materialsRaw = document.getElementById("materials").value;
        const materials = materialsRaw.split(",").map(x => x.trim()).filter(Boolean);
        const climate = document.getElementById("climate").value;
        const culture = document.getElementById("culture").value.trim();
        const budget = document.getElementById("budget").value.trim();
        const payload = { location, materials, climate, culture, budget };

        planText.textContent = "Generating… please wait.";
        result.style.display = "block";
        resultMeta.textContent = new Date().toLocaleString();

        try {
          const r = await postGenerate(payload);
          if (r && (r.ok || r.plan || r.data)) {
            // server shape may vary; try to pick plan text
            const plan = r.plan || (r.data && r.data.plan) || JSON.stringify(r, null, 2);
            planText.textContent = plan;
            // refresh list
            await refreshHistory();
          } else {
            planText.textContent = "Error: " + (r.error || "Unknown error");
          }
        } catch (err) {
          planText.textContent = "Error: " + (err.message || err);
        }
      });
    }

    if (saveLocalBtn) {
      saveLocalBtn.addEventListener("click", () => {
        const text = planText.textContent || "";
        const blob = new Blob([text], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "blueprint.json";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      });
    }

    if (viewPretty) {
      viewPretty.addEventListener("click", () => {
        const txt = planText.textContent || "";
        openModal(`<pre class="plan">${escapeHtml(txt)}</pre>`);
      });
    }

    // initial load of history
    await refreshHistory();
  }

  async function initBlueprintsPage() {
    const grid = document.getElementById("savedGrid");
    const data = await listBlueprints();
    if (!data || !Array.isArray(data.rows) || data.rows.length === 0) {
      grid.innerHTML = `<div class="small">No blueprints found.</div>`;
      return;
    }
    grid.innerHTML = "";
    data.rows.forEach(r => {
      const card = document.createElement("div");
      card.className = "bp-card card";
      const title = document.createElement("h3");
      title.textContent = r.location || "Untitled plan";
      const meta = document.createElement("div");
      meta.className = "bp-meta";
      meta.textContent = `${r.materials} • ${new Date(r.created_at).toLocaleString()}`;
      const snippet = document.createElement("div");
      snippet.className = "small";
      snippet.style.marginTop = "8px";
      snippet.textContent = (r.plan || "").slice(0, 180) + (r.plan && r.plan.length > 180 ? "…" : "");
      const openBtn = document.createElement("button");
      openBtn.className = "btn";
      openBtn.style.marginTop = "10px";
      openBtn.textContent = "View Details";
      openBtn.addEventListener("click", () => {
        openModal(`<h3>${escapeHtml(r.location || "Plan")}</h3>
          <p class="small">${escapeHtml(r.materials)} — ${escapeHtml(r.budget || "")}</p>
          <pre class="plan" style="white-space:pre-wrap;margin-top:10px;">${escapeHtml(r.plan)}</pre>`);
      });
      card.appendChild(title);
      card.appendChild(meta);
      card.appendChild(snippet);
      card.appendChild(openBtn);
      grid.appendChild(card);
    });

    function escapeHtml(s = "") {
      return String(s).replace(/[&<>"']/g, function (m) {
        return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m];
      });
    }
  }

  // Init on load
  document.addEventListener("DOMContentLoaded", async () => {
    setupNavToggle();

    const page = document.body.getAttribute("data-page");
    try {
      if (page === "generate") await initGeneratePage();
      if (page === "blueprints") await initBlueprintsPage();
    } catch (e) {
      // safe fallback
      console.error("Init error:", e);
    }
  });

  // expose helpers for debugging
  window._refuge = {
    openModal: function (html) { openModal(html); },
    closeModal: closeModal
  };
})();
