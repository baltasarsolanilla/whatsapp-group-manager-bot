/* eslint-disable no-console */
import axios from 'axios';

export function handleAxiosError(err: unknown): void {
	if (axios.isAxiosError(err)) {
		console.error('[AxiosError]', err.message, err.response?.data);
	} else {
		console.error('[UnexpectedError]', err);
	}
}
