import express from 'express';
import dotenv from 'dotenv';
import routes from '@routes/routes';
import config from '@config';

dotenv.config();
const app = express();
app.use(express.json());

app.use('/', routes);

const PORT = config.port || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
