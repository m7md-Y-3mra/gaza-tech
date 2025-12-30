
class CustomError extends Error {
  errors?: Record<string, string>;

  constructor({
    message,
    errors,
  }: {
    message: string;
    errors?: Record<string, string>;
  }) {
    super(message);
    this.errors = errors;
  }
}

export default CustomError;
