// utils/AppError.ts
export class AppError extends Error {
	public statusCode: number;
	public status: string;
	public isOperational: boolean;

	constructor(message: string, statusCode: number) {
		super(message);

		this.statusCode = statusCode;
		this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
		this.isOperational = true;

		// Ensure the name of this error is the same as the class name
		this.name = this.constructor.name;

		// Capture the stack trace (excluding constructor call from it)
		Error.captureStackTrace(this, this.constructor);
	}

	static required(message: string) {
		return new AppError(message, 400);
	}

	static notFound(message: string) {
		return new AppError(message, 404);
	}
}
