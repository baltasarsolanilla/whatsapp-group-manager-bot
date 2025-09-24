import config from '@config';
import routes from '@routes/routes';
import { errorHandler } from '@utils/errorHandler';
import express from 'express';

const app = express();
app.use(express.json());
app.use('/', routes);

// Always last one
app.use(errorHandler);

const PORT = config.port ?? 3000;
// eslint-disable-next-line no-console
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
