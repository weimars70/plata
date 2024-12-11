import { Container } from 'inversify';
import { DBMemRepositoryTest } from '../repositories';
import { IDBMemRepositoryTestFactory } from '../models';
import { DBMemRepositoryTestFactory } from '../factories';
import { TypesTest } from './TypesTest';

export const DEPENDENCY_CONTAINER_TEST = new Container();

export const createDependencyContainerTest = (): void => {
    DEPENDENCY_CONTAINER_TEST.bind(DBMemRepositoryTest).toSelf().inRequestScope();
    DEPENDENCY_CONTAINER_TEST.bind<IDBMemRepositoryTestFactory>(TypesTest.DBMemRepositoryTestFactory)
        .to(DBMemRepositoryTestFactory)
        .inSingletonScope();
};
