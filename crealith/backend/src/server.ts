import dotenv from 'dotenv';
dotenv.config();
import app from './app';
import { logger } from './utils/logger';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  logger.info(`🚀 Crealith API running on port ${PORT}`);
});
