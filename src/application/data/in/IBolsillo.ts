export interface IBolsillo {
    operacion: string;
    id_transaccion: number;
}

export interface Recurso {
    tipo: number;
    valor: string;
    detalle?: number;
}

export interface ICrearBolsillo {
    bolsilloDia: boolean;
    diasLegalizacion: number;
    idEquipo: number;
    valorRecaudo: number;
    aliadoEquipo: number | null;
    date: string;
    idMovimiento: string;
}

export interface IConsultaBolsillo {
    recurso?: string;
    tipo_recurso?: number;
    aliado?: string;
}

export interface IErrorPitagoras {
    id_transaccion: number;
}
