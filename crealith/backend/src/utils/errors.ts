export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const createError = {
  badRequest: (message: string) => new AppError(message, 400),
  unauthorized: (message: string = 'Unauthorized') => new AppError(message, 401),
  forbidden: (message: string = 'Forbidden') => new AppError(message, 403),
  notFound: (message: string) => new AppError(message, 404),
  conflict: (message: string) => new AppError(message, 409),
  validation: (message: string) => new AppError(message, 422),
  internal: (message: string = 'Internal server error') => new AppError(message, 500)
};
