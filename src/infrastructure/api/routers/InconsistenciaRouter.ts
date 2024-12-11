import { DEPENDENCY_CONTAINER } from '@configuration';
import { FastifyRequest, FastifyReply } from 'fastify';
import { validateData } from '../util';
import { InconsistenciaAppService } from '@application/services';
import { IInconsistenciaDataIn } from '@application/data/in/IInconsistenciaDataIn';
import { getInconsistenciaSchema } from '../schemas/GetInconsistenciaSchema';
import { BadRequestException } from '@domain/exceptions';

export const getInconsistencia = async (req: FastifyRequest, reply: FastifyReply): Promise<FastifyReply | void> => {
    const bolsilloAppService = DEPENDENCY_CONTAINER.get(InconsistenciaAppService);
    const data = validateData<IInconsistenciaDataIn>(getInconsistenciaSchema, req.query);
    if (data.terminal && !data.equipo) throw new BadRequestException('El equipo es requerido si se envia la terminal');
    if (data.equipo && !data.terminal) throw new BadRequestException('La terminal es requerida si se envia el equipo');
    if (data.aliado && data.equipo) throw new BadRequestException('No se puede enviar aliado y equipo al mismo tiempo');
    if (!data.aliado && !data.terminal && !data.aliado) throw new BadRequestException('Debe enviar al menos un filtro');
    const response = await bolsilloAppService.getInconsistencia(data);
    return reply.send({ ...response, id: req.id });
};
