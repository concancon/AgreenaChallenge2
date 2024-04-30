import dataSource from "orm/orm.config";
import { Farm } from "../entities/farm.entity";

const farmRepo = dataSource.getRepository(Farm);

export const FarmRepository = farmRepo.extend({
  async findWithSort(
    this: typeof farmRepo,
    sortBy: "name" | "createdAt" | "driving_distance",
    filter: boolean | undefined,
    page: number = 1, // Default page is 1
    pageSize: number = 100, // Default page size is 100
  ): Promise<[Farm[], number]> {
    const offset = (page - 1) * pageSize;

    const queryBuilder = this.createQueryBuilder("farm").setFindOptions({
      loadEagerRelations: true,
    });

    if (sortBy !== "driving_distance") {
      queryBuilder.orderBy(`farm.${sortBy}`, "ASC");
    }

    if (filter) {
      queryBuilder.select().where(`farm.yield > (SELECT AVG(f.yield) * 0.3 + AVG(f.yield) FROM farm f)`);
      queryBuilder.orWhere(`farm.yield < (SELECT AVG(f.yield) - AVG(f.yield) * 0.3 FROM farm f)`);
    }

    queryBuilder.skip(offset).take(pageSize);

    return queryBuilder.getManyAndCount();
  },
});
