import dataSource from "orm/orm.config";
import { Farm } from "../entities/farm.entity";

const farmRepo = dataSource.getRepository(Farm);
export const FarmRepository = farmRepo.extend({
  findWithSort(
    this: typeof farmRepo,
    sortByAndOrder: "name" | "createdAt" | "driving_distance" | undefined,
    orderToSort?: "ASC" | "DESC",
  ): Promise<Farm[]> {
    const queryBuilder = this.createQueryBuilder("farm");
    //const greaterThan = ">";
    //const lessThan = "<";
    return (
      queryBuilder
        .setFindOptions({
          loadEagerRelations: true,
        })
        .orderBy(`farm.${sortByAndOrder}`, orderToSort)
        .select()
        //.where(`farm.yield ${greaterThan} (SELECT AVG(yield) FROM farm)`, {})
        .getMany()
    );
  },
  getAll(this: typeof farmRepo): Promise<Farm[]> {
    const queryBuilder = this.createQueryBuilder("farm");
    return queryBuilder
      .setFindOptions({
        loadEagerRelations: true,
      })
      .getMany();
  },
});
