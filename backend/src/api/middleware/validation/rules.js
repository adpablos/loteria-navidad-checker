// Reglas de validación
const { param } = require("express-validator");

const rules = {
  drawId: [
    param("drawId")
      .isString()
      .trim()
      .isLength({ min: 10, max: 10 })
      .withMessage("Draw ID must be exactly 10 characters long")
      .matches(/^\d{10}$/)
      .withMessage("Draw ID must contain only numbers"),
  ],
  ticketNumber: [
    param("ticketNumber")
      .isString()
      .trim()
      .isLength({ min: 5, max: 5 })
      .withMessage("Ticket number must be exactly 5 digits long")
      .matches(/^\d{5}$/)
      .withMessage("Ticket number must contain only digits"),
  ],
};

module.exports = rules;
