export interface IBolsillosALegalizar {
    restante: number;
    bolsillos: IBolsilloDiaALegalizar[];
}

export interface IBolsilloDiaALegalizar {
    id_bolsillo_dia: string;
    valor: number;
    estado: string;
    valor_inicial_bolsillo: number;
    valor_final_bolsillo: number;
}

export interface IBolsilloInconsistencia {
    id_bolsillo_dia?: string;
    equipo: string;
    valor_inicio?: number;
    valor_final?: number;
    fecha: Date;
}
