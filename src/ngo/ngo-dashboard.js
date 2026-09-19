const toastEl = document.getElementById("toast");
let toastTimer;
let currentOrgId = null;

function toast(msg) {
  clearTimeout(toastTimer);
  toastEl.textContent = msg;
  toastEl.classList.add("show");
  toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2200);
}

function readSession() {
  try {
    return JSON.parse(localStorage.getItem("SLUMLINK_SESSION") || "null");
  } catch {
    return null;
  }
}

function fmtNum(n) {
  const x = Number(n) || 0;
  return x.toLocaleString();
}

function fmtDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

async function safeJSON(res) {
  return res.json().catch(() => null);
}

async function fetchSummary(org_id) {
  const res = await fetch(`/api/dashboard/summary?org_id=${encodeURIComponent(org_id)}`);
  const data = await safeJSON(res);
  if (!res.ok) throw new Error(data?.message || "Failed to load dashboard summary");
  return data?.data;
}

async function fetchRecent(org_id, limit = 5) {
  const res = await fetch(`/api/dashboard/recent-distributions?org_id=${encodeURIComponent(org_id)}&limit=${limit}`);
  const data = await safeJSON(res);
  if (!res.ok) throw new Error(data?.message || "Failed to load recent distributions");
  return data?.data || [];
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function renderRecent(list) {
  const container = document.getElementById("recentAidList");
  if (!container) return;

  if (!list.length) {
    container.innerHTML = `<div class="aid-item"><div class="aid-title">No distributions yet</div><div class="aid-meta">Start a distribution session to see history here.</div></div>`;
    return;
  }

  container.innerHTML = list
    .map((x) => {
      const title = x.campaign_title || "Campaign";
      const area = x.slum_area || "—";
      const families = Number(x.families_assisted) || 0;
      const date = fmtDate(x.finished_at || x.started_at);

      return `
        <div class="aid-item clickable" data-session="${x.session_id}">
          <div class="aid-title">${title}</div>
          <div class="aid-meta">${area} • ${families} famil${families === 1 ? "y" : "ies"} assisted — tap to view</div>
          <div class="aid-date">${date}</div>
        </div>
      `;
    })
    .join("");

  container.querySelectorAll("[data-session]").forEach((el) => {
    el.addEventListener("click", function (e) {
      e.preventDefault();
      const sid = Number(this.getAttribute("data-session"));
      const item = list.find((x) => Number(x.session_id) === sid);
      if (item) showFamiliesModal(item);
    });
  });
}

function escapeHtml(text) {
  const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" };
  return String(text).replace(/[&<>"']/g, (m) => map[m]);
}

async function fetchSessionFamilies(sessionId) {
  const res = await fetch(
    `/api/dashboard/session/${encodeURIComponent(sessionId)}/families?org_id=${encodeURIComponent(currentOrgId)}`
  );
  const data = await safeJSON(res);
  if (!res.ok) throw new Error(data?.message || "Failed to load families");
  return data?.data || null;
}

function closeFamiliesModal() {
  const modal = document.getElementById("familiesModal");
  if (!modal) return;
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function showFamiliesModal(item) {
  const modal = document.getElementById("familiesModal");
  const bodyEl = document.getElementById("familiesModalBody");
  const titleEl = document.getElementById("familiesModalTitle");

  if (!modal || !bodyEl) {
    toast(`Session #${item.session_id} • ${item.families_assisted} families assisted`);
    return;
  }

  const label = item.campaign_title || "Campaign";
  if (titleEl) titleEl.textContent = `${label} • Assisted Families`;
  bodyEl.innerHTML = `<div class="families-loading">Loading family details...</div>`;

  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  fetchSessionFamilies(item.session_id)
    .then((data) => {
      if (!data) return;
      const families = data.families || [];
      const summary = data.session || {};
      const famCount = families.length;
      const aidType = summary.aid_type || "";

      let html = `
        <div class="families-modal-summary">
          <span class="fms-chip">${famCount} famil${famCount === 1 ? "y" : "ies"} assisted</span>
          ${aidType ? `<span class="fms-chip">${escapeHtml(aidType)}</span>` : ""}
          ${summary.slum_area ? `<span class="fms-chip">${escapeHtml(summary.slum_area)}</span>` : ""}
          <span class="fms-chip">${fmtDate(summary.finished_at || summary.started_at)}</span>
        </div>
      `;

      if (!families.length) {
        html += `<p class="families-empty">No family records for this session.</p>`;
      } else {
        html += `<div class="family-list">` + families.map((f) => `
          <div class="family-card">
            <div class="family-card-head">
              <span class="family-code">${escapeHtml(f.slum_code || "—")}</span>
              <span class="family-size">${f.family_members} member${f.family_members === 1 ? "" : "s"}</span>
            </div>
            <div class="family-name">${escapeHtml(f.family_head || "—")}</div>
            <div class="family-details">
              ${f.mobile ? `<span><i class="fas fa-phone" aria-hidden="true"></i> ${escapeHtml(f.mobile)}</span>` : ""}
              ${f.area ? `<span><i class="fas fa-location-dot" aria-hidden="true"></i> ${escapeHtml(f.area)}</span>` : ""}
              ${f.quantity ? `<span><i class="fas fa-gift" aria-hidden="true"></i> ${escapeHtml(aidType || "Aid")} × ${f.quantity}</span>` : ""}
              ${f.comment ? `<span class="family-comment">${escapeHtml(f.comment)}</span>` : ""}
            </div>
          </div>
        `).join("") + `</div>`;
      }

      bodyEl.innerHTML = html;
    })
    .catch((err) => {
      console.error(err);
      bodyEl.innerHTML = `<p class="families-empty">Failed to load family details.</p>`;
    });
}

document.getElementById("familiesModalClose")?.addEventListener("click", closeFamiliesModal);
document.getElementById("familiesModal")?.addEventListener("click", (e) => {
  if (e.target === e.currentTarget) closeFamiliesModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeFamiliesModal();
});

// Navigation hooks (do NOT let the generic data-toast handler block these)
document.getElementById("qaAnalytics")?.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();
  window.location.href = "./ngo-analytics-overview.html";
});

document.getElementById("qaCreateCampaign")?.addEventListener("click", (e) => {
  e.preventDefault(); e.stopPropagation();
  const back = encodeURIComponent("../ngo/ngo-dashboard.html");
  window.location.href = `../shared/create-campaign.html?role=ngo&back=${back}`;
});

document.getElementById("qaViewCampaigns")?.addEventListener("click", (e) => {
  e.preventDefault(); e.stopPropagation();
  const back = encodeURIComponent("../ngo/ngo-dashboard.html");
  window.location.href = `../shared/viewcampaign.html?back=${back}`;
});

document.getElementById("qaAidDistribution")?.addEventListener("click", (e) => {
  e.preventDefault(); e.stopPropagation();
  const back = encodeURIComponent("../ngo/ngo-dashboard.html");
  window.location.href = `../shared/aid-distribution-setup.html?back=${back}`;
});

document.getElementById("profileBtn")?.addEventListener("click", (e) => {
  e.preventDefault();
  window.location.href = "/src/ngo/ngo-profile.html?role=ngo";
});

document.getElementById("brandBtn")?.addEventListener("click", (e) => {
  e.preventDefault();
  window.location.href = "/";
});

// Toast handler for static elements (safe)
document.querySelectorAll("[data-toast]").forEach((el) => {
  el.addEventListener("click", function (e) {
    e.preventDefault();
    toast(this.getAttribute("data-toast"));
  });
});

// ✅ Load dashboard data
(async function initDashboard() {
  const session = readSession();
  const org_id = session?.org_id;
  currentOrgId = org_id || null;

  if (!org_id) {
    toast("Session missing. Please sign in again.");
    return;
  }

  try {
    const summary = await fetchSummary(org_id);
    setText("familiesHelpedNum", fmtNum(summary.families_helped));
    setText("areasCoveredNum", fmtNum(summary.areas_covered));
    setText("completedCampaignsNum", fmtNum(summary.completed_campaigns));
    setText("activeCampaignsNum", fmtNum(summary.active_campaigns));

    const recent = await fetchRecent(org_id, 5);
    renderRecent(recent);
  } catch (err) {
    console.error(err);
    toast(err.message || "Failed to load dashboard data");
  }
})();