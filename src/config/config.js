const dotenv = require('dotenv');
const path = require('path');
const Joi = require('joi');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
    PORT: Joi.number().default(3080),
    SITE_URL: Joi.string().required().description('Site base URL'),
    API_URL: Joi.string().description('API base URL'),
    MONGODB_URL: Joi.string().required().description('Mongo DB connection string'),
    DB_USER: Joi.string().allow('').description('MongoDB Username'),
    DB_PASSWORD: Joi.string().allow('').description('MongoDB Password'),
    JWT_SECRET: Joi.string().required().description('JWT secret key'),
    JWT_ACCESS_EXPIRATION_MINUTES: Joi.number().default(30).description('Access token expiration in minutes'),
    JWT_REFRESH_EXPIRATION_DAYS: Joi.number().default(30).description('Refresh token expiration in days'),
    S3_BUCKET: Joi.string().description('AWS S3 Bucket Name'),
    AccessKeyID: Joi.string().description('AWS Access Key ID'),
    SecretAccessKey: Joi.string().description('AWS Secret Access Key'),
    S3_REGION: Joi.string().description('AWS Region'),
    SMTP_HOST: Joi.string().description('SMTP server host'),
    SMTP_PORT: Joi.number().description('SMTP server port'),
    SMTP_USERNAME: Joi.string().description('SMTP username'),
    SMTP_PASSWORD: Joi.string().description('SMTP password'),
    EMAIL_FROM: Joi.string().description('Sender email address'),
    SENDGRID_API_KEY: Joi.string().description('SendGrid API Key'),
    STRIPE_API_KEY: Joi.string().description('Stripe API Key'),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  SITE_URL: envVars.SITE_URL,
  API_URL: envVars.API_URL,
  S3_BUCKET: envVars.S3_BUCKET,
  ACCESS_KEY: envVars.AccessKeyID,
  SECRET_KEY: envVars.SecretAccessKey,
  S3_REGION: envVars.S3_REGION,
  SENDGRID_API_KEY: envVars.SENDGRID_API_KEY,
  STRIPE_API_KEY: envVars.STRIPE_API_KEY,
  mongoose: {
    url: envVars.MONGODB_URL + (envVars.NODE_ENV === 'test' ? '-test' : ''),
    user: envVars.DB_USER,
    pass: envVars.DB_PASSWORD,
  },
  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
    resetPasswordExpirationMinutes: 30,
  },
  email: {
    smtp: {
      host: envVars.SMTP_HOST,
      port: envVars.SMTP_PORT,
      auth: {
        user: envVars.SMTP_USERNAME,
        pass: envVars.SMTP_PASSWORD,
      },
    },
    from: envVars.EMAIL_FROM,
  },
};