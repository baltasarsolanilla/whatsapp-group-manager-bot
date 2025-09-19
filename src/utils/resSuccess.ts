import { Response } from 'express';

// Simple generic success response to migrate later for a proper handler
export const resSuccess = (res: Response, payload?: object) => {
	res.status(200).json(payload);
};
