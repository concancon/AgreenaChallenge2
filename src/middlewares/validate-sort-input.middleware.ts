import { ClassConstructor, plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { BadRequestError } from "errors/errors";
import { NextFunction, Request, Response } from "express";
import { getErrorMessages } from "helpers/utils";
import { SortFarmsInputDto } from "modules/farms/dto/sort-farms.input.dto";

export function validateSortInputMiddleware(validationSchema: ClassConstructor<object>) {
  return async (req: Request, _: Response, next: NextFunction): Promise<void> => {
    try {
      const sortFarmsInputDto = plainToInstance(validationSchema, { sortBy: req.query.prop, filter: req.query.filter });
      const validationErrors = await validate(sortFarmsInputDto);

      if (validationErrors.length > 0) {
        const messages = getErrorMessages(validationErrors);
        next(new BadRequestError(messages));
        return;
      }
      req.sortFarmsInputDto = sortFarmsInputDto as SortFarmsInputDto;
      next();
    } catch (error) {
      next(error);
      return;
    }
  };
}
