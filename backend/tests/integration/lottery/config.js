/**
 * Configuration for Christmas Lottery 2023 prize testing
 */
module.exports = {
  DRAW_ID: "1259409102",
  MAIN_PRIZES: {
    GORDO: "72480",
    SEGUNDO: "40014",
    TERCERO: "11840",
    CUARTOS: ["48020", "77768"],
    QUINTOS: [
      "37876",
      "45225",
      "45456",
      "60622",
      "72853",
      "74778",
      "75143",
      "97345",
    ],
  },
  PRIZE_ENDINGS: {
    TERMINAL_14: "14",
    TERMINAL_40: "40",
    TERMINAL_80: "80",
    REINTEGRO: "0",
  },
  PRIZE_RANGES: {
    GORDO_CENTENA: { start: 72400, end: 72499 },
    SEGUNDO_CENTENA: { start: 40000, end: 40099 },
    TERCERO_CENTENA: { start: 11800, end: 11899 },
    CUARTO1_CENTENA: { start: 48000, end: 48099 },
    CUARTO2_CENTENA: { start: 77700, end: 77799 },
  },
};
