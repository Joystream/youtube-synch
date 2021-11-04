import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Channel } from "../channels/channel.entity";

@Entity({ name: "playlists" })
export class Playlist {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(() => Channel, channel => channel)
    @JoinColumn({ name: "channelId" })
    channel: Channel;

    @Column()
    channelId: string;
    
    @Column("text")
    ytPlaylistId: string;

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
}
