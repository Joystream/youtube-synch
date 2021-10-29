import { EntityRepository, Repository } from "typeorm";
import { Video } from "../entity/Video";

@EntityRepository(Video)
export class VideoRepository extends Repository<Video> {
}
