import { DeepPartial, Repository } from "typeorm";
import dataSource from "orm/orm.config";
import { Farm } from "./entities/farm.entity";
import { UnprocessableEntityError } from "errors/errors";
import { CreateFarmWithCoordinatesInputDto } from "./dto/create-farm-with-coordinates.input.dto";

export class FarmsService {
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
    };
    const newFarm = this.farmsRepository.create(farmDataWithAddress);

    return this.farmsRepository.save(newFarm);
  }
}
