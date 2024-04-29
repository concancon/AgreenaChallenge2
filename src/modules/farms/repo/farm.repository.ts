import dataSource from "orm/orm.config";
import { Farm } from "../entities/farm.entity";

const farmRepo = dataSource.getRepository(Farm);
export const FarmRepository = farmRepo.extend({
  async findWithSort(
    this: typeof farmRepo,
    sortBy: "name" | "createdAt" | "driving_distance",
    filter: boolean | undefined,
  ): Promise<Farm[]> {
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
    return queryBuilder.limit(100).getMany();
  },
});
