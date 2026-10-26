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

  // The folder this page lives in, e.g. https://you.github.io/UPIlink/
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
  // Order of preference:
  //   1. your own shortener (worker/shortener.js on Cloudflare, free) if
  //      js/config.js points to it. This is the reliable option.
  //   2. free public shorteners (is.gd, v.gd, TinyURL), asked all at once.
  // Each round is tried twice. If everything fails the caller keeps the
  // normal link, which always works.

  var cfg = global.LINKPE_CONFIG || {};
  var OWN = String(cfg.shortenerUrl || "").replace(/\/+$/, "");
  var PUBLIC_OK = /^https:\/\/(is\.gd|v\.gd|tinyurl\.com)\/[\w-]+$/;

  function isShort(s) {
    if (PUBLIC_OK.test(s)) return true;
    return !!OWN && s.indexOf(OWN + "/") === 0 && /^[0-9A-Za-z]{7}$/.test(s.slice(OWN.length + 1));
  }

  function own(url, signal) {
    return fetch(OWN + "/api/shorten", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: url }),
      signal: signal,
    })
      .then(function (r) {
        return r.json();
      })
      .then(function (d) {
        return d.short;
      });
  }

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

  var publicProviders = [
    fromJson("is.gd"),
    fromJson("v.gd"),
    function (url, signal) {
      return fetch("https://tinyurl.com/api-create.php?url=" + encodeURIComponent(url), { signal: signal }).then(function (r) {
        return r.text();
      });
    },
  ];

  // Ask every provider at once; the first valid answer wins.
  function race(list, url, ms) {
    var ctl = new AbortController();
    var timer = setTimeout(function () {
      ctl.abort();
    }, ms);
    var attempts = list.map(function (p) {
      return p(url, ctl.signal).then(function (short) {
        short = String(short || "").trim();
        if (!isShort(short)) throw new Error("bad response");
        return short;
      });
    });
    return Promise.any(attempts).then(
      function (short) {
        clearTimeout(timer);
        ctl.abort(); // drop the slower requests
        return short;
      },
      function () {
        clearTimeout(timer);
        throw new Error("no short link");
      }
    );
  }

  function round(url) {
    if (!OWN) return race(publicProviders, url, 5000);
    return race([own], url, 6000).catch(function () {
      return race(publicProviders, url, 5000);
    });
  }

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
      if (hit && isShort(hit)) return Promise.resolve(hit);
    } catch (e) {
      /* storage can be blocked; carry on */
    }

    return round(longUrl)
      .catch(function () {
        // one more go after a short pause: most failures are momentary
        return new Promise(function (resolve) {
          setTimeout(resolve, 1200);
        }).then(function () {
          return round(longUrl);
        });
      })
      .then(function (short) {
        try {
          global.localStorage.setItem(cacheKey(longUrl), short);
        } catch (e) {
          /* ignore */
        }
        return short;
      });
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
