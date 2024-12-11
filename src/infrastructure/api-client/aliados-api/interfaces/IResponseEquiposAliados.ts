export interface IResponseEquiposAliados {
    isError: boolean;
    data: IEquipo;
    date: string;
}
interface IAtributoOperativo {
    id_atributo: string;
    nombre_atributo: string;
    id_tipo_atributo: number;
    nombre_tipo_atributo: string;
}

interface IAsociacion {
    codigo_tipo_asociacion: number;
    tipo_asociacion: string;
}

interface IEquipo {
    id_equipo: string;
    terminal: string;
    codigo_equipo: string;
    nombre: string;
    id_categoria: number;
    categoria: string;
    activo: boolean;
    especializacion: string | null;
    nombre_especializacion: string | null;
    atributos_operativos: IAtributoOperativo[];
    asociacion: IAsociacion;
}
