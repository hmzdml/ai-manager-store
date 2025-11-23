import app from './app';
import logger from './logger';

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => logger.info(`Backend running on port ${PORT}`));
