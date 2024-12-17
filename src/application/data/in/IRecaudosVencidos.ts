export interface IRecaudosVencidos {
    id_lote: number;
    fecha_vencimiento_lote: Date;
}

export interface IRecaudosResponse {
    recaudos: IRecaudosVencidos[];
}
