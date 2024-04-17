import { DeepPartial, Repository } from "typeorm";
import dataSource from "orm/orm.config";
import { Farm } from "./entities/farm.entity";
import { UnprocessableEntityError } from "errors/errors";
import { CreateFarmWithCoordinatesInputDto } from "./dto/create-farm-with-coordinates.input.dto";
//import { GetManyFarmsOutputDto } from "./dto/get-many-farms.output.dto";
import { FarmRepository } from "./repo/farm.repository";

interface userQuery {
  sortBy: {
    prop: string;
    orderToSort: undefined | "ASC" | "DESC";
  };
}

export class FarmsService {
  [x: string]: any;
  private readonly farmsRepository: Repository<Farm>;

  constructor() {
    this.farmsRepository = dataSource.getRepository(Farm);
  }

  public async createFarm(data: CreateFarmWithCoordinatesInputDto): Promise<Farm> {
    const existingFarm = await this.farmsRepository.findOne({ where: { name: data.name } });

    if (existingFarm) throw new UnprocessableEntityError("A farm with the same name already exists");

    const farmDataWithAddress: DeepPartial<Farm> = {
      name: data.name,
      size: data.size,
      yield: data.yield,
      address: data.address,
      coordinates: data.coordinates,
      owner: data.owner,
    };
    const newFarm = this.farmsRepository.create(farmDataWithAddress);

    return this.farmsRepository.save(newFarm);
  }

  public async getAllFarms({ sortBy: { prop, orderToSort } }: userQuery): Promise<Farm[]> {
    const allFarms = await FarmRepository.findWithSort(prop, orderToSort);
    if (allFarms.length === 0) {
      throw new Error("No Farms exist");
    }
    return allFarms;
  }
}
