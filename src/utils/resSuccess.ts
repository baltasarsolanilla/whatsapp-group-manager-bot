import { Response } from 'express';

// Simple generic success response to migrate later for a proper handler
export const resSuccess = (res: Response, payload?: object) => {
	res.status(200).json(payload);
};

// Accepted response for background/async operations
export const resAccepted = (res: Response, payload?: object) => {
	res.status(202).json(payload);
};
