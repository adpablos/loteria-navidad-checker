const fetch = require("node-fetch");
const config = require("./config");
const {
  calculateExpectedPrize,
  getDescriptionForNumber,
  isMainPrize,
  isApproximation,
} = require("./helpers");

const BASE_URL = "http://localhost:3000/api/lottery/check";

// Helper function to generate random numbers in a range
function getRandomNumbersInRange(start, end, count) {
  const numbers = [];
  for (let i = 0; i < count; i++) {
    const num = Math.floor(Math.random() * (end - start + 1) + start);
    numbers.push(num.toString().padStart(5, "0"));
  }
  return numbers;
}

// Helper function to generate random numbers with specific ending
function getRandomNumbersWithEnding(ending, count) {
  const numbers = [];
  for (let i = 0; i < count; i++) {
    const prefixLength = 5 - ending.length;
    let prefix = Math.floor(Math.random() * Math.pow(10, prefixLength))
      .toString()
      .padStart(prefixLength, "0");
    numbers.push(prefix + ending);
  }
  return numbers;
}

const testCases = [
  // Premios principales
  {
    number: config.MAIN_PRIZES.GORDO,
    expectedPrize: 400000,
    description: "El Gordo (no acumula reintegro)",
  },
  {
    number: config.MAIN_PRIZES.SEGUNDO,
    expectedPrize: 125000,
    description: "Segundo Premio (no acumula reintegro)",
  },
  {
    number: config.MAIN_PRIZES.TERCERO,
    expectedPrize: config.MAIN_PRIZES.TERCERO.endsWith("0") ? 50020 : 50000,
    description: "Tercer Premio",
  },
  ...config.MAIN_PRIZES.CUARTOS.map((num) => ({
    number: num,
    expectedPrize: num.endsWith("0") ? 20020 : 20000,
    description: "Cuarto Premio",
  })),
  ...config.MAIN_PRIZES.QUINTOS.map((num) => ({
    number: num,
    expectedPrize: num.endsWith("0") ? 6020 : 6000,
    description: "Quinto Premio",
  })),

  // Aproximaciones
  {
    number: (parseInt(config.MAIN_PRIZES.GORDO) - 1)
      .toString()
      .padStart(5, "0"),
    expectedPrize: 2100,
    description: "Aproximación Gordo + Centena",
  },
  {
    number: (parseInt(config.MAIN_PRIZES.GORDO) + 1)
      .toString()
      .padStart(5, "0"),
    expectedPrize: 2100,
    description: "Aproximación Gordo + Centena",
  },
  {
    number: (parseInt(config.MAIN_PRIZES.SEGUNDO) - 1)
      .toString()
      .padStart(5, "0"),
    expectedPrize: 1350,
    description: "Aproximación Segundo + Centena",
  },
  {
    number: (parseInt(config.MAIN_PRIZES.SEGUNDO) + 1)
      .toString()
      .padStart(5, "0"),
    expectedPrize: 1350,
    description: "Aproximación Segundo + Centena",
  },
  {
    number: (parseInt(config.MAIN_PRIZES.TERCERO) - 1)
      .toString()
      .padStart(5, "0"),
    expectedPrize: 1060,
    description: "Aproximación Tercero + Centena",
  },
  {
    number: (parseInt(config.MAIN_PRIZES.TERCERO) + 1)
      .toString()
      .padStart(5, "0"),
    expectedPrize: 1060,
    description: "Aproximación Tercero + Centena",
  },

  // Test de rangos (centenas)
  ...Object.entries(config.PRIZE_RANGES).flatMap(([key, range]) =>
    getRandomNumbersInRange(range.start, range.end, 5)
      .filter(
        (num) => !isMainPrize(num, config) && !isApproximation(num, config)
      )
      .map((num) => ({
        number: num,
        expectedPrize: calculateExpectedPrize(num, config),
        description: `Centena ${num} ${getDescriptionForNumber(num, config)}`,
      }))
  ),

  // Test de terminaciones
  ...Object.entries(config.PRIZE_ENDINGS)
    .filter(([key]) => key !== "REINTEGRO")
    .flatMap(([key, ending]) =>
      getRandomNumbersWithEnding(ending, 10).map((num) => ({
        number: num,
        expectedPrize: calculateExpectedPrize(num, config),
        description: `Terminación ***${ending} ${getDescriptionForNumber(
          num,
          config
        )}`,
      }))
    ),
];

async function checkNumber(number) {
  try {
    const response = await fetch(`${BASE_URL}/${config.DRAW_ID}/${number}`);
    const data = await response.json();

    if (!data || !data.data) {
      console.error(`Invalid response for number ${number}:`, data);
      return {
        prizeEuros: 0,
        isPremiado: false,
        message: "Invalid API response",
      };
    }

    return data.data;
  } catch (error) {
    console.error(`Error checking number ${number}:`, error);
    return {
      prizeEuros: 0,
      isPremiado: false,
      message: "API error",
    };
  }
}

async function runTests() {
  console.log("Starting prize verification tests...\n");

  let passed = 0;
  let failed = 0;
  let errors = 0;
  let failedTests = [];

  for (const testCase of testCases) {
    try {
      const result = await checkNumber(testCase.number);

      const isPassed = result.prizeEuros === testCase.expectedPrize;
      if (isPassed) {
        passed++;
      } else {
        failed++;
        failedTests.push({
          number: testCase.number,
          description: testCase.description,
          expected: testCase.expectedPrize,
          received: result.prizeEuros,
          message: result.message,
        });
      }

      console.log(`Number: ${testCase.number} (${testCase.description})`);
      console.log(`Expected: ${testCase.expectedPrize}€`);
      console.log(`Received: ${result.prizeEuros}€`);
      console.log(`Status: ${isPassed ? "✅ PASSED" : "❌ FAILED"}`);
      if (!isPassed) {
        console.log(`Message: ${result.message || "No additional info"}`);
      }
      console.log("-".repeat(50) + "\n");
    } catch (error) {
      errors++;
      console.error(`Error testing number ${testCase.number}:`, error);
      console.log("-".repeat(50) + "\n");
    }
  }

  console.log(`Test Summary:`);
  console.log(`Total tests: ${testCases.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Errors: ${errors}`);
  console.log(
    `Success rate: ${((passed / testCases.length) * 100).toFixed(2)}%`
  );

  if (failedTests.length > 0) {
    console.log("\nFailed Tests Summary:");
    console.log("=".repeat(70));
    failedTests.forEach((test) => {
      console.log(`Number: ${test.number} (${test.description})`);
      console.log(`Expected: ${test.expected}€`);
      console.log(`Received: ${test.received}€`);
      console.log(`Message: ${test.message || "No additional info"}`);
      console.log("-".repeat(70));
    });
  }
}

// Run the tests
runTests().catch(console.error);
