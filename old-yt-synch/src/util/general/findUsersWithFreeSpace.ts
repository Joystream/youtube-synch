import ytdl from "ytdl-core";
import axios from "axios";
import { ApiPromise } from "@polkadot/api";

import calculateUsersRemainingStorageSpace from "./calculateUsersRemainingStorageSpace";

import { User } from "../../types";

const findUsersWithFreeSpace = async (joyApi: ApiPromise, users: User[]) => {
  const usersWithFreeSpace: User[] = [];

  for (let user of users) {
    let videoSizeInBytes: number;

    const { formats } = await ytdl.getInfo(user.lastSynchedVideo);
    const highestQualityVideo = ytdl.chooseFormat(formats, {
      filter: "audioandvideo",
      quality: "highestvideo"
    });

    const remainingSpaceInBytes = await calculateUsersRemainingStorageSpace(joyApi, user);
    // TODO:
    // URL returned by ytdl ocasionally gives 403 when trying to make a request. Open issue on the topic:
    // https://github.com/fent/node-ytdl-core/issues/932
    // Happens rarely, hard to reproduce. For now skipping user when it happens.
    try {
      const response = await axios.head(highestQualityVideo.url);
      videoSizeInBytes = Number(response.headers["content-length"]);
    } catch (error) {
      console.log(`Error while trying to request video with id: ${user.lastSynchedVideo}`, {
        error
      });
      continue;
    }

    if (videoSizeInBytes < remainingSpaceInBytes) {
      usersWithFreeSpace.push(user);
    }
  }

  return usersWithFreeSpace;
};

export default findUsersWithFreeSpace;
