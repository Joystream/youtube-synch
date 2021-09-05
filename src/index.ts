// library imports
import express from "express";
import xmlparser from "express-xml-bodyparser";

// local imports
import router from "./router/index";
import { port, dynamoDB, dynamoDBTableName, youtubeApi } from "./config";
import errorMiddleware from "./middleware/errorMiddleware";

const app = express();

app.use(express.json());
app.use(xmlparser());
app.use(router(dynamoDB, dynamoDBTableName, youtubeApi));
app.use(errorMiddleware);

app.listen(port, () => {
  console.log("Server listening on PORT: ", port);
});
