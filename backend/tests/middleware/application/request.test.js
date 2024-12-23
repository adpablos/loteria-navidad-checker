const {
  requestMiddleware,
} = require("../../../src/api/middleware/application/request");
const { v4: uuidv4 } = require("uuid");
const MetricsUtil = require("../../../src/utils/metrics.util");
const LoggerUtil = require("../../../src/utils/logger.util");

jest.mock("uuid");
jest.mock("../../../src/utils/metrics.util");
jest.mock("../../../src/utils/logger.util");

describe("Request Middleware", () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();

    // Crear un mock más completo del objeto req
    req = {
      path: "/test",
      ip: "127.0.0.1",
      headers: {},
      method: "GET",
      params: {},
      query: {},
    };

    // Crear un mock más completo del objeto res
    res = {
      setHeader: jest.fn(),
      on: jest.fn(),
      statusCode: 200,
    };

    next = jest.fn();
    uuidv4.mockReturnValue("test-uuid");

    // Mock de LoggerUtil
    LoggerUtil.debug = jest.fn();
  });

  it("should add requestId and track request metrics", () => {
    const startTime = 1000;
    jest
      .spyOn(Date, "now")
      .mockReturnValueOnce(startTime)
      .mockReturnValueOnce(startTime + 100);

    // Simular el evento 'finish'
    res.on = jest.fn().mockImplementation((event, callback) => {
      if (event === "finish") {
        callback();
      }
    });

    requestMiddleware(req, res, next);

    // Verificar que se agregó el requestId
    expect(req.requestId).toBe("test-uuid");
    expect(res.setHeader).toHaveBeenCalledWith("X-Request-ID", "test-uuid");

    // Verificar que se registró el log de entrada
    expect(LoggerUtil.debug).toHaveBeenCalledWith(
      {
        requestId: "test-uuid",
        method: "GET",
        path: "/test",
        params: {},
        query: {},
      },
      "Incoming request"
    );

    // Verificar que se registraron las métricas
    expect(MetricsUtil.trackRequest).toHaveBeenCalledWith("/test", 200, 100);

    // Verificar que se registró el log de finalización
    expect(LoggerUtil.debug).toHaveBeenCalledWith(
      {
        requestId: "test-uuid",
        method: "GET",
        path: "/test",
        statusCode: 200,
        duration: 100,
      },
      "Request completed"
    );

    expect(next).toHaveBeenCalled();
  });

  it("should handle invalid drawId", () => {
    req.params = { drawId: "invalid" };

    requestMiddleware(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Invalid drawId. It must be a 10-digit number.",
      })
    );
  });
});
