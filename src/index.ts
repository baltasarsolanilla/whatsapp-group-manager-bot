import config from '@config';
import routes from '@routes/routes';
import dotenv from 'dotenv';
import express from 'express';

dotenv.config();
const app = express();
app.use(express.json());

app.use('/', routes);

const PORT = config.port ?? 3000;
// eslint-disable-next-line no-console
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
