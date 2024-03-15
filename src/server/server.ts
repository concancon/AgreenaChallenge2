import swaggerDocs from "config/swagger-config";
import express, { Express } from "express";
import { handleErrorMiddleware } from "middlewares/error-handler.middleware";
import routes from "routes";

export function setupServer(): Express {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use("/api", routes);

  app.use(handleErrorMiddleware);

  swaggerDocs(app);
  return app;
}
