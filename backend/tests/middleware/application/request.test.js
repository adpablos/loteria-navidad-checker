const {
  requestMiddleware,
} = require("../../../src/api/middleware/application/request");
const { v4: uuidv4 } = require("uuid");
const MetricsUtil = require("../../../src/utils/metrics.util");
const LoggerUtil = require("../../../src/utils/logger.util");

// Mock all dependencies
jest.mock("uuid");
jest.mock("../../../src/utils/metrics.util");
jest.mock("../../../src/utils/logger.util");

describe("Request Middleware", () => {
  let req, res, next;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    req = {
      path: "/test",
      ip: "127.0.0.1",
      headers: {},
      method: "GET",
    };
    res = {
      setHeader: jest.fn(),
      on: jest.fn(),
      statusCode: 200,
    };
    next = jest.fn();
    uuidv4.mockReturnValue("test-uuid");
  });

  it("should add requestId to request", () => {
    requestMiddleware(req, res, next);

    expect(req.requestId).toBe("test-uuid");
    expect(res.setHeader).toHaveBeenCalledWith("X-Request-ID", "test-uuid");
    expect(next).toHaveBeenCalled();
  });

  it("should track request metrics on finish", () => {
    const startTime = Date.now();
    jest
      .spyOn(Date, "now")
      .mockReturnValueOnce(startTime) // First call for start time
      .mockReturnValueOnce(startTime + 100); // Second call for duration

    // Simulate response finish event
    res.on.mockImplementation((event, callback) => {
      if (event === "finish") {
        callback();
      }
    });

    requestMiddleware(req, res, next);

    expect(res.on).toHaveBeenCalledWith("finish", expect.any(Function));
    expect(MetricsUtil.trackRequest).toHaveBeenCalledWith(
      "/test",
      200,
      100 // Expected duration
    );
  });

  it("should handle errors properly", () => {
    const testError = new Error("Test error");

    // Simulate an error in the middleware
    req.requestParams = { drawId: "invalid" }; // This will trigger validation error

    requestMiddleware(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});
