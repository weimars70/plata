import { DEPENDENCY_CONTAINER, TYPES } from '@configuration';
import { injectable } from 'inversify';
import { IDatabase, IMain } from 'pg-promise';
import { IInconsistenciaDataIn } from '@application/data/in/IInconsistenciaDataIn';
import { IInconsistenciaFaltanteNombre, IInconsistenciaResponse } from './interfaces/IInconsistenciaResponse';
import { ILegalizacionModel } from './interfaces/IConsultarRecaudoResponse';
import { IInconsistenciaCalculoResponse } from '@application/data/out';
import { DataBaseError } from '@domain/exceptions';
@injectable()
export class InconsistenciaDao {
    private db = DEPENDENCY_CONTAINER.get<IDatabase<IMain>>(TYPES.Pg);

    public async getInconsistencias(
        idRecurso: IInconsistenciaDataIn,
        idEquipo: number,
    ): Promise<IInconsistenciaResponse[] | null> {
        try {
            const query = this.construirQueryGetInconsistencias(idRecurso);
            const result = await this.db.manyOrNone<IInconsistenciaResponse>(query, [
                idRecurso.aliado ?? idEquipo,
                (idRecurso.pagina - 1) * idRecurso.registros_por_pagina,
                idRecurso.registros_por_pagina,
                idRecurso.estado,
                idRecurso.tipo_inconsistencia,
            ]);
            return result;
        } catch (error) {
            console.error('Error en la consulta getInconsistencias:', error);
            return null;
        }
    }

    private construirQueryGetInconsistencias(idRecurso: IInconsistenciaDataIn): string {
        let query = `
            select i.id_inconsistencia, i.fecha_hora,i.valor, i.estado, i.tipo_inconsistencia, i.observaciones
            from inconsistencias i
            WHERE i.ID_RECURSO IS NOT NULL
            AND ${idRecurso.aliado ? 'i.RECURSO_RESPONSABLE' : 'i.id_recurso'} = $1
        `;

        query += this.agregarFiltroEstado(idRecurso.estado);
        query += this.agregarFiltroTipoInconsistencia(idRecurso.tipo_inconsistencia);
        query += this.agregarOrdenamiento(idRecurso.orden_por, idRecurso.orden_dir);
        query += ` OFFSET $2 LIMIT $3`;

        return query;
    }

    private agregarFiltroEstado(estado: string | undefined): string {
        return estado ? ` AND i.estado = $4` : '';
    }

    private agregarFiltroTipoInconsistencia(tipoInconsistencia: string | undefined): string {
        return tipoInconsistencia ? ` AND i.tipo_inconsistencia = $5` : '';
    }

    private agregarOrdenamiento(ordenPor: string | undefined, ordenDir: string | undefined): string {
        return ordenPor && ordenDir ? ` ORDER BY ${ordenPor} ${ordenDir}` : '';
    }

    public async getRecursosInconsistenciaSobrante(
        inconsistencias: IInconsistenciaResponse[],
    ): Promise<IInconsistenciaFaltanteNombre[]> {
        try {
            const query = `
                select i.id_inconsistencia, i.observaciones, r.IDENTIFICADOR_RECURSO equipo, r2.IDENTIFICADOR_RECURSO encargado
                from inconsistencias i inner join legalizaciones l on i.id_legalizacion = l.id_legalizacion
                left join recursos r on r.id_recurso = i.id_recurso
                left join traslados t on l.ID_TRASLADO = t.id_traslado
                left join recursos_trasacciones_traslados rt on t.id_traslado = rt.id_traslado
                left join recursos r2 on r2.id_recurso = rt.id_recurso
                WHERE i.id_inconsistencia IN ($1:csv);
            `;
            const result = await this.db.manyOrNone<IInconsistenciaFaltanteNombre>(query, [
                inconsistencias.map((i) => i.id_inconsistencia),
            ]);
            return result;
        } catch (error) {
            console.error('Error en la consulta getRecursosInconsistenciaSobrante:', error);
            return [];
        }
    }

    public async getRecursosInconsistenciasFaltantes(
        inconsistencia: IInconsistenciaResponse[],
    ): Promise<IInconsistenciaFaltanteNombre[]> {
        try {
            const query = `SELECT i.id_inconsistencia,
       ci.nombre observaciones,
       r2.IDENTIFICADOR_RECURSO equipo,
       r.IDENTIFICADOR_RECURSO encargado
        FROM inconsistencias i
                LEFT JOIN recursos_inconsistencias ri ON i.id_inconsistencia = ri.id_inconsistencia
                LEFT JOIN recursos r ON ri.id_recurso = r.id_recurso
                LEFT JOIN recursos r2 ON i.id_recurso = r2.id_recurso
                LEFT JOIN  maestros.causales_inconsistencias ci ON i.id_causal = ci.id
        WHERE i.id_inconsistencia IN ($1:csv)`;
            const result = await this.db.manyOrNone<IInconsistenciaFaltanteNombre>(query, [
                inconsistencia.map((i) => i.id_inconsistencia),
            ]);
            return result;
        } catch (error) {
            console.error('Error en la consulta getRecursosInconsistenciasFaltantes:', error);
            return [];
        }
    }

