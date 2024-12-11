import { FastifyInstance } from 'fastify';
import {
    BolsilloRouter,
    CalcularBolslloRouter,
    ErrorConfirmacionBolsilloRouter,
    InfoBolsilloRouter,
    InfoBolsilloVencidoRouter,
    VencidosRouter,
} from './BolsilloRouter';
import { getInconsistencia } from './InconsistenciaRouter';

export const initRoutes = async (application: FastifyInstance): Promise<void> => {
    const VERSION = 'v1';
    application.post(`/bolsillo`, BolsilloRouter);
    application.post(`/calcularVencidos`, VencidosRouter);
    application.post(`/${VERSION}/error-confirmacion-bolsillo`, ErrorConfirmacionBolsilloRouter);
    application.get(`/${VERSION}/inconsistencia`, getInconsistencia);
    application.get(`/calcularBolsillo`, CalcularBolslloRouter);
    application.get(`/${VERSION}/bolsillo`, InfoBolsilloRouter);
    application.get(`/${VERSION}/bolsillos/equipos/:equipo`, InfoBolsilloVencidoRouter);
};
