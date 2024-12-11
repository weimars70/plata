import { IBolsillosLegalizacion } from '@application/data/out/IBolsillosLegalizacion';
import { IBolsilloDiaALegalizar } from '@application/interfaces/IBolsillosALegalizar';

export interface IConsultarRecaudoResponse {
    fechahora_recaudo: string;
}

export interface IHistoricoResponse {
    codigo_remision: string;
}

export interface IRecaudoResponse {
    id_recaudo: string;
    id_medio_pago: number;
    fecha_hora_recaudo: string;
    valor: number;
    terminal: string;
    id_tipo_recaudo: string;
}

export interface ILegalizacionResponse {
    valor: number;
}

export interface IRecaudoNoVencidoResponse {
    id_bolsillo_dia: string;
    valor: number;
    dias_legalizacion: number;
    fecha_hora: string;
    id_recurso: number;
}

export interface IBolsilloSumaResponse {
    id_recurso: string;
    no_vencido: number;
    vencido: number;
    valor_total: number;
}

export interface ILegalizacionModel {
    bolsillos: IBolsilloDiaALegalizar[];
    idLegalizacion: string;
    valoresBolsillo: IBolsillosLegalizacion;
    idRecurso: number;
}
