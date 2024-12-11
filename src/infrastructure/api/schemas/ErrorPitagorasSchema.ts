import Joi from 'joi';
import { messages } from './util';
import { IErrorPitagoras } from '@application/data/in/';

export const errorPitagorasSchema = Joi.object<IErrorPitagoras>({
    id_transaccion: Joi.number().required().messages(messages('id_transaccion')),
});
