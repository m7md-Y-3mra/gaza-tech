class CustomError extends Error {
  code?: string;
  errors?: Record<string, string>;

  constructor({
    message,
    code,
    errors,
  }: {
    message: string;
    code?: string;
    errors?: Record<string, string>;
  }) {
    super(message);
    this.code = code;
    this.errors = errors;
  }
}

export default CustomError;
