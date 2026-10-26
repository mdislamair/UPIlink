/* LinkPe — helpers shared by the create page and the pay page. No dependencies. */
(function (global) {
  "use strict";

  var UPI_ID = /^[a-zA-Z0-9._-]{2,256}@[a-zA-Z][a-zA-Z0-9]{1,63}$/;
  var AMOUNT = /^\d{1,9}(\.\d{1,2})?$/;

  // Old links were created with "pn=null" when the name was left empty.
  function clean(value) {
    var v = value == null ? "" : String(value).trim();
    return v === "null" || v === "undefined" ? "" : v;
  }

  function isValidUpi(value) {
    return UPI_ID.test(value);
  }

  function isValidAmount(value) {
    return value === "" || (AMOUNT.test(value) && parseFloat(value) > 0);
  }

  function normalizeAmount(value) {
    if (value === "") return "";
    var n = Number(value);
    return Number.isInteger(n) ? String(n) : n.toFixed(2);
  }

  // encodeURIComponent, but keep "@" readable inside UPI IDs
  function enc(value) {
    return encodeURIComponent(value).replace(/%40/g, "@");
  }

  function buildQuery(d, withCurrency) {
    var q = "pa=" + enc(d.pa);
    if (d.pn) q += "&pn=" + enc(d.pn);
    if (d.am) q += "&am=" + enc(d.am);
    if (withCurrency) q += "&cu=INR";
    return q;
  }

  function readParams(search) {
    var p = new URLSearchParams(search);
    return {
      pa: clean(p.get("pa")),
      pn: clean(p.get("pn")),
      am: clean(p.get("am") || p.get("amt")), // "amt" is what the README documents
    };
  }

  // The folder this page lives in, e.g. https://you.github.io/linkpe/
  function baseUrl() {
    return new URL("./", global.location.href).href;
  }

  /* ---------- UI helpers ---------- */

  var toastTimer;
  function toast(message) {
    var el = document.getElementById("toast");
    if (!el) return;
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      el.classList.remove("show");
    }, 2200);
  }

  function copyText(text) {
    if (navigator.clipboard && global.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var t = document.createElement("textarea");
      t.value = text;
      t.setAttribute("readonly", "");
      t.style.cssText = "position:fixed;opacity:0;top:0;left:0";
      document.body.appendChild(t);
      t.select();
      try {
        document.execCommand("copy") ? resolve() : reject(new Error("copy failed"));
      } catch (e) {
        reject(e);
      }
      document.body.removeChild(t);
    });
  }

  /* ---------- Short links ---------- */
  // LinkPe has no server, so short links come from free public shorteners.
  // They are all asked at once and the first answer wins. If none answer
  // (offline, rate-limited, blocked), the caller keeps the normal link.

  var SHORT_OK = /^https:\/\/(is\.gd|v\.gd|tinyurl\.com)\/[\w-]+$/;

  function fromJson(host) {
    return function (url, signal) {
      return fetch("https://" + host + "/create.php?format=json&url=" + encodeURIComponent(url), { signal: signal })
        .then(function (r) {
          return r.json();
        })
        .then(function (d) {
          return d.shorturl;
        });
    };
  }

  var providers = [
    fromJson("is.gd"),
    fromJson("v.gd"),
    function (url, signal) {
      return fetch("https://tinyurl.com/api-create.php?url=" + encodeURIComponent(url), { signal: signal }).then(function (r) {
        return r.text();
      });
    },
  ];

  function canShorten() {
    var l = global.location;
    if (l.protocol !== "https:" && l.protocol !== "http:") return false;
    return !/^(localhost|127\.|10\.|192\.168\.|0\.0\.0\.0|\[::1\])|\.local$/.test(l.hostname);
  }

  function cacheKey(url) {
    return "linkpe.short:" + url;
  }

  function shorten(longUrl) {
    try {
      var hit = global.localStorage.getItem(cacheKey(longUrl));
      if (hit && SHORT_OK.test(hit)) return Promise.resolve(hit);
    } catch (e) {
      /* storage can be blocked; carry on */
    }

    var ctl = new AbortController();
    var timer = setTimeout(function () {
      ctl.abort();
    }, 7000);

    var attempts = providers.map(function (p) {
      return p(longUrl, ctl.signal).then(function (short) {
        short = String(short || "").trim();
        if (!SHORT_OK.test(short)) throw new Error("bad response");
        return short;
      });
    });

    return Promise.any(attempts).then(
      function (short) {
        clearTimeout(timer);
        ctl.abort(); // drop the slower requests
        try {
          global.localStorage.setItem(cacheKey(longUrl), short);
        } catch (e) {
          /* ignore */
        }
        return short;
      },
      function () {
        clearTimeout(timer);
        throw new Error("no short link");
      }
    );
  }

  global.LinkPe = {
    isValidUpi: isValidUpi,
    isValidAmount: isValidAmount,
    normalizeAmount: normalizeAmount,
    buildQuery: buildQuery,
    readParams: readParams,
    baseUrl: baseUrl,
    toast: toast,
    copyText: copyText,
    canShorten: canShorten,
    shorten: shorten,
  };
})(window);
