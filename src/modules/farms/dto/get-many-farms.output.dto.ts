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
export class GetManyFarmsOutputDto {
  constructor(partial?: Partial<GetManyFarmsOutputDto>) {
    Object.assign(this, partial);
  }

  @Expose()
  public farms: Farm[];
}
