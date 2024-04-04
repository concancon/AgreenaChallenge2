import { Expose } from "class-transformer";
import { Farm } from "../entities/farm.entity";
/**
 * @openapi
 * components:
 *  schemas:
 *    GetManyFarmsOutputDto:
 *      type: object
 *      properties:
 *        farms:
 *          type: object
 */
class FarmWithDistanceToUser extends Farm {
  public drivingDistance: number;
}

export class GetManyFarmsOutputDto {
  constructor(partial?: Partial<GetManyFarmsOutputDto>) {
    Object.assign(this, partial);
  }

  @Expose()
  public farms = new Array<FarmWithDistanceToUser>();
}
