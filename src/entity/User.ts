import {
    Entity,
    Column,
    Unique,
    CreateDateColumn,
    UpdateDateColumn,
    BeforeInsert,
    PrimaryGeneratedColumn
} from "typeorm";
import { Length, IsNotEmpty } from "class-validator";
import * as bcrypt from "bcryptjs";

export type UserRoleType = "admin" | "trainer" | "user";

@Entity()
@Unique(["username"])
export class User {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    @IsNotEmpty()
    @Length(4, 20)
    username: string;
  
    @Column()
    @IsNotEmpty()
    @Length(5, 100)
    password: string;
    
    @Column({
        type: "enum",
        enum: ["admin", "trainer", "user"],
        default: "user"
    })
    role: UserRoleType;
    
    @Column({ type: 'date', default: null })
    dateOfBirth: Date;

    @Column({ type: "decimal", precision: 7, scale: 2, default: null })
    weightInLBS: number;

    @Column({ type: "decimal", precision: 5, scale: 2, default: null })
    heightInInches: number;

    @Column()
    @IsNotEmpty()
    @CreateDateColumn()
    createdAt: Date;
  
    @Column()
    @IsNotEmpty()
    @UpdateDateColumn()
    updatedAt: Date;
  
    @BeforeInsert()
    async hashPassword() {
        let saltRounds: number = 10;
        this.password = await bcrypt.hash(this.password, saltRounds);
    }

}