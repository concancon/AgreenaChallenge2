export class UnprocessableEntityError extends Error {}

export class UnauthorizedError extends Error {
  constructor() {
    super();
    this.message = "Unauthorized";
  }
}

export class BadRequestError extends Error {
  constructor(message: string) {
    super(message);
  }
}
