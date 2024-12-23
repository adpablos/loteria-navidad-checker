const {
  validateDrawId,
} = require("../../../src/api/middleware/validation/validator");
const { ValidationError } = require("../../../src/errors");
const LoggerUtil = require("../../../src/utils/logger.util");

// Mock LoggerUtil
jest.mock("../../../src/utils/logger.util");

describe("Validation Middleware", () => {
  let req, res, next;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    req = {
      params: {},
      requestId: "test-id",
      path: "/test",
      method: "GET",
    };
    res = {};
    next = jest.fn();
  });

  describe("validateDrawId", () => {
    it("should pass validation for valid drawId", async () => {
      req.params.drawId = "1234567890";

      const middleware = validateDrawId();
      await middleware[0](req, res, next); // Run validation
      await middleware[1](req, res, next); // Run validateRequest

      expect(next).toHaveBeenCalledWith();
      expect(next).toHaveBeenCalledTimes(2);
      expect(LoggerUtil.warn).not.toHaveBeenCalled();
    });

    it("should fail validation for invalid drawId", async () => {
      req.params.drawId = "invalid";

      const middleware = validateDrawId();
      await middleware[0](req, res, next);
      await middleware[1](req, res, next);

      expect(LoggerUtil.warn).toHaveBeenCalledWith(
        expect.objectContaining({
          requestId: "test-id",
          path: "/test",
          method: "GET",
          errors: expect.any(Array),
        }),
        "Request validation failed"
      );
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Invalid request parameters",
        })
      );
    });
  });
});
