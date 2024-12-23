/**
 * @openapi
 * components:
 *   schemas:
 *     Error:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         code:
 *           type: string
 *         statusCode:
 *           type: number
 *         message:
 *           type: string
 *         context:
 *           type: object
 *         timestamp:
 *           type: string
 *           format: date-time
 *   responses:
 *     ValidationError:
 *       description: Invalid input parameters
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 *     NotFoundError:
 *       description: Resource not found
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 */
