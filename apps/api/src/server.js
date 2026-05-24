import dotenv from 'dotenv';
import { createApp } from './app.js';
import { config } from './config.js';

dotenv.config();

const app = createApp();

app.listen(config.PORT, () => {
  console.log(`InvControl API listening on http://localhost:${config.PORT}/api`);
});
