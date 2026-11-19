// Asistente IA de integralflex.cl — widget flotante que consulta /.netlify/functions/assistant
(function () {
  if (window.__ifxAssistant) return;
  window.__ifxAssistant = true;

  const ENDPOINT = "/.netlify/functions/assistant";
  const STORE = "ifx-assistant-v1";
  const SUGGEST = [
    "¿Qué aplicación me sirve para gestionar residuos?",
    "Tengo un restaurante, ¿qué me ofrecen?",
    "¿Cuánto cuesta para 10 usuarios?",
    "¿Qué incluye el soporte remoto?",
  ];

  const css = `
  .ifx-fab{position:fixed;right:20px;bottom:20px;z-index:9998;display:flex;align-items:center;gap:10px;padding:12px 18px 12px 14px;border:0;border-radius:999px;background:#0078d4;color:#fff;font:600 15px/1 "Segoe UI",system-ui,sans-serif;box-shadow:0 6.4px 14.4px rgba(0,0,0,.18),0 1.2px 3.6px rgba(0,0,0,.14);cursor:pointer;transition:background .15s,transform .15s}
  .ifx-fab:hover{background:#106ebe;transform:translateY(-1px)}
  .ifx-fab:focus-visible{outline:3px solid #9fd0ff;outline-offset:2px}
  .ifx-fab svg{flex:none}
  .ifx-fab .ifx-dot{width:8px;height:8px;border-radius:50%;background:#6ee7a8;box-shadow:0 0 0 3px rgba(110,231,168,.25)}
  .ifx-panel{position:fixed;right:20px;bottom:20px;z-index:9999;width:380px;max-width:calc(100vw - 32px);height:min(600px,calc(100vh - 40px));display:none;flex-direction:column;background:#fff;border:1px solid #e1dfdd;border-radius:12px;box-shadow:0 25.6px 57.6px rgba(0,0,0,.22),0 4.8px 14.4px rgba(0,0,0,.18);overflow:hidden;font:14px/1.5 "Segoe UI",system-ui,sans-serif;color:#1b1b1b}
  .ifx-panel.open{display:flex}
  .ifx-head{display:flex;align-items:center;gap:10px;padding:14px 14px 14px 16px;background:linear-gradient(135deg,#0b1f3a,#0f2b52);color:#fff}
  .ifx-avatar{width:34px;height:34px;border-radius:50%;background:#0078d4;display:grid;place-items:center;flex:none}
  .ifx-head strong{display:block;font-size:15px}
  .ifx-head span{display:block;font-size:12px;color:#c7d6ea}
  .ifx-x{margin-left:auto;background:transparent;border:0;color:#fff;cursor:pointer;padding:6px;border-radius:6px;line-height:0}
  .ifx-x:hover{background:rgba(255,255,255,.12)}
  .ifx-body{flex:1;overflow-y:auto;padding:16px;background:#faf9f8;display:flex;flex-direction:column;gap:10px}
  .ifx-msg{max-width:88%;padding:10px 12px;border-radius:10px;white-space:normal;word-wrap:break-word}
  .ifx-bot{align-self:flex-start;background:#fff;border:1px solid #edebe9}
  .ifx-user{align-self:flex-end;background:#0078d4;color:#fff}
  .ifx-msg p{margin:0 0 6px}.ifx-msg p:last-child{margin:0}
  .ifx-msg ul{margin:4px 0 6px;padding-left:18px}
  .ifx-msg a{color:#005a9e;text-decoration:underline}
  .ifx-user a{color:#fff}
  .ifx-src{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;padding-top:8px;border-top:1px solid #edebe9}
  .ifx-src a{font-size:12px;text-decoration:none;color:#005a9e;background:#eff6fc;border:1px solid #deecf9;border-radius:999px;padding:2px 9px}
  .ifx-src a:hover{background:#deecf9}
  .ifx-chips{display:flex;flex-wrap:wrap;gap:6px}
  .ifx-chip{border:1px solid #c7e0f4;background:#fff;color:#005a9e;border-radius:999px;padding:6px 11px;font:13px "Segoe UI",system-ui,sans-serif;cursor:pointer;text-align:left}
  .ifx-chip:hover{background:#eff6fc}
  .ifx-typing{display:inline-flex;gap:4px;padding:4px 0}
  .ifx-typing i{width:6px;height:6px;border-radius:50%;background:#8a8886;animation:ifxb 1s infinite ease-in-out}
  .ifx-typing i:nth-child(2){animation-delay:.15s}.ifx-typing i:nth-child(3){animation-delay:.3s}
  @keyframes ifxb{0%,80%,100%{opacity:.3;transform:translateY(0)}40%{opacity:1;transform:translateY(-3px)}}
  .ifx-form{display:flex;gap:8px;padding:12px;border-top:1px solid #edebe9;background:#fff}
  .ifx-form textarea{flex:1;resize:none;border:1px solid #c8c6c4;border-radius:8px;padding:9px 10px;font:14px/1.4 "Segoe UI",system-ui,sans-serif;max-height:110px;color:#1b1b1b;background:#fff}
  .ifx-form textarea:focus{outline:none;border-color:#0078d4;box-shadow:0 0 0 1px #0078d4}
  .ifx-send{border:0;border-radius:8px;background:#0078d4;color:#fff;width:42px;cursor:pointer;display:grid;place-items:center}
  .ifx-send:disabled{background:#c8c6c4;cursor:default}
  .ifx-foot{padding:0 12px 10px;background:#fff;font-size:11px;color:#8a8886;display:flex;justify-content:space-between;gap:8px}
  .ifx-foot button{background:none;border:0;color:#605e5c;font-size:11px;cursor:pointer;text-decoration:underline;padding:0}
  @media (max-width:520px){.ifx-panel{right:0;bottom:0;width:100vw;max-width:100vw;height:100dvh;border-radius:0}.ifx-fab{right:16px;bottom:16px}.ifx-fab .ifx-lbl{display:none}.ifx-fab{padding:14px}}
  @media (prefers-reduced-motion:reduce){.ifx-typing i{animation:none}.ifx-fab{transition:none}}
  `;
  const st = document.createElement("style");
  st.textContent = css;
  document.head.appendChild(st);

  const ICON_CHAT = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 9h8M8 13h5"/></svg>';
  const ICON_BOT = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="8" width="16" height="12" rx="3"/><path d="M12 4v4M9 14h.01M15 14h.01"/></svg>';

  const fab = document.createElement("button");
  fab.className = "ifx-fab";
  fab.type = "button";
  fab.setAttribute("aria-label", "Abrir asistente virtual");
  fab.innerHTML = ICON_CHAT + '<span class="ifx-lbl">¿Te ayudo?</span><span class="ifx-dot" aria-hidden="true"></span>';

  const panel = document.createElement("section");
  panel.className = "ifx-panel";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-label", "Asistente virtual IntegralFlex");
  panel.innerHTML = `
    <div class="ifx-head"><div class="ifx-avatar">${ICON_BOT}</div><div><strong>Asistente IntegralFlex</strong><span>Responde con los manuales de la suite</span></div>
      <button class="ifx-x" type="button" aria-label="Cerrar asistente"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button></div>
    <div class="ifx-body" aria-live="polite"></div>
    <form class="ifx-form"><label class="sr-only" for="ifxIn" style="position:absolute;left:-9999px">Tu pregunta</label>
      <textarea id="ifxIn" rows="1" maxlength="800" placeholder="Escribe tu pregunta…"></textarea>
      <button class="ifx-send" type="submit" aria-label="Enviar"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4z"/></svg></button></form>
    <div class="ifx-foot"><span>Asistente con IA: puede equivocarse. Para cotizar, usa el formulario.</span><button type="button" class="ifx-reset">Nueva conversación</button></div>`;
  document.body.append(fab, panel);
  // Si la página tiene el botón flotante de WhatsApp, el asistente se ubica sobre él
  const wa = document.querySelector(".whatsapp-float");
  if (wa && getComputedStyle(wa).display !== "none") fab.style.bottom = (wa.getBoundingClientRect().height + 32) + "px";

  const body = panel.querySelector(".ifx-body");
  const form = panel.querySelector(".ifx-form");
  const input = panel.querySelector("textarea");
  const send = panel.querySelector(".ifx-send");

  let history = [];
  try { history = JSON.parse(sessionStorage.getItem(STORE) || "[]"); } catch (e) { history = []; }
  const save = () => { try { sessionStorage.setItem(STORE, JSON.stringify(history.slice(-20))); } catch (e) {} };

  const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  function md(text) {
    const lines = esc(text).split(/\n/);
    let html = "", inList = false;
    const inline = (s) => s
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
      .replace(/(^|[\s(])(https?:\/\/[^\s<)]+)/g, '$1<a href="$2" target="_blank" rel="noopener">$2</a>');
    for (const l of lines) {
      const m = l.match(/^\s*(?:[-•*]|\d+\.)\s+(.*)/);
      if (m) { if (!inList) { html += "<ul>"; inList = true; } html += "<li>" + inline(m[1]) + "</li>"; continue; }
      if (inList) { html += "</ul>"; inList = false; }
      if (l.trim()) html += "<p>" + inline(l) + "</p>";
    }
    if (inList) html += "</ul>";
    return html;
  }

  function bubble(role, text, sources) {
    const d = document.createElement("div");
    d.className = "ifx-msg " + (role === "user" ? "ifx-user" : "ifx-bot");
    if (role === "user") d.textContent = text; else d.innerHTML = md(text);
    if (sources && sources.length) {
      const s = document.createElement("div");
      s.className = "ifx-src";
      sources.forEach((x) => {
        const a = document.createElement("a");
        a.href = x.page; a.textContent = x.name; a.target = "_self";
        const b = document.createElement("a");
        b.href = x.manual; b.textContent = "Manual " + x.name; b.target = "_blank"; b.rel = "noopener";
        s.append(a, b);
      });
      d.appendChild(s);
    }
    body.appendChild(d);
    body.scrollTop = body.scrollHeight;
    return d;
  }

  function welcome() {
    body.innerHTML = "";
    bubble("assistant", "¡Hola! Soy el asistente de **IntegralFlex Suites**. Puedo contarte qué hace cada aplicación, para qué rubro sirve, cómo se usa y cuánto cuesta. ¿En qué te ayudo?");
    const c = document.createElement("div");
    c.className = "ifx-chips";
    SUGGEST.forEach((q) => {
      const b = document.createElement("button");
      b.type = "button"; b.className = "ifx-chip"; b.textContent = q;
      b.onclick = () => ask(q);
      c.appendChild(b);
    });
    body.appendChild(c);
  }

  function render() {
    welcome();
    history.forEach((m) => bubble(m.role, m.content, m.sources));
  }

  let busy = false;
  async function ask(q) {
    q = (q || "").trim();
    if (!q || busy) return;
    busy = true; send.disabled = true;
    body.querySelector(".ifx-chips")?.remove();
    history.push({ role: "user", content: q });
    bubble("user", q);
    input.value = ""; input.style.height = "";
    const t = document.createElement("div");
    t.className = "ifx-msg ifx-bot";
    t.innerHTML = '<span class="ifx-typing" aria-label="Escribiendo"><i></i><i></i><i></i></span>';
    body.appendChild(t); body.scrollTop = body.scrollHeight;
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history.map(({ role, content }) => ({ role, content })) }),
      });
      const data = await res.json().catch(() => ({}));
      t.remove();
      if (!res.ok || !data.answer) throw new Error(data.error || "No pude responder ahora. Escríbenos a contacto@integralflex.cl.");
      history.push({ role: "assistant", content: data.answer, sources: data.sources || [] });
      bubble("assistant", data.answer, data.sources);
    } catch (e) {
      t.remove();
      history.pop();
      bubble("assistant", e && e.name !== "TypeError" && e.message ? e.message : "No pude conectarme con el asistente. Revisa tu conexión o escríbenos a contacto@integralflex.cl.");
    }
    save();
    busy = false; send.disabled = false; input.focus();
  }

  const open = () => { panel.classList.add("open"); fab.style.display = "none"; if (!body.children.length) render(); setTimeout(() => input.focus(), 50); };
  const close = () => { panel.classList.remove("open"); fab.style.display = ""; fab.focus(); };
  fab.onclick = open;
  panel.querySelector(".ifx-x").onclick = close;
  panel.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
  panel.querySelector(".ifx-reset").onclick = () => { history = []; save(); render(); input.focus(); };
  form.addEventListener("submit", (e) => { e.preventDefault(); ask(input.value); });
  input.addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); ask(input.value); } });
  input.addEventListener("input", () => { input.style.height = "auto"; input.style.height = Math.min(input.scrollHeight, 110) + "px"; });

  // Abrir desde cualquier enlace con data-assistant
  document.addEventListener("click", (e) => {
    const a = e.target.closest("[data-assistant]");
    if (a) { e.preventDefault(); open(); const q = a.getAttribute("data-assistant"); if (q) ask(q); }
  });
})();
