import Joi from 'joi';
import { messages } from './util';
import { IEquipo } from '@application/data/in/';

export const equipoSchema = Joi.object<IEquipo>({
    equipo: Joi.string().required().messages(messages('equipo')),
});
