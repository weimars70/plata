import { IPaginador } from '@application/data/out/IPaginador';

export const generarPaginador = (pagina: number, registrosPorPagina: number, totalRegistros: number): IPaginador => ({
    pagina,
    registros_por_pagina: registrosPorPagina,
    total: Number(totalRegistros),
});
