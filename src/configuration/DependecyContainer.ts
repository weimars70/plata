import { Container } from 'inversify';
import { Firestore } from '@google-cloud/firestore';
import {
    BolsilloDao,
    BolsilloDiaDao,
    db,
    firestore,
    FirestoreBolsilloRepository,
    RecursosDao,
    TransaccionesDao,
} from '@infrastructure/repositories';
import { TYPES } from '@configuration';
import { BolsilloRepository } from '@domain/repository/BolsilloRepository';
import { BolsilloAppService, InconsistenciaAppService } from '@application/services';
import { IDatabase, IMain } from 'pg-promise';
import { InconsistenciaDao } from '@infrastructure/repositories/postgres/dao/InconsistenciaDao';
import { MaestrosApiClient } from '@infrastructure/api-client';
import { RecursosApiClient } from '@infrastructure/api-client/recursos-api';
import { IBolsilloPubSubRepository } from '@infrastructure/pubsub/IBolsilloPubSub';
import { BolsilloPubsub } from '@infrastructure/pubsub/pubsub';
import { pubsub } from '@infrastructure/pubsub/pubsub/config/PubSubConfig';
import { PubSub } from '@google-cloud/pubsub';
import { EstadoValoresDao } from '@infrastructure/repositories/postgres/dao/EstadoValoresDao';

export const DEPENDENCY_CONTAINER = new Container();

export const createDependencyContainer = (): void => {
    DEPENDENCY_CONTAINER.bind<Firestore>(TYPES.Firestore).toConstantValue(firestore);
    DEPENDENCY_CONTAINER.bind(BolsilloDao).toSelf().inSingletonScope();
    DEPENDENCY_CONTAINER.bind(BolsilloDiaDao).toSelf().inSingletonScope();
    DEPENDENCY_CONTAINER.bind(RecursosDao).toSelf().inSingletonScope();
    DEPENDENCY_CONTAINER.bind(TransaccionesDao).toSelf().inSingletonScope();
    DEPENDENCY_CONTAINER.bind(MaestrosApiClient).toSelf().inSingletonScope();
    DEPENDENCY_CONTAINER.bind(RecursosApiClient).toSelf().inSingletonScope();
    DEPENDENCY_CONTAINER.bind(InconsistenciaDao).toSelf().inSingletonScope();
    DEPENDENCY_CONTAINER.bind<IDatabase<IMain>>(TYPES.Pg).toConstantValue(db);
    DEPENDENCY_CONTAINER.bind(BolsilloAppService).toSelf().inSingletonScope();
    DEPENDENCY_CONTAINER.bind<IBolsilloPubSubRepository>(TYPES.PubSubBolsillo).to(BolsilloPubsub).inSingletonScope();
    DEPENDENCY_CONTAINER.bind<PubSub>(TYPES.PubSub).toConstantValue(pubsub);
    DEPENDENCY_CONTAINER.bind(InconsistenciaAppService).toSelf().inSingletonScope();
    DEPENDENCY_CONTAINER.bind<BolsilloRepository>(TYPES.FirestoreBolsilloRepository)
        .to(FirestoreBolsilloRepository)
        .inSingletonScope();
    DEPENDENCY_CONTAINER.bind(EstadoValoresDao).toSelf().inSingletonScope();
};
