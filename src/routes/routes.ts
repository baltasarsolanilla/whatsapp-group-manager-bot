import express from 'express';
import { controller } from '@routes/controller';

const router = express.Router();

router.post('/', controller);

export default router;
