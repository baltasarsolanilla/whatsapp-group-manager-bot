/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from 'express';

/* eslint-disable no-console */
import axios from 'axios';

export function handleAxiosError(err: unknown): void {
	if (axios.isAxiosError(err)) {
		console.error('[AxiosError]', err.message, err.response?.data);
	} else {
		console.error('[UnexpectedError]', err);
	}
}

export function errorHandler(
	err: any,
	req: Request,
	res: Response,
	next: NextFunction
) {
	res.status(500).json({
		error: err instanceof Error ? err.message : 'Internal server error',
	});
}
