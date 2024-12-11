import Joi from 'joi';
import { messages } from './util';
import { ILegalizarEquipoRecursoIn } from '@application/data/in/ILegalizarEquipoIn';

export const ILegalizarEquiposSchema = Joi.object<ILegalizarEquipoRecursoIn>({
    tipo_operacion: Joi.string().optional().messages(messages('id_transaccion')),
    id_legalizacion: Joi.number().optional().messages(messages('id_legalizacion')),
    recurso_responsable: Joi.string().optional().messages(messages('recurso_responsable')),
    terminal: Joi.number().optional().messages(messages('terminal')),
    identificador: Joi.string().optional().messages(messages('identificador')),
    tipo: Joi.number().optional().messages(messages('tipo')),
    valor: Joi.number().optional().messages(messages('valor')),
    externo: Joi.boolean().optional().messages(messages('externo')),
    aliado: Joi.number().optional().messages(messages('aliado')),
});
