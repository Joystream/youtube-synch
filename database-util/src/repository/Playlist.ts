import { EntityRepository, Repository } from "typeorm";
import { Playlist } from "../entity/Playlist";

@EntityRepository(Playlist)
export class PlaylistRepository extends Repository<Playlist> {
}
