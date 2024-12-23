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
};

module.exports = rules;
