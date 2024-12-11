import { IConnectionParameters } from '../models';

export const PG_CONECTION: IConnectionParameters = {
    port: 3306,
    max: 30,
    idleTimeoutMillis: 3000,
    query_timeout: 15000,
    connect_timeout: 3000,
};

export const CLOUD_CONNECTION_PARAMETERS: IConnectionParameters = {
    ...PG_CONECTION,
    port: parseInt(process.env?.POSTGRES_PORT || '5432'),
    host: process.env.POSTGRES_HOST,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASS,
    database: process.env.POSTGRES_DATABASE,
};

export const CM_CONNECTION_PARAMETERS: IConnectionParameters = {
    ...PG_CONECTION,
    port: parseInt(process.env?.CM_PORT || '5432'),
    host: process.env.CM_HOST,
    user: process.env.POSTGRES_USER,
    password: process.env.CM_PASS,
    database: process.env.CM_DATABASE,
};
