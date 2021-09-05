class HTTPException extends Error {
  status: number;
  message: string;
  errorObject: any;
  constructor(status: number, message: string, errorObject?: any) {
    super();
    this.status = status;
    this.message = message;
    this.errorObject = errorObject;
  }
}

export { HTTPException };
