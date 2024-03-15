import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateFarmsTable1707327301155 implements MigrationInterface {
  public name = "CreateFarmsTable1707327301155";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "farm" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "yield" double precision NOT NULL,
        "size" double precision NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_11527b5b142bb3e07f87d459802" UNIQUE ("name"),
        CONSTRAINT "PK_3bf246b27a3b6678dfc0b7a3f64" PRIMARY KEY ("id")
      )`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "farm"`);
  }
}
