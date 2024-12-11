import { ICrearBolsillo } from '@application/data/in/IBolsillo';
import { ITotales } from '@application/data/in/ILegalizarEquipoIn';
import { IBolsilloCalculoResponse, IBolsilloCalculoResponseDB } from '@application/data/out';
import { DEPENDENCY_CONTAINER, TYPES } from '@configuration';
import { DataBaseError, PostgresError } from '@domain/exceptions';
import { injectable } from 'inversify';
import { IDatabase, IMain } from 'pg-promise';
import { IBolsilloSumaResponse, ILegalizacionResponse, IRecaudoResponse } from './interfaces/IConsultarRecaudoResponse';
@injectable()
export class BolsilloDao {
    private db = DEPENDENCY_CONTAINER.get<IDatabase<IMain>>(TYPES.Pg);

    public async crearTransaccionBolsillo(data: ICrearBolsillo): Promise<void> {
        try {
            const idBolsilloDia = `${data.idEquipo}-${data.date.split('T')[0]}`;
            await this.db.tx(async (t) => {
                if (!data.bolsilloDia) {
                    await t.query(
                        'INSERT INTO bolsillo_dia (id_bolsillo_dia, id_recurso, tipo_recurso, fecha_hora, valor, dias_legalizacion) VALUES ($1, $2, $3, $4, $5, $6)',
                        [idBolsilloDia, data.idEquipo, 1, data.date, data.valorRecaudo, data.diasLegalizacion],
                    );
                } else {
                    await t.query('UPDATE bolsillo_dia SET valor = valor + $1 WHERE id_bolsillo_dia = $2', [
                        data.valorRecaudo,
                        idBolsilloDia,
                    ]);
                }
                const bolsillo = await t.oneOrNone<{ exists: boolean }>(
                    `select true from bolsillo where id_recurso = $1`,
                    [data.idEquipo],
                );
                if (!bolsillo) {
                    await t.query(
                        `
                            INSERT INTO bolsillo
                            (id_recurso, valor_total, valor_vencido, valor_no_vencido, dias_legalizacion, id_responsable)
                            VALUES
                            ($1, $2, $3, $4, $5, $6);
                       `,
                        [
                            data.idEquipo,
                            data.valorRecaudo,
                            0,
                            data.valorRecaudo,
                            data.diasLegalizacion,
                            data.aliadoEquipo ? data.aliadoEquipo : data.idEquipo,
                        ],
                    );
                } else {
                    await t.query(
                        'UPDATE bolsillo SET valor_total = valor_total + $1, valor_no_vencido = valor_no_vencido + $1 WHERE id_recurso = $2',
                        [data.valorRecaudo, data.idEquipo],
                    );
                }
                await t.query(
                    `INSERT INTO recaudo_bolsillo (id_bolsillo, id_recaudo, valor)
                    VALUES ($1, $2, $3)`,
                    [idBolsilloDia, data.idMovimiento, data.valorRecaudo],
                );
            });
        } catch (error: any) {
            console.error('Error en la consulta crearTransaccionBolsillo:', error);
            throw new PostgresError(error.code, error?.data?.error || error.message);
        }
    }

    public async updateBolsillo(valores: IBolsilloSumaResponse): Promise<void> {
        this.db.query(
            'UPDATE bolsillo SET valor_total =  $1, valor_no_vencido = $2, valor_vencido = $3 WHERE id_recurso = $4',
            [valores.valor_total, valores.no_vencido, valores.vencido, valores.id_recurso],
        );
    }

    public async updateBolsilloRecaudo(valores: number, id_recurso: number): Promise<void> {
        try {
            const valorNumerico = Number(valores);
            const idRecursoNumerico = Number(id_recurso);
            await this.db.query(
                'UPDATE bolsillo SET valor_total = valor_total + $1, valor_no_vencido = valor_no_vencido + $1 WHERE id_recurso = $2',
                [valorNumerico, idRecursoNumerico],
            );
        } catch (error) {
            console.error('Error en la consulta updateBolsilloRecaudo:', error);
            throw new Error('Error en la consulta updateBolsilloRecaudo');
        }
    }

