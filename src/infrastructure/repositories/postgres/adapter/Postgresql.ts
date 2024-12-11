import dotenv from 'dotenv';
dotenv.config();
import pgPromise, { IDatabase, IMain } from 'pg-promise';
import { NODE_ENV } from '@util';
import { IConnectionParameters, IDataBase, IEnvironments } from '../models';
import { CLOUD_CONNECTION_PARAMETERS } from './Config';

const getConnectionParameters = (db: string): IConnectionParameters => {
    const DATABASES: IEnvironments<IConnectionParameters> = {
        development: {},
        testing: {},
        production: {},
    };
    const DATABASE = DATABASES[NODE_ENV] || DATABASES.development;
    const CONEXION: IDataBase<IConnectionParameters> = {
        public: { ...CLOUD_CONNECTION_PARAMETERS, ...DATABASE },
    };
    return CONEXION[db];
};

export const pgp: IMain = pgPromise({ schema: 'public' });
pgp.pg.types.setTypeParser(1114, (str) => str);
export const db = pgp(getConnectionParameters('public')) as IDatabase<IMain>;
