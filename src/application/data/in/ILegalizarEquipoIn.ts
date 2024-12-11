export interface ILegalizarEquipoRecursoIn {
    tipo_operacion: string;
    id_legalizacion: number;
    tipo: number;
    identificador: string;
    valor?: string;
    externo?: boolean;
    aliado?: string;
    recurso_responsable: number;
    fecha_hora: string;
    terminal: number;
}

export interface ITotales {
    valor_total: number;
    valor_vencido: number;
    valor_no_vencido: number;
}

export interface IBolsilloDia {
    id_bolsillo_dia: string;
    valor: number;
    estado: string;
    fecha_hora: string;
}

export enum ETipoOperacion {
    LEGALIZACION = 'legalizacion',
}
