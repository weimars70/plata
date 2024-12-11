import { IMemoryDb } from 'pg-mem';

export const insertarTiposRecursos = (bdmen: IMemoryDb): void => {
    bdmen.public.none(`INSERT INTO public.tipos_recursos
        (id_tipo_recurso,descripcion_recursos,informacion_adicional)
        VALUES
        (1,'Equipo',false),
        (2,'CodigoCm',false),
        (3,'Guia',false),
        (4,'idAprobacion',false),
        (5,'facturaCM',false),
        (6,'CuentaBancaria',false),
        (7,'cajero',false);`);
};

export const insertarRecursos = (bdmen: IMemoryDb): void => {
    bdmen.public.none(`INSERT INTO public.recursos
        (id_tipo_recurso,identificador_recurso)
        VALUES
	    (1,'1234-1'),
        (1, '019165'),
        (1, '3024-1');
        `);
};

export const insertarInconsistencia = (bdmen: IMemoryDb): void => {
    bdmen.public.none(`INSERT INTO inconsistencias
         (id_recurso,tipo_inconsistencia,recurso_responsable,fecha_hora,
         valor,estado,fecha_solucion,id_legalizacion,observaciones)
         VALUES
	     (1,'Sobrante',123,'2024-08-01 12:40:57',2000000,'abierta',NULL,1,'prueba JC legalizacion'),
         (1,'Faltante',123,'2024-10-03 11:00:57',2000000,'abierta',NULL,NULL,NULL);`);
};

export const insertarBolsillo = (bdmen: IMemoryDb): void => {
    bdmen.public.none(`INSERT INTO public.bolsillo
        (id_recurso,valor_total,valor_vencido,valor_no_vencido,dias_legalizacion,id_responsable)
        VALUES
	    (1,3100000,1100000,2000000,0,123);`);
};

export const insertarBolsilloDia = (bdmen: IMemoryDb): void => {
    bdmen.public.none(`INSERT INTO bolsillo_dia
     (id_bolsillo_dia,id_recurso,tipo_recurso,fecha_hora,valor,estado,dias_legalizacion)
     VALUES
	 ('1-2024-07-28',1,1,'2024-07-28 09:08:10',100000,'vencido',5),
	 ('1-2024-07-29',1,1,'2024-07-29 10:00:01',1000000,'vencido',5),
     ('1-2024-07-30',1,1,'2024-07-30 11:34:00',2000000,'vigente',5);
`);
};

export const insertarLegalizacion = (bdmen: IMemoryDb): void => {
    bdmen.public
        .none(`INSERT INTO public.legalizaciones (id_legalizacion, id_recibo, id_traslado, fecha_hora_legalizacion, numero_aprobacion, fecha_aprobacion, valor, recurso) VALUES
        (7662, null, '7807dd08-fb28-4e49-a61e-82244fc86dxc', '2024-08-12 14:39:18.000000', null, null, 50000, 1),
        (7661, null, '7807dd08-fb28-4e49-a61e-82244fc86ccc', '2024-08-01 14:39:18.000000', null, null, 100, 1);
`);
};

export const insertarTraslado = (bdmen: IMemoryDb): void => {
    bdmen.public
        .none(`INSERT INTO public.traslados (id_traslado, recurso_destino, fecha_hora_traslado, valor, estado, tenencia, soporte, medio_pago, terminal)
            VALUES
            ('7807dd08-fb28-4e49-a61e-82244fc86dxc', 2, '2024-08-01 14:39:18.000000', 50000, null, null, null, null, 1),
             ('7807dd08-fb28-4e49-a61e-82244fc86ccc', 2, '2024-08-15 11:39:18.000000', 100, null, null, null, null, 1);
            ;
`);
};

export const insertarRecursoTransaccionesTraslado = (bdmen: IMemoryDb): void => {
    bdmen.public.none(`INSERT INTO public.recursos_trasacciones_traslados
        (id_recurso, id_traslado)
        VALUES
        (1, '7807dd08-fb28-4e49-a61e-82244fc86dxc'),
        (1, '7807dd08-fb28-4e49-a61e-82244fc86ccc');`);
};

export const insertarTransaccion = (bdmen: IMemoryDb): void => {
    bdmen.public.none(
        `INSERT INTO public.transacciones
        (id_transaccion, id_tipo_transaccion, valor_transaccion, fecha_hora_transaccion, ingreso_dinero, id_movimiento, id_recurso)
        VALUES
        (8592, 1, 1000000, '2024-08-21 16:00:12.000000', true, 'prueba217', 3),
        (2, 6, 100000, '2024-10-03 11:00:12.000000', false, '2', 1);`,
    );
};

export const insertarTiposTransacciones = (bdmen: IMemoryDb): void => {
    bdmen.public.none(`INSERT INTO public.tipos_transacciones
        (id_tipo_transaccion,descripcion_transaccion)
        VALUES
        (1,'Recaudo'),
        (4,'Legalizar'),
        (5,'Solucion Inconsistencia'),
        (6,'Inconsistencia Faltante');`);
};

export const insertarRecaudo = (bdmen: IMemoryDb): void => {
    bdmen.public.none(`INSERT INTO public.recaudos
        (id_recaudo, id_medio_pago, fecha_hora_recaudo, valor, terminal, id_tipo_recaudo)
        VALUES
        ('prueba217', 1, '2024-08-21 16:00:12.000000', 1000000, 1, '1-7');`);
};

export const insertarMediosPago = (bdmen: IMemoryDb): void => {
    bdmen.public.none(`INSERT INTO public.medios_pagos
        (id_medio_pago,descripcion_medio_pago)
        VALUES
        (1,'Efectivo'),
        (2,'Cheche local'),
        (3,'Cheche Nacional'),
        (4,'Transferencia electronica'),
        (5,'Tarjeta'),
        (6,'Pendiente pago'),
        (7,'Consig. Directa Efectivo'),
        (8,'Consig. Directa Cheque'),
        (9,'PSE'),
        (10,'Credito');`);
};

export const insertarTiposRecaudos = (bdmen: IMemoryDb): void => {
    bdmen.public.none(`INSERT INTO public.tipos_recaudos
        (id_tipo_recaudo,descripcion_recaudo)
        VALUES
        ('1-6','Flete contra entrega'),
        ('1-3','Flete pago'),
        ('1-7','Flete pago internacional'),
        ('2-22','Recaudo Contra Entrega'),
        ('2-106','Recaudo Contra Entrega AM'),
        ('2-105','Recaudo Contra Entrega Mismo Dia'),
        ('3-1','Servicios publicos');`);
};

export const insertarAliadosEquipos = (bdmen: IMemoryDb): void => {
    bdmen.public.none(`INSERT INTO public.aliados_equipos
        (aliado, id_equipo, dias_legalizacion)
        VALUES
        (244, 3, 0);`);
};
