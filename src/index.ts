// library imports
import express from "express";

// local imports
import router from "./router/index";
import { port, dynamoDB, dynamoDBTableName, youtubeApi } from "./config";

const app = express();

app.use(express.json());
app.use(router(dynamoDB, dynamoDBTableName, youtubeApi));

app.listen(port, () => {
  console.log("Server listening on PORT: ", port);
});
