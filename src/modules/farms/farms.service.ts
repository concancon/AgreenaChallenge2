import { DeepPartial, Repository } from "typeorm";
import dataSource from "orm/orm.config";
import { Farm } from "./entities/farm.entity";
import { UnprocessableEntityError } from "errors/errors";
import { CreateFarmWithCoordinatesInputDto } from "./dto/create-farm-with-coordinates.input.dto";
import { FarmRepository } from "./repo/farm.repository";

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

  public async getAllFarms(prop: "name" | "createdAt" | "driving_distance", filter: boolean | undefined): Promise<Farm[]> {
    let currentPage = 1; // Start with the first page
    const allFarms: Farm[] = []; // Array to store all fetched farms
    const pageSize = 100;
    for (;;) {
      const [farms, totalCount]: [Farm[], number] = await FarmRepository.findWithSort(prop, filter, currentPage, pageSize);
      allFarms.push(...farms);

      if (allFarms.length >= totalCount) {
        break;
      }
      currentPage++;
    }

    return allFarms;
  }
}