    async getInconsistenciasCount(idRecurso: IInconsistenciaDataIn, idEquipo: number): Promise<number> {
        try {
            let query = `
                SELECT COUNT(*)
                FROM inconsistencias
                WHERE ID_RECURSO IS NOT NULL
                AND ${idRecurso.aliado ? 'RECURSO_RESPONSABLE' : 'id_recurso'} = $1
            `;

            if (idRecurso.estado) {
                query += ` AND estado = $2`;
            }

            if (idRecurso.tipo_inconsistencia) {
                query += ` AND tipo_inconsistencia = $3`;
            }

            const result = await this.db.one<{ count: number }>(query, [
                idRecurso.aliado ?? idEquipo,
                idRecurso.estado,
                idRecurso.tipo_inconsistencia,
            ]);
            return result.count;
        } catch (error) {
            console.error('Error en la consulta getInconsistenciasCount:', error);
            return 0;
        }
    }

    async legalizarBolsillo(data: ILegalizacionModel, operacion: string) {
        const t = await this.db.tx(async (transaction) => {
            try {
                for (const bolsillo of data.bolsillos) {
                    if (operacion === 'legalizacion') {
                        await transaction.query(
                            `INSERT INTO legalizacion_bolsillo (id_bolsillo, id_legalizacion, valor, valor_inicial_bolsillo, valor_final_bolsillo)
                            VALUES ($1, $2, $3, $4, $5)`,
                            [
                                bolsillo.id_bolsillo_dia,
                                data.idLegalizacion,
                                bolsillo.valor,
                                bolsillo.valor_inicial_bolsillo,
                                bolsillo.valor_final_bolsillo,
                            ],
                        );
                    } else if (operacion === 'Sobrante') {
                        await transaction.query(
                            `INSERT INTO inconsistencia_bolsillo (id_bolsillo, id_inconsistencia, valor)
                            VALUES ($1, $2, $3)`,
                            [bolsillo.id_bolsillo_dia, data.idLegalizacion, bolsillo.valor],
                        );
                    } else if (operacion === 'Faltante') {
                        await transaction.query(
                            `INSERT INTO faltante_bolsillo (id_bolsillo, id_inconsistencia_faltante, valor)
                            VALUES ($1, $2, $3)`,
                            [bolsillo.id_bolsillo_dia, data.idLegalizacion, bolsillo.valor],
                        );
                    }
                    await transaction.query(`UPDATE bolsillo_dia SET valor = valor - $1 where id_bolsillo_dia = $2`, [
                        bolsillo.valor,
                        bolsillo.id_bolsillo_dia,
                    ]);
                }
                await transaction.query(
                    `update bolsillo set valor_vencido = valor_vencido - $1, valor_no_vencido = valor_no_vencido - $2 , valor_total = valor_total - $3 where id_recurso = $4`,
                    [
                        data.valoresBolsillo.vencidos,
                        data.valoresBolsillo.noVencidos,
                        data.valoresBolsillo.vencidos + data.valoresBolsillo.noVencidos,
                        data.idRecurso,
                    ],
                );
            } catch (error) {
                console.error('Error en la transaccion legalizarBolsillo:', error);
                return null;
            }
        });
        return t;
    }

    async getInconsistencia(
        id_responsable: number,
        tipo_inconsistencia: string,
        aliado?: string,
    ): Promise<IInconsistenciaCalculoResponse | null> {
        try {
            const query = `select recurso_responsable,
            sum(valor) as saldo_favor,
            count(*) as total
            from inconsistencias i
            where ${aliado ? 'recurso_responsable' : 'id_recurso'} = $1
            and estado = 'abierta'
            and tipo_inconsistencia = $2
            group by recurso_responsable`;
            const response = await this.db.oneOrNone<IInconsistenciaCalculoResponse | null>(query, [
                aliado ?? id_responsable,
                tipo_inconsistencia,
            ]);
            return response;
        } catch (error: any) {
            console.error('Error obteniendo el inconsistencia del equipo', error);
            throw new DataBaseError('Error obteniendo el inconsistencia del equipo: ' + id_responsable, error.message);
        }
    }

    async getLegalizacion(id_responsable: number): Promise<boolean> {
        try {
            const query = `SELECT FECHA_HORA_LEGALIZACION, valor
                    FROM legalizaciones
                    WHERE recurso = $1 AND
                    fecha_hora_legalizacion::timestamptz >= NOW() - INTERVAL '30 days'
                    order by 1 desc;`;
            const response = await this.db.manyOrNone<{ exists: boolean }>(query, [id_responsable]);
            return response.length > 0;
        } catch (error: any) {
            console.error('Error obteniendo la legalizacion del equipo', error);
            throw new DataBaseError('Error obteniendo la legalizacion del equipo: ' + id_responsable, error.message);
        }
    }

    async getReintentos(id_transaccion: number): Promise<{ id_legalizacion: number; reintentos: number }> {
        try {
            const query = `SELECT L.id_legalizacion, l.reintentos
                FROM transacciones t JOIN legalizaciones l
                    ON t.id_movimiento::integer = l.id_legalizacion
                WHERE ID_TRANSACCION = $1;`;
            return await this.db.one<{ id_legalizacion: number; reintentos: number }>(query, [id_transaccion]);
        } catch (error: any) {
            console.error('Error obteniendo los reintentos', error);
            throw new DataBaseError('Error obteniendo los reintentos: ' + id_transaccion, error.message);
        }
    }

    async updateReintentos(id_legalizacion: number): Promise<void> {
        try {
            await this.db.query(
                `UPDATE legalizaciones SET reintentos = reintentos + 1, set estado = 7 WHERE id_legalizacion = $1`,
                [id_legalizacion],
            );
        } catch (error: any) {
            console.error('Error actualizando los reintentos ', error);
            throw new DataBaseError('Error actualizando los reintentos: ' + id_legalizacion, error.message);
        }
    }
}
