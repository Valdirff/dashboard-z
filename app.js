const KEY = "z_dash_portrait_v1";

const $ = (id) => document.getElementById(id);

const state = {
  adrenaline: 0,
  skill: Array(7).fill(false),
  life: Array(4).fill(false)
};

function clamp(n, min, max){ return Math.max(min, Math.min(max, n)); }

// Azul 0–6, Amarelo 7–18, Laranja 19–42, Vermelho 43
function level(pa){
  if (pa >= 43) return "VERMELHO";
  if (pa >= 19) return "LARANJA";
  if (pa >= 7)  return "AMARELO";
  return "AZUL";
}

function pillBg(lvl){
  switch(lvl){
    case "AZUL": return "rgba(44,109,230,.30)";
    case "AMARELO": return "rgba(227,193,0,.28)";
    case "LARANJA": return "rgba(214,118,18,.28)";
    default: return "rgba(204,31,44,.30)";
  }
}

function save(){ localStorage.setItem(KEY, JSON.stringify(state)); }
function load(){
  try{
    const raw = localStorage.getItem(KEY);
    if(!raw) return;
    const data = JSON.parse(raw);
    if (data && typeof data === "object") Object.assign(state, data);
  }catch{}
}

function makeDots(containerId, count, arrKey){
  const wrap = $(containerId);
  wrap.innerHTML = "";

  for (let i=0; i<count; i++){
    const b = document.createElement("button");
    b.type = "button";
    b.className = "dot" + (state[arrKey][i] ? " on" : "");
    b.setAttribute("aria-pressed", state[arrKey][i] ? "true" : "false");

    b.addEventListener("click", ()=>{
      state[arrKey][i] = !state[arrKey][i];
      b.classList.toggle("on", state[arrKey][i]);
      b.setAttribute("aria-pressed", state[arrKey][i] ? "true" : "false");
      save();
    });

    wrap.appendChild(b);
  }
}

function buildTicks(){
  const marks = [0, 7, 19, 43];
  const minor = [3, 10, 13, 25, 31, 37, 40];

  const ticks = $("ticks");
  ticks.innerHTML = "";

  for (let v = 0; v <= 43; v++){
    const t = document.createElement("div");
    const isBig = marks.includes(v);
    const isMinor = minor.includes(v);

    if (!isBig && !isMinor){
      t.className = "tick";
      t.style.opacity = "0";
      ticks.appendChild(t);
      continue;
    }

    t.className = "tick" + (isBig ? " big" : "");
    ticks.appendChild(t);
  }

  const trackWrap = document.querySelector(".trackWrap");
  trackWrap.querySelectorAll(".tickLabel").forEach(n => n.remove());

  for (const v of marks){
    const lab = document.createElement("div");
    lab.className = "tickLabel";
    const pct = (v / 43) * 100;
    lab.style.left = `calc(14px + (100% - 28px) * ${pct/100})`;
    lab.textContent = String(v);
    trackWrap.appendChild(lab);
  }
}

function renderAdrenaline(){
  const pa = clamp(Number(state.adrenaline || 0), 0, 43);
  $("paValue").textContent = pa;

  const lvl = level(pa);
  const pill = $("lvlPill");
  pill.textContent = lvl;
  pill.style.background = pillBg(lvl);

  $("adrenaline").value = String(pa);
}

function bind(){
  $("adrenaline").addEventListener("input", (e)=>{
    state.adrenaline = clamp(Number(e.target.value), 0, 43);
    save();
    renderAdrenaline();
  });

  $("reset").addEventListener("click", ()=>{
    if (!confirm("Resetar este dashboard neste celular?")) return;
    localStorage.removeItem(KEY);
    location.reload();
  });
}

(function init(){
  load();
  buildTicks();
  makeDots("skillDots", 7, "skill");
  makeDots("lifeDots", 4, "life");
  bind();
  renderAdrenaline();
})();
