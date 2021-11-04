import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { User } from "../users/user.entity";

@Entity({ name: "channels" })
export class Channel {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(() => User, user => user)
    @JoinColumn({ name: "userId" })
    user: User;

    @Column()
    userId: string;
    
    @Column("text")
    ytChannelId: string;

    @Column("text")
    title: string;

    @Column("text")
    description: string;

    @Column("text")
    thumDefault: string;

    @Column("text")
    thumMedium: string;

    @Column("text")
    thumHigh: string;

    @Column("text")
    thumStandard: string;

    @Column("text")
    thumMaxRes: string;

    @Column("int")
    views: number;

    @Column("int")
    subscribers: number;

    @Column("int")
    videoCount: number;
}
