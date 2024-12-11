import Joi from 'joi';
import { messages } from './util';
import { IInconsistenciaDataIn } from '@application/data/in/IInconsistenciaDataIn';

export const getInconsistenciaSchema = Joi.object<IInconsistenciaDataIn>({
    pagina: Joi.number().positive().required().messages(messages('Página')),
    registros_por_pagina: Joi.number().positive().required().messages(messages('Registros por página')),
    orden_por: Joi.string().required().valid('fecha_hora').messages(messages('Orden por')),
    orden_dir: Joi.string().required().valid('asc', 'desc').messages(messages('Orden dirección')),
    aliado: Joi.number().positive().optional().messages(messages('Aliado')),
    equipo: Joi.string().optional().messages(messages('Equipo')),
    terminal: Joi.number().positive().optional().messages(messages('Terminal')),
    estado: Joi.string().valid('solucionada', 'abierta').optional().messages(messages('Estado')),
    tipo_inconsistencia: Joi.string()
        .valid('sobrante', 'faltante')
        .optional()
        .messages(messages('Tipo de inconsistencia')),
});
