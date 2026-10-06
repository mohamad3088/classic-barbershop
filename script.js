// 0 = zondag … 6 = zaterdag. (Google Maps, okt 2026) — 7 dagen open
const HOURS = {
  0: ["10:00", "18:00"], 1: ["10:00", "19:00"], 2: ["10:00", "19:00"], 3: ["10:00", "19:00"],
  4: ["10:00", "19:00"], 5: ["10:00", "19:00"], 6: ["10:00", "18:00"],
};
const DAY_NAMES = ["Zondag", "Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag"];

function brusselsNow() {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Brussels", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date());
  const get = t => parts.find(p => p.type === t).value;
  return { day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday")), mins: (+get("hour") % 24) * 60 + +get("minute") };
}
const toMins = s => { const [h, m] = s.split(":").map(Number); return h * 60 + m; };

function renderHours() {
  const { day, mins } = brusselsNow();
  document.getElementById("hours").innerHTML = [1, 2, 3, 4, 5, 6, 0].map(d => {
    const h = HOURS[d];
    return `<tr class="${d === day ? "is-today" : ""}"><td>${DAY_NAMES[d]}</td><td>${h ? `${h[0]} – ${h[1]}` : "Gesloten"}</td></tr>`;
  }).join("");
  const today = HOURS[day];
  const isOpen = !!today && mins >= toMins(today[0]) && mins < toMins(today[1]);
  let text;
  if (isOpen) text = `Nu open tot ${today[1]}`;
  else if (today && mins < toMins(today[0])) text = `Vandaag open vanaf ${today[0]}`;
  else {
    const next = HOURS[(day + 1) % 7];
    text = `Gesloten · morgen open vanaf ${next[0]}`;
  }
  const s = document.querySelector("[data-status]");
  s.textContent = text;
  s.classList.toggle("is-open", isOpen);
}
renderHours();
setInterval(renderHours, 60_000);

// Nav
const nav = document.getElementById("nav");
const toggle = document.getElementById("navToggle");
const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 30);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();
toggle.addEventListener("click", () => toggle.setAttribute("aria-expanded", nav.classList.toggle("is-open")));
document.querySelectorAll("#navLinks a").forEach(a => a.addEventListener("click", () => {
  nav.classList.remove("is-open");
  toggle.setAttribute("aria-expanded", "false");
}));

// Reveal
const io = new IntersectionObserver(entries => entries.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
}), { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach((el, i) => { el.style.transitionDelay = `${(i % 4) * 90}ms`; io.observe(el); });

document.getElementById("year").textContent = new Date().getFullYear();
