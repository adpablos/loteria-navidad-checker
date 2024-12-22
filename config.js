class Config {
  static get API() {
    return {
      BASE_URL: process.env.API_BASE_URL || "https://www.loteriasyapuestas.es",
      PROXY_URL:
        process.env.RAILWAY_PROXY_URL ||
        "loteria-navidad-checker-production.up.railway.app",
      ENDPOINTS: {
        CELEBRATION_STATE:
          "/f/loterias/estaticos/json/estadoCelebracionLNAC.json",
        CONFIGURACION_LNAC: "/f/loterias/estaticos/json/configuracionLNAC.json",
        REALTIME_RESULTS: "/servicios/resultados1",
        CHECK_TICKET: "/servicios/premioDecimoWeb",
        DRAW_RESULTS: "/servicios/resultados2",
      },
      HEADERS: {
        accept: "application/json, text/javascript, */*; q=0.01",
        "accept-language": "en,es-ES;q=0.9,es;q=0.8",
        referer:
          "https://www.loteriasyapuestas.es/es/resultados/loteria-nacional/comprobar",
        "sec-ch-ua":
          '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        "x-requested-with": "XMLHttpRequest",
      },
    };
  }

  static get RATE_LIMIT() {
    return {
      WINDOW_MS: 60 * 1000,
      MAX_REQUESTS: process.env.RATE_LIMIT_MAX || 100,
    };
  }

  static get LOG() {
    return {
      LEVEL: process.env.LOG_LEVEL || "info",
    };
  }

  static get DEFAULT() {
    return {
      PORT: process.env.PORT || 3000,
      DRAW_ID: process.env.DEFAULT_DRAW_ID || "1259409102",
    };
  }
}

module.exports = Config;
