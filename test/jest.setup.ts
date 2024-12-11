import { createDependencyContainer, DEPENDENCY_CONTAINER, TYPES } from '@configuration';
import got from 'got';
import { IDatabase, IMain } from 'pg-promise';
//import redis from 'redis-mock';
import 'reflect-metadata';
import { createDependencyContainerTest, DEPENDENCY_CONTAINER_TEST } from './mocks';
import { DBDinerosMem } from './mocks/postgresql';
import MockFirebase from 'mock-cloud-firestore';

jest.mock('got');
export const mockApiGot = got as jest.MockedFunction<typeof got>;
export const MockFirestore = new MockFirebase();

beforeAll(() => {
    createDependencyContainer();
    createDependencyContainerTest();
    const dbDineros = DBDinerosMem();

    // Databases
    DEPENDENCY_CONTAINER.rebind<IDatabase<IMain>>(TYPES.Pg).toConstantValue(dbDineros);

    /* Repositories Fake
    DEPENDENCY_CONTAINER.rebind<IEmailService>(TYPES.EmailService).toConstantValue(new FakeEmailService());
    DEPENDENCY_CONTAINER.rebind<IPubSubRepository>(TYPES.PubsubRepository).toConstantValue(new FakePublicador());

    //REDIS
    const redisMock = redis.createClient();
    DEPENDENCY_CONTAINER.rebind(TYPES.RedisClient).toConstantValue(redisMock);*/
});

afterAll(() => {
    if (DEPENDENCY_CONTAINER) {
        DEPENDENCY_CONTAINER.unbindAll();
    }
    if (DEPENDENCY_CONTAINER_TEST) {
        DEPENDENCY_CONTAINER_TEST.unbindAll();
    }
});

afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
    jest.resetAllMocks();
    mockApiGot.mockReset();
    mockApiGot.mockRestore();
});

beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
    mockApiGot.mockReset();
    mockApiGot.mockRestore();
});
