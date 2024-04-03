import { User } from "modules/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Farm {
  @PrimaryGeneratedColumn("uuid")
  public readonly id: string;

  @Column({ unique: true })
  public name: string;

  @Column({ type: "float" })
  public yield: number;

  @Column({ type: "float" })
  public size: number;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;

  @Column()
  public address: string;

  @Column("simple-json")
  public coordinates: { lat: number; lng: number };

  @ManyToOne(() => User, user => user.farms, { eager: true })
  public owner: User;
}
