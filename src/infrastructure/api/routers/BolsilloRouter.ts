import { IBolsillo, IConsultaBolsillo, IEquipo, IErrorPitagoras, IVencido } from '@application/data/in';
import { BolsilloAppService } from '@application/services/BolsilloAppService';
import { DEPENDENCY_CONTAINER } from '@configuration';
import { FastifyReply, FastifyRequest } from 'fastify';
import { equipoSchema } from '../schemas/EquipoSchema';
import { vencidoSchema } from '../schemas/VencidoSchema';
import { validateData, validateDataPubSub } from '../util';
import { crearBolsilloSchema } from './../schemas/CrearBolsilloSchema';
import { errorPitagorasSchema } from '../schemas/ErrorPitagorasSchema';

export const BolsilloRouter = async (req: FastifyRequest, reply: FastifyReply): Promise<FastifyReply | void> => {
    const bolsilloAppService = DEPENDENCY_CONTAINER.get(BolsilloAppService);
    const data = validateDataPubSub<IBolsillo>(crearBolsilloSchema, req.body);
    if (data.operacion === 'recaudo') {
        const response = await bolsilloAppService.recaudoCalcularBolsillo(data);
        if (response.isError) {
            return reply.code(400).send({ ...response, id: req.id });
        }
        return reply.send({ ...response, id: req.id });
    }
    const response = await bolsilloAppService.calcularDinerosLegalizacion(data);
    return reply.send({ ...response, id: req.id });
};
export const VencidosRouter = async (req: FastifyRequest, reply: FastifyReply): Promise<FastifyReply | void> => {
    const bolsilloAppService = DEPENDENCY_CONTAINER.get(BolsilloAppService);
    const response = await bolsilloAppService.calcularVencidos();
    return reply.send({ ...response, id: req.id });
};

export const CalcularBolslloRouter = async (req: FastifyRequest, reply: FastifyReply): Promise<FastifyReply | void> => {
    const bolsilloAppService = DEPENDENCY_CONTAINER.get(BolsilloAppService);
    const response = await bolsilloAppService.calcularBolsillo();
    if (response.isError && response.data?.includes('Los bolsillos para el recurso')) {
        return reply.code(409).send({ ...response, id: req.id });
    }
    return reply.send({ ...response, id: req.id });
};

export const InfoBolsilloRouter = async (req: FastifyRequest, reply: FastifyReply): Promise<FastifyReply | void> => {
    const bolsilloAppService = DEPENDENCY_CONTAINER.get(BolsilloAppService);
    const response = await bolsilloAppService.consultarBolsillo(req.query as IConsultaBolsillo);
    return reply.send({ ...response, id: req.id });
};

export const InfoBolsilloVencidoRouter = async (
    req: FastifyRequest,
    reply: FastifyReply,
): Promise<FastifyReply | void> => {
    const bolsilloAppService = DEPENDENCY_CONTAINER.get(BolsilloAppService);
    const dataEquipo = validateData<IEquipo>(equipoSchema, req.params);
    const dataVencido = validateData<IVencido>(vencidoSchema, req.query);
    const response = await bolsilloAppService.consultarVencido(dataEquipo, dataVencido);
    return reply.send({ ...response, id: req.id });
};

export const ErrorConfirmacionBolsilloRouter = async (
    req: FastifyRequest,
    reply: FastifyReply,
): Promise<FastifyReply | void> => {
    const bolsilloAppService = DEPENDENCY_CONTAINER.get(BolsilloAppService);
    const dataError = validateDataPubSub<IErrorPitagoras>(errorPitagorasSchema, req.params);
    const response = await bolsilloAppService.errorConfirmacionBolsillo(dataError);
    return reply.send({ ...response, id: req.id });
}
