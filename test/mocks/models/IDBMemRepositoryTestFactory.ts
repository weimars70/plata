import { DBMemRepositoryTest } from '..';

export interface IDBMemRepositoryTestFactory {
    create(typeDB: symbol): DBMemRepositoryTest;
}
