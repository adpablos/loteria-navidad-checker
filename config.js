class Config {
  static get API() {
    return {
      BASE_URL: "https://www.loteriasyapuestas.es/servicios",
      ENDPOINTS: {
        CHECK_TICKET: "/premioDecimoWeb",
        DRAW_RESULTS: "/resultados2",
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
}

module.exports = Config;
