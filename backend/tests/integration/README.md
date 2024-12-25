# Lottery Integration Tests

This directory contains integration tests for the Spanish Christmas Lottery API implementation.

## Purpose
These tests validate the correct calculation of prizes for the Spanish Christmas Lottery, including:
- Main prizes (El Gordo, Segundo Premio, etc.)
- Approximations
- Centenas
- Terminaciones
- Reintegros
- Prize accumulations

## Structure
```
tests/integration/lottery/
├── lottery-prizes.test.js  # Main test file
├── config.js              # Configuration file with prize numbers and ranges
└── helpers.js            # Utility functions for prize calculations
```

## Prerequisites
- Node.js installed
- API running on localhost:3000
- All dependencies installed (`npm install`)

## How to Run

### Using npm script (recommended)
```bash
npm run test:integration
```

### Directly with Node
```bash
node tests/integration/lottery/lottery-prizes.test.js
```

## Updating for Future Draws
1. Update `config.js` with new:
   - Draw ID
   - Winning numbers
   - Prize ranges
2. Run tests to validate

## Prize Rules and Examples
### Basic Rules
- El Gordo and Segundo Premio do not accumulate reintegro
- Other prizes can accumulate (centena + terminación + reintegro)
- Approximations include centena prize

### Prize Accumulation Examples
- 72414: 200€ (Centena + Terminación)
- 48040: 220€ (Centena + Terminación + Reintegro)
- 72481: 2100€ (Aproximación Gordo + Centena)
- 11840: 50020€ (Tercer Premio + Reintegro)

## Test Output
The test will show:
- Individual test results for each number
- Summary of passed/failed tests
- Detailed report of any failed tests
- Overall success rate

## Notes
- Tests use real API endpoints
- Requires the API to be running on localhost:3000
- Validates all prize combinations and accumulations
- Useful for regression testing after code changes
- Tests can take a few minutes to complete due to API rate limiting