import { Expose, Transform } from "class-transformer";
import { User } from "modules/users/entities/user.entity";

/**
 * @openapi
 * components:
 *  schemas:
 *    CreateFarmOutputDto:
 *      type: object
 *      properties:
 *        id:
 *          type: string
 *        name:
 *          type: string
 *        size:
 *          type: number
 *        yield:
 *          type: number
 *        createdAt:
 *          type: string
 *        updatedAt:
 *          type: string
 */
export class CreateFarmOutputDto {
  constructor(partial?: Partial<CreateFarmOutputDto>) {
    Object.assign(this, partial);
  }

  @Expose()
  public id: string;

  @Expose()
  public name: string;

  @Expose()
  public yield: number;

  @Expose()
  public size: number;

  @Expose()
  public owner: User;

  @Transform(({ value }) => (value as Date).toISOString())
  @Expose()
  public createdAt: Date;

  @Transform(({ value }) => (value as Date).toISOString())
  @Expose()
  public updatedAt: Date;
}
