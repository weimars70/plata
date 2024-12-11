import Joi from 'joi';
import { messages } from './util';
import { IVencido } from '@application/data/in/';

export const vencidoSchema = Joi.object<IVencido>({
    vencido: Joi.boolean().required().messages(messages('vencido')),
});
