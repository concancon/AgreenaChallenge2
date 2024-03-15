import { Expose, Transform } from "class-transformer";

/**
 * @openapi
 * components:
 *  schemas:
 *    UserDto:
 *      type: object
 *      properties:
 *        id:
 *          type: string
 *        email:
 *          type: string
 *        createdAt:
 *          type: string
 *        updatedAt:
 *          type: string
 */
export class CreateUserOutputDto {
  constructor(partial?: Partial<CreateUserOutputDto>) {
    Object.assign(this, partial);
  }

  @Expose()
  public readonly id: string;

  @Expose()
  public email: string;

  @Transform(({ value }) => (value as Date).toISOString())
  @Expose()
  public createdAt: Date;

  @Transform(({ value }) => (value as Date).toISOString())
  @Expose()
  public updatedAt: Date;
}