    public async getRecaudos(idRecurso: string, fecha: string): Promise<IRecaudoResponse[] | null> {
        try {
            const currentDate = new Date(fecha);
            const startDate = new Date(currentDate.setHours(0, 0, 0, 0));
            const endDate = new Date(currentDate.setHours(23, 59, 59, 999));
            const query = `
                SELECT *
                FROM recaudos
                WHERE ID_RECAUDO IN (
                    SELECT id_recaudo
                    FROM recaudos_recursos
                    WHERE ID_RECURSO = $1
                )
                AND FECHA_HORA_RECAUDO >= $2
                AND FECHA_HORA_RECAUDO <= $3`;

            const results = await this.db.manyOrNone<IRecaudoResponse>(query, [idRecurso, startDate, endDate]);
            return results || [];
        } catch (error) {
            console.error('Error en la consulta getRecaudos:', error);
            return null;
        }
    }

    public async getAliadoEquipo(idRecurso: number): Promise<{ aliado: number } | null> {
        try {
            const query = `
            select aliado from aliados_equipos where ID_EQUIPO =  $1
            `;
            const results = await this.db.oneOrNone<{ aliado: number } | null>(query, [idRecurso]);
            return results;
        } catch (error) {
            console.error('Error en la consulta getAliadoEquipo:', error);
            throw new Error('Error en la consulta getAliadoEquipo');
        }
    }

    public async getLegalizaciones(idRecurso: string, fecha: string): Promise<ILegalizacionResponse | null> {
        try {
            const query = `
            select sum(valor) as valor from legalizacion_bolsillo WHERE ID_BOLSILLO = $1
            `;
            const results = await this.db.oneOrNone<ILegalizacionResponse>(query, [idRecurso + '-' + fecha]);
            return results;
        } catch (error) {
            console.error('Error en la consulta getLegalizaciones:', error);
            return null;
        }
    }

    public async updateBolsilloVencido(idRecurso: number, valor: number): Promise<void> {
        this.db.query(
            'UPDATE bolsillo SET valor_vencido = valor_vencido + $1, valor_no_vencido = valor_no_vencido - $1 WHERE id_recurso = $2',
            [valor, idRecurso],
        );
    }

    public async updateValorTotalBolsillo(idRecurso: string): Promise<void> {
        await this.db.query(
            `UPDATE bolsillo
            SET valor_total = (
                SELECT SUM(valor_vencido + valor_no_vencido)
                FROM bolsillo
                WHERE id_recurso = $1
            )
            WHERE id_recurso = $1`,
            [idRecurso],
        );
    }
    public async getTotalesBolsilloPorRecurso(id_recurso: number): Promise<ITotales | null> {
        try {
            const totales = await this.db.oneOrNone<ITotales>(
                'select valor_total, valor_vencido, valor_no_vencido from bolsillo where id_recurso = $1',
                [id_recurso],
            );
            return totales;
        } catch (error) {
            console.error('Error en la consulta getTotalesBolsilloPorRecurso:', error);
            return null;
        }
    }

    public async createEmptyBolsilloDia(id_recurso: number): Promise<void> {
        try {
            await this.db.query(
                `insert into bolsillo (id_recurso, valor_total, valor_no_vencido, valor_vencido, dias_legalizacion, id_responsable)
                    values ($1, 0, 0, 0, (select COALESCE(MAX(dias_legalizacion), 0) from aliados_equipos where ID_EQUIPO = $1) ,
                    (select COALESCE(MAX(aliado), $1) from aliados_equipos where ID_EQUIPO = $1));`,
                [id_recurso],
            );
        } catch (error) {
            console.error('Error en la consulta createEmptyBolsilloDia:', error);
            throw new Error('Error en la consulta createEmptyBolsilloDia');
        }
    }

    async getBolsilloEquipoAliado(id_responsable: number, aliado?: string): Promise<IBolsilloCalculoResponseDB | null> {
        try {
            const query = `select id_responsable,
            sum(valor_total) as valor_total,
            sum(valor_no_vencido) as valor_no_vencido ,
            sum(valor_vencido)  as valor_vencido
            from bolsillo b
            where ${aliado ? 'id_responsable' : 'id_recurso'} = $1
            group by id_responsable`;
            const response = await this.db.oneOrNone<IBolsilloCalculoResponse | null>(query, [
                aliado ?? id_responsable,
            ]);
            return response;
        } catch (error: any) {
            console.error('Error obteniendo el bolsillo del equipo', error);
            throw new DataBaseError('Error obteniendo el bolsillo del equipo: ' + id_responsable, error.message);
        }
    }
}
