/* Very Wear Apparel - music player. Plays the tracks in config.js (music.tracks). Add mp3 files to the music/ folder.
   Starts when a visitor enters (password button or the play button). Remembers its place from page to page. */
(function () {
  var M = window.WR && WR.music;
  if (!M || !M.enabled || !(M.tracks && M.tracks.length)) return;
  var T = M.tracks, KEY = "wr_music", page = location.pathname.split("/").pop() || "index.html";
  if ((M.exempt || ["links.html"]).indexOf(page) > -1) return;

  var S = { i: 0, t: 0, p: false, m: false };
  try { S = Object.assign(S, JSON.parse(sessionStorage.getItem(KEY) || "{}")); } catch (e) {}
  if (S.i >= T.length) S.i = 0;
  function save() { try { sessionStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }

  var a = new Audio();
  a.preload = "metadata"; a.volume = M.volume == null ? 0.6 : M.volume; a.muted = !!S.m;
  var bar, btn, ttl, mute;

  function load(i, t) {
    S.i = (i + T.length) % T.length;
    a.src = T[S.i].src;
    if (t) a.addEventListener("loadedmetadata", function f() { try { a.currentTime = t; } catch (e) {} a.removeEventListener("loadedmetadata", f); });
    ttl.textContent = T[S.i].title || ("Track " + (S.i + 1));
  }
  function play() {
    var p = a.play();
    if (p && p.then) p.then(function () { S.p = true; ui(); save(); }).catch(function () { S.p = false; ui(true); });
  }
  function pause() { a.pause(); S.p = false; ui(); save(); }
  function ui(blocked) {
    btn.textContent = S.p ? "❚❚" : "▶";
    btn.setAttribute("aria-label", S.p ? "Pause music" : "Play music");
    mute.textContent = a.muted ? "Sound off" : "Sound on";
    bar.classList.toggle("wr-hint", !!blocked);
  }

  function build() {
    bar = document.createElement("div");
    bar.className = "wr-music mono";
    bar.innerHTML = '<button class="wr-pp" type="button"></button><span class="wr-ttl"></span>' +
      (T.length > 1 ? '<button class="wr-nx" type="button" aria-label="Next track">&#9654;&#9654;</button>' : "") +
      '<button class="wr-mu" type="button"></button>';
    document.body.appendChild(bar);
    btn = bar.querySelector(".wr-pp"); ttl = bar.querySelector(".wr-ttl"); mute = bar.querySelector(".wr-mu");
    load(S.i, S.t);
    ui();
    btn.addEventListener("click", function () { S.p ? pause() : play(); });
    mute.addEventListener("click", function () { a.muted = !a.muted; S.m = a.muted; ui(); save(); });
    var nx = bar.querySelector(".wr-nx");
    if (nx) nx.addEventListener("click", function () { load(S.i + 1); S.t = 0; play(); });
    a.addEventListener("ended", function () { S.t = 0; load(S.i + 1); play(); });
    a.addEventListener("timeupdate", function () { S.t = a.currentTime; });
    setInterval(save, 1000);
    window.addEventListener("pagehide", save);
    if (S.p) play();   // keep going from the last page; if the browser blocks it, the bar asks for one tap
  }

  function start() {
    build();
    // right after the password screen, start the music (the Enter click counts as the visitor's tap)
    document.addEventListener("wr:unlocked", function () { if (!S.p) { S.t = 0; play(); } });
  }
  if (document.body) start(); else document.addEventListener("DOMContentLoaded", start);
})();
