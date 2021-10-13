import { Request, Response, NextFunction } from "express";

import HTTPException from "../exceptions/HTTPException";

type ResponseObject = {
  status: number;
  message: string;
  originalErrorObject?: any;
};

const errorMiddleware = (error: HTTPException, req: Request, res: Response, next: NextFunction) => {
  let responseObject: ResponseObject = {
    status: error.status,
    message: error.message
  };

  if (error?.errorObject) {
    responseObject.originalErrorObject = error.errorObject;
  }

  console.log(error);

  res.status(error.status).send(responseObject);
};

export default errorMiddleware;
