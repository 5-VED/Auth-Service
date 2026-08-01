	import dotenv from 'dotenv';
import dotenvParseVariables from 'dotenv-parse-variables';
import path from 'path';

// Load environment variables from the .env file (optional when using env_file or secrets)
const envResult = dotenv.config({ path: '.env' });

// Merge parsed .env (if present) with process.env and parse types
const mergedEnv = { ...(envResult.parsed || {}), ...process.env } as Record<string, any>;
const parsedEnv = dotenvParseVariables(mergedEnv);

// Environment variables are now loaded directly from process.env (Docker)
const env = process.env.NODE_ENV || 'development';
console.log("---------- env", env);

export const config = {
	env,
	isDevelopment: env === 'development',
	isProduction: env === 'production',
	isTest: env === 'test',
	port: Number(parsedEnv.PORT) || 3000,
	mongo: {
		uri: parsedEnv.MONGO_URI || 'mongodb://localhost:27017/paymentsvc',
	},
	server: {
		memoryUsageTimeOut: (parsedEnv.MEMORY_USAGE_TIMEOUT),
		activateNewRelic: true
	},
	jwt: {
		secret: parsedEnv.JWT_SECRET_KEY,
		expiresIn: parsedEnv.JWT_EXPIRES_IN,
	},
	kafka:{
		brokers: parsedEnv.KAFKA_BROKERS || parsedEnv.KAFKA_BROKER || 'localhost:9092',
		clientId: parsedEnv.KAFKA_CLIENT_ID || 'auth-service',
	}
};
