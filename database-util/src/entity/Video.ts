import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Playlist } from './Playlist';

type VideoStatus = "New" | "Downloading" | "Error" | "Ready";

@Entity({ name: "Videos" })
export class Video {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(() => Playlist, playlist => playlist)
    @JoinColumn({ name: "playlistId" })
    playlist: Playlist;

    @Column()
    playlistId: string;
    
    @Column("text")
    ytPlaylistId: string;

    @Column("text")
    ytVideoId: string;

    @Column("text")
    ytResourceId: string;

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

    @Column("text")
    ytUrl: string;

    @Column("text")
    title: string;

    @Column("text")
    description: string;

    @Column({ type: "enum", enum: ["New", "Downloading", "Error", "Ready"] })
    status: VideoStatus;

    @Column("text")
    bucket: string;

    @Column("int")
    viewCount: number;

    @Column("int")
    likeCount: number;

    @Column("int")
    dislikeCount: number;

    @Column("int")
    favoriteCount: number;

    @Column("int")
    commentCount: number;

    @Column("date")
    discoveryDate: string;
}
