import express from 'express';
import { controller } from './controller.js';

const router = express.Router();

router.post('/', controller);

export default router;
