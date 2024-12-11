import { IMemoryDb } from 'pg-mem';

export const TABLAS_DINEROS = {
    generarTablaBolsilloDia: (db: IMemoryDb) => {
        db.public.none(`CREATE TABLE public.bolsillo_dia (
            id_bolsillo_dia varchar(100) NOT NULL,
            id_recurso int4 NOT NULL,
            tipo_recurso int4 NOT NULL,
            fecha_hora DATE NOT NULL,
            valor numeric NOT NULL,
            estado varchar(50) DEFAULT 'vigente'::character varying NOT NULL,
            dias_legalizacion numeric NOT NULL,
            CONSTRAINT check_valor_boldia CHECK ((valor >= (0)::numeric)),
            CONSTRAINT ck_estado_bolsillo_dia CHECK (((estado)::text = ANY (ARRAY[('vigente'::character varying)::text, ('vencido'::character varying)::text, ('limite'::character varying)::text]))),
            CONSTRAINT pk_bolsillo_dia PRIMARY KEY (id_bolsillo_dia),
            CONSTRAINT fk_bolsillo_dia_relations_recursos FOREIGN KEY (id_recurso) REFERENCES public.recursos(id_recurso)
        );`);
    },
    generarTablaRecursos: (db: IMemoryDb) => {
        db.public.none(`CREATE TABLE public.recursos (
            id_recurso serial NOT NULL,
            id_tipo_recurso int4 NOT NULL,
            identificador_recurso varchar(100) NOT NULL,
            CONSTRAINT pk_recursos PRIMARY KEY (id_recurso),
            CONSTRAINT uq_tip_iden UNIQUE (identificador_recurso, id_tipo_recurso),
            CONSTRAINT fk_recursos_id_tipo_recurso FOREIGN KEY (id_tipo_recurso) REFERENCES public.tipos_recursos(id_tipo_recurso)
        );`);
    },
    generarTablaTiposRecursos: (db: IMemoryDb) => {
        db.public.none(`CREATE TABLE public.tipos_recursos (
            id_tipo_recurso serial NOT NULL,
            descripcion_recursos varchar(100) NOT NULL,
            informacion_adicional bool DEFAULT false NULL,
            CONSTRAINT pk_tipos_recursos PRIMARY KEY (id_tipo_recurso)
        );`);
    },
    generarTablaBolsillo: (db: IMemoryDb) => {
        db.public.none(`CREATE TABLE public.bolsillo (
            id_bolsillo serial NOT NULL,
            id_recurso int4 NOT NULL,
            valor_total numeric NOT NULL,
            valor_vencido numeric NOT NULL,
            valor_no_vencido numeric NOT NULL,
            dias_legalizacion numeric NOT NULL,
            id_responsable int4 NOT NULL,
            CONSTRAINT check_valor_boldia_noven CHECK ((valor_no_vencido >= (0)::numeric)),
            CONSTRAINT check_valor_boldia_total CHECK ((valor_total >= (0)::numeric)),
            CONSTRAINT check_valor_boldia_venc CHECK ((valor_vencido >= (0)::numeric)),
            CONSTRAINT pk_bolsillo PRIMARY KEY (id_bolsillo),
            CONSTRAINT fk_bolsillo_relations_recursos FOREIGN KEY (id_recurso) REFERENCES public.recursos(id_recurso)
        );`);
    },
    generarTablaInconsistencia: (db: IMemoryDb) => {
        db.public.none(`
        CREATE TABLE public.inconsistencias (
            id_inconsistencia serial NOT NULL,
            id_recurso int4 NOT NULL,
            tipo_inconsistencia varchar(50) NOT NULL,
            recurso_responsable int4 NULL,
            fecha_hora timestamp NOT NULL,
            valor numeric NOT NULL,
            estado varchar(50) NOT NULL,
            fecha_solucion timestamp NULL,
            id_legalizacion numeric NULL,
            observaciones varchar(200) NULL,
            id_causal int4 NULL,
            CONSTRAINT pk_inconsistencias PRIMARY KEY (id_inconsistencia)
        );

        ALTER TABLE public.inconsistencias ADD CONSTRAINT fk_inconsistencias_relations_recursos FOREIGN KEY (id_recurso) REFERENCES public.recursos(id_recurso);
        ALTER TABLE public.inconsistencias ADD CONSTRAINT inconsistencias_causales_inconsistencias_fk FOREIGN KEY (id_causal) REFERENCES maestros.causales_inconsistencias(id);
    `);
    },
    generarTablaLegalizaciones: (db: IMemoryDb) => {
        db.public.none(`CREATE TABLE public.legalizaciones (
            id_legalizacion serial NOT NULL,
            id_recibo int4 NULL,
            id_traslado varchar NOT NULL,
            fecha_hora_legalizacion timestamp NOT NULL,
            numero_aprobacion numeric NULL,
            fecha_aprobacion timestamp NULL,
            valor int8 DEFAULT 0 NOT NULL,
            recurso int8 DEFAULT 11 NOT NULL,
            CONSTRAINT pk_legalizaciones PRIMARY KEY (id_legalizacion),
            CONSTRAINT fk_legaliza_relations_recibos_ FOREIGN KEY (id_recibo) REFERENCES public.recibos_caja(id_recibo),
            CONSTRAINT fk_legaliza_relations_traslado FOREIGN KEY (id_traslado) REFERENCES public.traslados(id_traslado)
        );`);
    },

    generarReciboCaja: (db: IMemoryDb) => {
        db.public.none(`CREATE TABLE public.recibos_caja (
            id_recibo serial NOT NULL,
            fecha_recibo timestamp NOT NULL,
            estado_recibo numeric NOT NULL,
            descripcion_recibo varchar(100) NOT NULL,
            terminal_recibo numeric NOT NULL,
            CONSTRAINT pk_recibos_caja PRIMARY KEY (id_recibo)
        );`);
    },

    generarTablaTraslados: (db: IMemoryDb) => {
        db.public.none(`CREATE TABLE public.traslados (
            id_traslado varchar DEFAULT nextval('traslados_id_traslado_seq'::regclass) NOT NULL,
            recurso_destino int4 NOT NULL,
            fecha_hora_traslado timestamp NOT NULL,
            valor numeric NOT NULL,
            estado numeric NULL,
            tenencia varchar(200) NULL,
            soporte varchar(200) DEFAULT NULL::character varying NULL,
            medio_pago text NULL,
            terminal int8 DEFAULT 1 NOT NULL,
            CONSTRAINT pk_traslados PRIMARY KEY (id_traslado),
            CONSTRAINT fk_traslado_relations_recursos_des FOREIGN KEY (recurso_destino) REFERENCES public.recursos(id_recurso)
        );`);
    },

    generarSecuenciaTraslados: (db: IMemoryDb) => {
        db.public.none(`CREATE SEQUENCE public.traslados_id_traslado_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 9223372036854775807
	START 1
	CACHE 1
	NO CYCLE;`);
    },

    generarTablaRecursoTransaccionesTraslado: (db: IMemoryDb) => {
        db.public.none(`
            CREATE TABLE public.recursos_trasacciones_traslados (
            id_recurso_traslado int4 DEFAULT nextval('traslados_id_traslado_seq'::regclass) NOT NULL,
            id_recurso int4 NOT NULL,
            id_traslado varchar NOT NULL,
            CONSTRAINT recursos_trasacciones_traslados_pkey PRIMARY KEY (id_recurso_traslado),
            CONSTRAINT fk_recursos_relations_trans FOREIGN KEY (id_traslado) REFERENCES public.traslados(id_traslado),
            CONSTRAINT fk_recursos_relations_traslado FOREIGN KEY (id_recurso) REFERENCES public.recursos(id_recurso)
        );`);
    },

    generarTablaRecaudoBolsillo: (db: IMemoryDb) => {
        db.public.none(`
            CREATE TABLE public.recaudo_bolsillo (
            id_bolsillo varchar(100) NOT NULL,
            id_recaudo varchar(100) NOT NULL,
            valor numeric NOT NULL,
            CONSTRAINT pk_recaudo_bol PRIMARY KEY (id_bolsillo, id_recaudo),
            CONSTRAINT fk_recaudo_bol_relations_bolsillo FOREIGN KEY (id_bolsillo) REFERENCES public.bolsillo_dia(id_bolsillo_dia),
            CONSTRAINT fk_recaudo_bol_relations_recaudo FOREIGN KEY (id_recaudo) REFERENCES public.recaudos(id_recaudo)
        );`);
    },

    generarTablaInconsistenciaBolsillo: (db: IMemoryDb) => {
        db.public.none(`
            CREATE TABLE public.inconsistencia_bolsillo (
            id_bolsillo varchar(100) NOT NULL,
            id_inconsistencia int4 NOT NULL,
            valor numeric NOT NULL,
            CONSTRAINT pk_inconsistencia_bol PRIMARY KEY (id_bolsillo, id_inconsistencia),
            CONSTRAINT fk_inconsistencia_bol_relations_bolsillo FOREIGN KEY (id_bolsillo) REFERENCES public.bolsillo_dia(id_bolsillo_dia),
            CONSTRAINT fk_inconsistencia_bol_relations_inconsistencia FOREIGN KEY (id_inconsistencia) REFERENCES public.inconsistencias(id_inconsistencia)
        );`);
    },

    generarTablaTransacciones: (db: IMemoryDb) => {
        db.public.none(`
            CREATE TABLE public.transacciones (
            id_transaccion serial NOT NULL,
            id_tipo_transaccion int4 NOT NULL,
            valor_transaccion numeric NOT NULL,
            fecha_hora_transaccion timestamp NOT NULL,
            ingreso_dinero bool NOT NULL,
            id_movimiento varchar(100) NULL,
            id_recurso int4 NULL,
            CONSTRAINT pk_transacciones PRIMARY KEY (id_transaccion),
            CONSTRAINT fk_transacc_relations_tipos_tr FOREIGN KEY (id_tipo_transaccion) REFERENCES public.tipos_transacciones(id_tipo_transaccion),
            CONSTRAINT fk_transacciones_relations_recursos FOREIGN KEY (id_recurso) REFERENCES public.recursos(id_recurso)
        );`);
    },

    generarTablaTiposTransacciones: (db: IMemoryDb) => {
        db.public.none(`
            CREATE TABLE public.tipos_transacciones (
            id_tipo_transaccion serial NOT NULL,
            descripcion_transaccion varchar(50) NOT NULL,
            CONSTRAINT pk_tipos_transacciones PRIMARY KEY (id_tipo_transaccion)
        );`);
    },

    generarTablaRecaudos: (db: IMemoryDb) => {
        db.public.none(`
            CREATE TABLE public.recaudos (
            id_recaudo varchar(100) NOT NULL,
            id_medio_pago int4 NOT NULL,
            fecha_hora_recaudo timestamp NOT NULL,
            valor numeric NOT NULL,
            terminal numeric NOT NULL,
            id_tipo_recaudo varchar(10) NULL,
            CONSTRAINT pk_recaudos PRIMARY KEY (id_recaudo),
            CONSTRAINT fk_recaudos_id_tipo_recaudo FOREIGN KEY (id_tipo_recaudo) REFERENCES public.tipos_recaudos(id_tipo_recaudo),
            CONSTRAINT fk_recaudos_relations_medios_p FOREIGN KEY (id_medio_pago) REFERENCES public.medios_pagos(id_medio_pago)
        );`);
    },

    generarTablaTiposRecaudos: (db: IMemoryDb) => {
        db.public.none(`
            CREATE TABLE public.tipos_recaudos (
            id_tipo_recaudo varchar(10) NOT NULL,
            descripcion_recaudo varchar(40) NOT NULL,
            CONSTRAINT pk_tipos_recaudos PRIMARY KEY (id_tipo_recaudo)
        );`);
    },

    generarTablaMediosPagos: (db: IMemoryDb) => {
        db.public.none(`
            CREATE TABLE public.medios_pagos (
            id_medio_pago int4 NOT NULL,
            descripcion_medio_pago varchar(40) NOT NULL,
            CONSTRAINT pk_medios_pagos PRIMARY KEY (id_medio_pago)
        );`);
    },

    generarTablaAliadosEquipos: (db: IMemoryDb) => {
        db.public.none(`
            CREATE TABLE public.aliados_equipos (
            aliado numeric NOT NULL,
            id_equipo int4 NOT NULL,
            dias_legalizacion numeric NULL,
            CONSTRAINT pk_aliados_equipos PRIMARY KEY (aliado, id_equipo),
            CONSTRAINT fk_aliados_equipos_relations_recursos FOREIGN KEY (id_equipo) REFERENCES public.recursos(id_recurso)
        );`);
    },

    generarTablaFaltanteBolsillo: (db: IMemoryDb) => {
        db.public.none(`
            CREATE TABLE public.faltante_bolsillo (
            id_bolsillo varchar(100) NOT NULL,
            id_inconsistencia_faltante int4 NOT NULL,
            valor numeric NULL,
            CONSTRAINT faltante_bolsillo_pk PRIMARY KEY (id_bolsillo, id_inconsistencia_faltante),
            CONSTRAINT faltante_bolsillo_bolsillo_dia_fk FOREIGN KEY (id_bolsillo) REFERENCES public.bolsillo_dia(id_bolsillo_dia),
            CONSTRAINT faltante_bolsillo_inconsistencias_fk FOREIGN KEY (id_inconsistencia_faltante) REFERENCES public.inconsistencias(id_inconsistencia)
        );`);
    },

    generarTablaRecursosInconsistencias: (db: IMemoryDb) => {
        db.public.none(`
            CREATE TABLE public.recursos_inconsistencias (
            id_recurso int4 NULL,
            id_inconsistencia int4 NULL,
            CONSTRAINT recursos_inconsistencias_pk PRIMARY KEY (id_recurso,id_inconsistencia),
            CONSTRAINT recursos_inconsistencias_recursos_fk FOREIGN KEY (id_recurso) REFERENCES public.recursos(id_recurso),
            CONSTRAINT recursos_inconsistencias_inconsistencias_fk FOREIGN KEY (id_inconsistencia) REFERENCES public.inconsistencias(id_inconsistencia)
        );`);
    },

    generarTablaCausalesInconsistencias: (db: IMemoryDb) => {
        db.public.none(`
            CREATE TABLE maestros.causales_inconsistencias (
            id serial NOT NULL,
            nombre varchar NOT NULL,
            activo bool DEFAULT true NOT NULL,
            fecha_creacion timestamp DEFAULT now() NOT NULL,
            usuario varchar NOT NULL,
            CONSTRAINT causales_inconsistencia_pk PRIMARY KEY (id),
            CONSTRAINT causales_inconsistencia_unique UNIQUE (nombre)
        );`);
    },
};
