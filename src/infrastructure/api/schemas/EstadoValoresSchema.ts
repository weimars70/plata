import Joi from 'joi';
import { messages } from './util';
import { IEstadoValores } from '@application/data/in/IEstadoValores';

export const estadoValoresSchema = Joi.object<IEstadoValores>({
    id_lote: Joi.string().required().messages(messages('id_lote')),
});
