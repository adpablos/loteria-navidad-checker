const swaggerJSDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Lotería de Navidad API",
      version: "1.0.0",
      description: "API para consultar resultados de la Lotería de Navidad",
    },
    servers: [
      {
        url: "/api",
        description: "API server",
      },
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: "apiKey",
          in: "header",
          name: "X-API-Key",
        },
      },
      schemas: {
        Error: {
          type: "object",
          properties: {
            name: {
              type: "string",
            },
            code: {
              type: "string",
            },
            statusCode: {
              type: "number",
            },
            message: {
              type: "string",
            },
            context: {
              type: "object",
            },
            timestamp: {
              type: "string",
              format: "date-time",
            },
          },
        },
      },
      responses: {
        UnauthorizedError: {
          description: "Authentication information is missing or invalid",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
            },
          },
        },
        ValidationError: {
          description: "Invalid input parameters",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
            },
          },
        },
        NotFoundError: {
          description: "Resource not found",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
            },
          },
        },
        InternalServerError: {
          description: "Internal server error",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
            },
          },
        },
      },
    },
  },
  apis: [
    "./src/api/routes/*.js",
    "./src/api/controllers/*.js",
    "./src/api/schemas/*.js",
  ],
};

module.exports = swaggerJSDoc(options);
