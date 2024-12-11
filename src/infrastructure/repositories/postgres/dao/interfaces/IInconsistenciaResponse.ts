export interface IInconsistenciaResponse {
    id_inconsistencia: number;
    equipo: string;
    tipo_inconsistencia: string;
    encargado: number;
    fecha_hora: string;
    valor: string;
    estado: string;
    observaciones: string | null;
    nombre_encargado?: string;
    nombre_equipo?: string;
}

export interface IInconsistenciaFaltanteNombre {
    id_inconsistencia: number;
    observaciones: string;
    equipo: string;
    encargado: number;
}
