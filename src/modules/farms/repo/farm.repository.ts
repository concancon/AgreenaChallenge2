import dataSource from "orm/orm.config";
import { Farm } from "../entities/farm.entity";

const farmRepo = dataSource.getRepository(Farm);
export const FarmRepository = farmRepo.extend({
  findWithSort(this: typeof farmRepo, propertyToSortBy: string, orderToSort: "ASC" | "DESC" | undefined): Promise<Farm[]> {
    const queryBuilder = this.createQueryBuilder("farm");
    //const greaterThan = ">";
    //const lessThan = "<";

    return (
      queryBuilder
        .setFindOptions({
          loadEagerRelations: true,
        })
        .orderBy(`farm.${propertyToSortBy}`, orderToSort)
        .select()
        //.where(`farm.yield ${greaterThan} (SELECT AVG(yield) FROM farm)`, {})
        .getMany()
    );
  },
});
