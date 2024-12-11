export interface IInconsistenciaDataIn {
    pagina: number;
    registros_por_pagina: number;
    orden_por: string;
    orden_dir: string;
    aliado?: number;
    equipo?: string;
    terminal?: number;
    estado?: string;
    tipo_inconsistencia?: string;
}
