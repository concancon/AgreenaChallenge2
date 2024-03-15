import { BadRequestError, UnauthorizedError, UnprocessableEntityError } from "errors/errors";
import { NextFunction, Request, Response } from "express";
import { EntityNotFoundError } from "typeorm";

export function handleErrorMiddleware(error: Error, _: Request, res: Response, next: NextFunction): void {
  const { message } = error;

  if (error instanceof UnprocessableEntityError) {
    res.status(422).send({ name: "UnprocessableEntityError", message });
  } else if (error instanceof BadRequestError) {
    res.status(400).send({ name: "BadRequestError", message });
  } else if (error instanceof UnauthorizedError) {
    res.status(401).send({ name: "UnauthorizedError", message });
  } else if (error instanceof EntityNotFoundError) {
    res.status(404).send({ name: "EntityNotFoundError", message });
  } else {
    res.status(500).send({ message: "Internal Server Error" });
  }

  next();
}
