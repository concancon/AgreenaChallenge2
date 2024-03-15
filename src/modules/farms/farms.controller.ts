import { NextFunction, Request, Response } from "express";
import { FarmsService } from "./farms.service";
import { CreateFarmInputDto } from "./dto/create-farm.input.dto";
import { CreateFarmOutputDto } from "./dto/create-farm.output.dto";
import { instanceToPlain } from "class-transformer";

export class FarmsController {
  private readonly farmsService: FarmsService;

  constructor() {
    this.farmsService = new FarmsService();
  }

  public async create(req: Request, res: Response, next: NextFunction) {
    try {
      const farm = await this.farmsService.createFarm(req.body as CreateFarmInputDto);

      res.status(201).send(instanceToPlain(new CreateFarmOutputDto(farm)));
    } catch (error) {
      next(error);
    }
  }
}
