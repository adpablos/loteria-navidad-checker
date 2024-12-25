const LoggerUtil = require("../../../src/utils/logger.util");

/**
 * Calculates the expected prize for a given number based on all applicable rules
 * @param {string} number - The lottery number to check
 * @param {Object} config - The lottery configuration
 * @returns {number} - The total prize amount in euros
 */
function calculateExpectedPrize(number, config) {
  let prize = 0;

  // Check main prizes first
  if (number === config.MAIN_PRIZES.GORDO) return 400000;
  if (number === config.MAIN_PRIZES.SEGUNDO) return 125000;
  if (number === config.MAIN_PRIZES.TERCERO)
    return number.endsWith("0") ? 50020 : 50000;
  if (config.MAIN_PRIZES.CUARTOS.includes(number)) {
    return number.endsWith("0") ? 20020 : 20000;
  }
  if (config.MAIN_PRIZES.QUINTOS.includes(number)) {
    return number.endsWith("0") ? 6020 : 6000;
  }

  // Check approximations
  if (isApproximation(number, config)) {
    return calculateApproximationPrize(number, config);
  }

  // Calculate accumulated prizes
  prize += calculateCentenaPrize(number, config);
  prize += calculateTerminacionPrize(number, config);
  prize += calculateReintegroPrize(number, config);

  return prize;
}

/**
 * Generates a description of all applicable prizes for a number
 * @param {string} number - The lottery number
 * @param {Object} config - The lottery configuration
 * @returns {string} - Description of applicable prizes
 */
function getDescriptionForNumber(number, config) {
  const descriptions = [];

  // Add main prize descriptions
  if (isMainPrize(number, config)) {
    descriptions.push(getMainPrizeDescription(number, config));
  }

  // Add other prize descriptions
  if (isCentena(number, config)) descriptions.push("Centena");
  if (number.endsWith(config.PRIZE_ENDINGS.REINTEGRO))
    descriptions.push("Reintegro");
  Object.entries(config.PRIZE_ENDINGS).forEach(([key, ending]) => {
    if (key !== "REINTEGRO" && number.endsWith(ending)) {
      descriptions.push(`Terminación ${ending}`);
    }
  });

  return descriptions.length ? `(${descriptions.join(" + ")})` : "";
}

/**
 * Checks if a number is a main prize
 * @param {string} number - The lottery number to check
 * @param {Object} config - The lottery configuration
 * @returns {boolean}
 */
function isMainPrize(number, config) {
  return (
    number === config.MAIN_PRIZES.GORDO ||
    number === config.MAIN_PRIZES.SEGUNDO ||
    number === config.MAIN_PRIZES.TERCERO ||
    config.MAIN_PRIZES.CUARTOS.includes(number) ||
    config.MAIN_PRIZES.QUINTOS.includes(number)
  );
}

/**
 * Gets the description for a main prize
 * @param {string} number - The lottery number
 * @param {Object} config - The lottery configuration
 * @returns {string}
 */
function getMainPrizeDescription(number, config) {
  if (number === config.MAIN_PRIZES.GORDO) return "El Gordo";
  if (number === config.MAIN_PRIZES.SEGUNDO) return "Segundo Premio";
  if (number === config.MAIN_PRIZES.TERCERO) return "Tercer Premio";
  if (config.MAIN_PRIZES.CUARTOS.includes(number)) return "Cuarto Premio";
  if (config.MAIN_PRIZES.QUINTOS.includes(number)) return "Quinto Premio";
  return "";
}

/**
 * Checks if a number is an approximation to a main prize
 * @param {string} number - The lottery number to check
 * @param {Object} config - The lottery configuration
 * @returns {boolean}
 */
function isApproximation(number, config) {
  const num = parseInt(number);
  return (
    num === parseInt(config.MAIN_PRIZES.GORDO) - 1 ||
    num === parseInt(config.MAIN_PRIZES.GORDO) + 1 ||
    num === parseInt(config.MAIN_PRIZES.SEGUNDO) - 1 ||
    num === parseInt(config.MAIN_PRIZES.SEGUNDO) + 1 ||
    num === parseInt(config.MAIN_PRIZES.TERCERO) - 1 ||
    num === parseInt(config.MAIN_PRIZES.TERCERO) + 1
  );
}

/**
 * Calculates the prize for an approximation
 * @param {string} number - The lottery number
 * @param {Object} config - The lottery configuration
 * @returns {number} - Prize amount in euros
 */
function calculateApproximationPrize(number, config) {
  const num = parseInt(number);
  if (Math.abs(num - parseInt(config.MAIN_PRIZES.GORDO)) === 1) return 2100; // 2000 + 100 centena
  if (Math.abs(num - parseInt(config.MAIN_PRIZES.SEGUNDO)) === 1) return 1350; // 1250 + 100 centena
  if (Math.abs(num - parseInt(config.MAIN_PRIZES.TERCERO)) === 1) return 1060; // 960 + 100 centena
  return 0;
}

/**
 * Checks if a number belongs to a centena range
 * @param {string} number - The lottery number
 * @param {Object} config - The lottery configuration
 * @returns {boolean}
 */
function isCentena(number, config) {
  const num = parseInt(number);
  return Object.values(config.PRIZE_RANGES).some(
    (range) => num >= range.start && num <= range.end
  );
}

/**
 * Calculates the centena prize if applicable
 * @param {string} number - The lottery number
 * @param {Object} config - The lottery configuration
 * @returns {number} - Prize amount in euros
 */
function calculateCentenaPrize(number, config) {
  return isCentena(number, config) ? 100 : 0;
}

/**
 * Calculates the terminación prize if applicable
 * @param {string} number - The lottery number
 * @param {Object} config - The lottery configuration
 * @returns {number} - Prize amount in euros
 */
function calculateTerminacionPrize(number, config) {
  const endings = Object.values(config.PRIZE_ENDINGS).filter(
    (ending) => ending !== config.PRIZE_ENDINGS.REINTEGRO
  );
  return endings.some((ending) => number.endsWith(ending)) ? 100 : 0;
}

/**
 * Calculates the reintegro prize if applicable
 * @param {string} number - The lottery number
 * @param {Object} config - The lottery configuration
 * @returns {number} - Prize amount in euros
 */
function calculateReintegroPrize(number, config) {
  return number.endsWith(config.PRIZE_ENDINGS.REINTEGRO) ? 20 : 0;
}

module.exports = {
  calculateExpectedPrize,
  getDescriptionForNumber,
  isMainPrize,
  isApproximation,
  isCentena,
  calculateCentenaPrize,
  calculateTerminacionPrize,
  calculateReintegroPrize,
};
