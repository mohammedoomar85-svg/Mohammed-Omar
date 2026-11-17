// Embed on any website:
// <script src="https://YOUR-DOMAIN/widget.js" data-business="restaurant" data-color="#c2410c" defer></script>
(function () {
  var s = document.currentScript;
  var origin = new URL(s.src).origin;
  var id = s.getAttribute("data-business") || "restaurant";
  var color = s.getAttribute("data-color") || "#0f766e";
  var side = s.getAttribute("data-side") === "left" ? "left" : "right";
  var btn = document.createElement("button");
  btn.setAttribute("aria-label", "خدمة العملاء");
  btn.innerHTML = '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
  btn.style.cssText = "position:fixed;bottom:20px;" + side + ":20px;width:58px;height:58px;border-radius:50%;border:0;background:" + color + ";box-shadow:0 6px 20px rgba(0,0,0,.25);cursor:pointer;z-index:2147483646;display:grid;place-items:center";
  var frame = null;
  btn.onclick = function () {
    if (!frame) {
      frame = document.createElement("iframe");
      frame.src = origin + "/chat?b=" + encodeURIComponent(id);
      frame.title = "خدمة العملاء";
      frame.style.cssText = "position:fixed;bottom:90px;" + side + ":20px;width:min(380px,calc(100vw - 32px));height:min(600px,calc(100vh - 120px));border:0;border-radius:16px;box-shadow:0 12px 40px rgba(0,0,0,.25);z-index:2147483647;background:#fff";
      document.body.appendChild(frame);
    } else {
      frame.style.display = frame.style.display === "none" ? "block" : "none";
    }
  };
  document.body.appendChild(btn);
})();
