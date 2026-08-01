import mongoose from 'mongoose';
import { config } from '../Config/config';
import logger from '../Config/Logger';

export const connectMongo = async (): Promise<void> => {
    try {
        await mongoose.connect(config.mongo.uri as string, {
            serverSelectionTimeoutMS: 5000,
        });
        logger.info('MongoDB connected successfully');
    } catch (error) {
        logger.error('MongoDB connection failed:', error);
        process.exit(1);
    }
};

mongoose.connection.on('connected', () => logger.info('✅ MongoDB connected'));
mongoose.connection.on('error', (err) => logger.error('❌ MongoDB error:', err));
mongoose.connection.on('disconnected', () => logger.info('🔴 MongoDB disconnected'));
mongoose.connection.on('reconnected', () => logger.info('♻️ MongoDB reconnected'));

export default mongoose;
