/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from 'express';

/* eslint-disable no-console */
import axios from 'axios';
import { AppError } from './AppError';

export function handleAxiosError(err: unknown): void {
	if (axios.isAxiosError(err)) {
		console.error('[AxiosError]', err.message, err.response?.data);
		throw AppError.notFound(
			JSON.stringify({ message: err.message, data: err.response?.data })
		);
	} else {
		console.error('[UnexpectedError]', err);
		throw AppError.notFound('UnexpectedError');
	}
}

export function errorHandler(
	err: any,
	_req: Request,
	res: Response,
	_next: NextFunction
) {
	res.status(500).json({
		error: err instanceof Error ? err.message : 'Internal server error',
	});
}
