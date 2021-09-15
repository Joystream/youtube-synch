// library imports
import express from "express";
import xmlparser from "express-xml-bodyparser";
import cron from "node-cron";

// local imports
import router from "./router/index";
import joystreamApi from "./joystreamApi";
import errorMiddleware from "./middleware/errorMiddleware";
import checkUsersForAvailableStorage from "./controllers/checkUsersForAvailableStorage";

import { port, dynamoDB, dynamoDBTableName, youtubeApi } from "./config";

const main = async () => {
  const app = express();
  const joyApi = await joystreamApi();

  app.use(express.json());
  app.use(xmlparser());
  app.use(router(dynamoDB, dynamoDBTableName, youtubeApi));
  app.use(errorMiddleware);

  cron.schedule("*/1 * * * *", () =>
    checkUsersForAvailableStorage(joyApi, dynamoDB, dynamoDBTableName)
  );

  app.listen(port, () => {
    console.log("Server listening on PORT: ", port);
  });
};

main();
