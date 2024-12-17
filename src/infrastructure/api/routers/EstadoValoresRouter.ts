import { IEstadoValores } from '@application/data/in/IEstadoValores';
import { BolsilloAppService } from '@application/services/BolsilloAppService';
import { DEPENDENCY_CONTAINER } from '@configuration';
import { FastifyReply, FastifyRequest } from 'fastify';
import { validateDataPubSub } from '../util';
import { estadoValoresSchema } from '../schemas/EstadoValoresSchema';

export const EstadoValoresRouter = async (req: FastifyRequest, reply: FastifyReply): Promise<FastifyReply | void> => {
    const bolsilloAppService = DEPENDENCY_CONTAINER.get(BolsilloAppService);
    const data = validateDataPubSub<IEstadoValores>(estadoValoresSchema, req.body);
    const response = await bolsilloAppService.actualizarEstadoValores(data);
    return reply.send({ ...response, id: req.id });
};
