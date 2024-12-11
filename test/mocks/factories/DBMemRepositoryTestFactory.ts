import { injectable } from 'inversify';
import { IDatabase, IMain } from 'pg-promise';
import { DBMemRepositoryTest } from '..';
import { IDBMemRepositoryTestFactory } from '../models';
import { DEPENDENCY_CONTAINER } from '@configuration';

@injectable()
export class DBMemRepositoryTestFactory implements IDBMemRepositoryTestFactory {
    create(typeDB: symbol): DBMemRepositoryTest {
        const db = DEPENDENCY_CONTAINER.get<IDatabase<IMain>>(typeDB);
        return new DBMemRepositoryTest(db);
    }
}
