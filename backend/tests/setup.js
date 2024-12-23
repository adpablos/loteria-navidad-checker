// Increase timeout for async tests to handle potential API delays
jest.setTimeout(10000);

// Mock logger to prevent console noise during tests
jest.mock("../src/utils/logger.util", () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
}));
