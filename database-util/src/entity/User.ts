import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

type UserState = "New" | "Verified" | "Blocked";

@Entity({ name: "users" })
export class User {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column("text")
    email: string;

    @Column({ type: "enum", enum: ["New", "Verified", "Blocked"] })
    status: UserState;

    @Column("text")
    ytUserName: string;
}
