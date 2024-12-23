const express = require("express");
const LotteryController = require("../controllers/lottery.controller");
const { validateDrawId } = require("../middleware/validation/validator");

/**
 * @openapi
 * tags:
 *   - name: Lottery
 *     description: Lottery draw operations
 */

/**
 * @openapi
 * /lottery/state:
 *   get:
 *     summary: Get current lottery celebration state
 *     tags: [Lottery]
 *     responses:
 *       200:
 *         description: Celebration state retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 estadoCelebracionLNAC:
 *                   type: boolean
 *                   description: Whether the lottery draw is currently active
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @openapi
 * /lottery/ticket/{drawId}:
 *   get:
 *     summary: Get information for a specific lottery ticket
 *     description: |
 *       Returns detailed information about a specific lottery draw.
 *       Note: The actual response may be quite large as it includes all prize information.
 *     tags: [Lottery]
 *     parameters:
 *       - in: path
 *         name: drawId
 *         required: true
 *         description: The lottery draw identifier
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lottery draw information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     tipoSorteo:
 *                       type: string
 *                       example: "N"
 *                     fechaSorteo:
 *                       type: string
 *                       example: "2024-12-22T08:30:00.000Z"
 *                     drawIdSorteo:
 *                       type: string
 *                       example: "1259409102"
 *                     nombreDelSorteo:
 *                       type: string
 *                       example: "SORTEO EXTRAORDINARIO DE NAVIDAD"
 *                     primerPremio:
 *                       type: object
 *                       properties:
 *                         decimo:
 *                           type: string
 *                           example: "72480"
 *                         prize:
 *                           type: number
 *                           example: 40000000
 *                         prizeType:
 *                           type: string
 *                           example: "G"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @openapi
 * /lottery/results/{drawId}:
 *   get:
 *     summary: Get complete results for a specific lottery draw
 *     tags: [Lottery]
 *     parameters:
 *       - in: path
 *         name: drawId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^\d{10}$'
 *         description: The lottery draw identifier
 *     responses:
 *       200:
 *         description: Draw results retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 normalizedItems:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       numero:
 *                         type: string
 *                       premio:
 *                         type: number
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

/**
 * @openapi
 * /lottery/clearcache:
 *   get:
 *     summary: Clear the API cache
 *     tags: [Lottery]
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Cache cleared successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Cache cleared successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

// Create router instance
const router = express.Router();

// Create controller instance
const controller = new LotteryController();

// Define routes
router.get("/state", async (req, res, next) => {
  try {
    await controller.getCelebrationState(req, res);
  } catch (error) {
    next(error);
  }
});

router.get("/ticket/:drawId", validateDrawId(), async (req, res, next) => {
  try {
    await controller.getTicketInfo(req, res);
  } catch (error) {
    next(error);
  }
});

router.get("/results/:drawId", validateDrawId(), async (req, res, next) => {
  try {
    await controller.getResults(req, res);
  } catch (error) {
    next(error);
  }
});

router.get("/clearcache", async (req, res, next) => {
  try {
    await controller.clearCache(req, res);
  } catch (error) {
    next(error);
  }
});

// Export router
module.exports = router;
