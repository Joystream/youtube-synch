import ytdl from "ytdl-core";
import axios from "axios";
import { ApiPromise } from "@polkadot/api";

import calculateUsersRemainingStorageSpace from "./calculateUsersRemainingStorageSpace";

import { User } from "../../types";

const findUsersWithFreeSpace = async (joyApi: ApiPromise, users: User[]) => {
  const usersWithFreeSpace: User[] = [];

  for (let index = 0; index < users.length; index++) {
    let user = users[index];

    const { formats } = await ytdl.getInfo(user.lastSynchedVideo);
    const highestQualityVideo = ytdl.chooseFormat(formats, {
      filter: "audioandvideo",
      quality: "highestvideo"
    });

    const remainingSpaceInBytes = await calculateUsersRemainingStorageSpace(joyApi, user);
    // TODO:
    // URL returned by ytdl ocasionally gives 403 when trying to make a request. Open issue on the topic:
    // https://github.com/fent/node-ytdl-core/issues/932
    const videoSizeInBytes = Number(
      (await axios.head(highestQualityVideo.url)).headers["content-length"]
    );

    if (videoSizeInBytes < remainingSpaceInBytes) {
      usersWithFreeSpace.push(user);
    }
  }

  return usersWithFreeSpace;
};

export default findUsersWithFreeSpace;
