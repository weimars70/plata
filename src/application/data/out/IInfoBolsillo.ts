export interface INoBolsilloResponse {
    bolsillo: boolean;
    message: string;
}

export interface IBolsilloCalculoResponse {
    bolsillo: boolean;
    id_responsable: number;
    valor_total: number;
    valor_no_vencido: number;
    valor_vencido: number;
    saldo_favor_inconsistencias: number;
    total_inconsistencias: number;
    legalizacion: boolean;
}

export interface IBolsilloCalculoResponseDB {
    bolsillo: boolean;
    id_responsable: number;
    valor_total: number;
    valor_no_vencido: number;
    valor_vencido: number;
}
