import { NextFunction, Request, Response } from "express";
import { FarmsService } from "./farms.service";
import { CreateFarmInputDto } from "./dto/create-farm.input.dto";
import { CreateFarmOutputDto } from "./dto/create-farm.output.dto";
import { instanceToPlain } from "class-transformer";
import { AddressService } from "modules/address/address.service";
import { GetManyFarmsOutputDto } from "./dto/get-many-farms.output.dto";

export class FarmsController {
  private readonly farmsService: FarmsService;
  private readonly addressService: AddressService;

  constructor() {
    this.farmsService = new FarmsService();
    this.addressService = new AddressService();
  }

  public async create(req: Request, res: Response, next: NextFunction) {
    try {
      const createFarmInputDto = req.body as CreateFarmInputDto;

      const coordinates = await this.addressService.getCoordinatesFromAddress(createFarmInputDto.address);
      const farm = await this.farmsService.createFarm({ ...createFarmInputDto, coordinates });

      res.status(201).send(instanceToPlain(new CreateFarmOutputDto(farm)));
    } catch (error) {
      next(error);
    }
  }

  public async get(_req: Request, res: Response, next: NextFunction) {
    try {
      //must only authenticate user and then return all farms. thus we call the farms service without params for now
      const farms = await this.farmsService.getAllFarms();

      res.status(201).send(instanceToPlain(new GetManyFarmsOutputDto(farms)));
    } catch (error) {
      next(error);
    }
  }
}
