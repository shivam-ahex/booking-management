import express, { Response, NextFunction } from "express";
import morgan from "morgan";
import { CustomRequest } from "./src/utils/request-model";
import userRoute from "./src/routes/userRoute";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const app = express();

app.use(express.json());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use((req: CustomRequest, res: Response, next: NextFunction) => {
  req.requestTime = new Date().toISOString();
  next();
});

const options = {
  definition: {
    openapi: "3.0.1",
    info: {
      title: "REST API for booking management",
      version: "1.0.0"
    },
    schemes: ["http", "https"],
    servers: [{ url: `${process.env.API_URL}` }]
  },
  apis: ["./src/routes/userRoute.ts", "../../dist/src/routes/userRoute.js"]
};

const swaggerSpec = swaggerJSDoc(options);

app.use(
  `${process.env.API_URL}/api-docs`,
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);
app.use(`${process.env.API_URL}/users`, userRoute);
export default app;
