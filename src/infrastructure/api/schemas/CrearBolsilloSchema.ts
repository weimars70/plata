import Joi from 'joi';
import { messages } from './util';
import { IBolsillo } from '@application/data/in/IBolsillo';

export const crearBolsilloSchema = Joi.object<IBolsillo>({
    operacion: Joi.string().required().messages(messages('operacion')),
    id_transaccion: Joi.number().required().messages(messages('id_transaccion')),
});
