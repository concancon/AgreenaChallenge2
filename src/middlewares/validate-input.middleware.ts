import { ClassConstructor, plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { BadRequestError } from "errors/errors";
import { NextFunction, Request, Response } from "express";
import { getErrorMessages } from "helpers/utils";

export function validateInputMiddleware(validationSchema: ClassConstructor<object>) {
  return async (req: Request, _: Response, next: NextFunction): Promise<void> => {
    try {
      let input: unknown;

      if (req.method === "GET") {
        input = req.query;
      } else {
        input = req.body;
      }

      const validationErrors = await validate(plainToInstance(validationSchema, input));

      if (validationErrors.length > 0) {
        const messages = getErrorMessages(validationErrors);

        next(new BadRequestError(messages));
        return;
      }

      next();
    } catch (error) {
      next(error);
      return;
    }
  };
}
