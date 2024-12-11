import { IBolsilloDia } from '@application/data/in';
import { DEPENDENCY_CONTAINER, TYPES } from '@configuration';
import { injectable } from 'inversify';
import { IDatabase, IMain } from 'pg-promise';
import { IBolsilloSumaResponse, IRecaudoNoVencidoResponse } from './interfaces/IConsultarRecaudoResponse';
import { IBolsilloDiaVencido } from '@application/data/out';
import { DataBaseError } from '@domain/exceptions';

@injectable()
export class BolsilloDiaDao {
    private db = DEPENDENCY_CONTAINER.get<IDatabase<IMain>>(TYPES.Pg);
    public async getBolsilloDia(idBolsillo: string): Promise<{ id_bolsillo_dia: string; valor: number } | null> {
        try {
            return this.db.oneOrNone<{ id_bolsillo_dia: string; valor: number } | null>(
                'SELECT id_bolsillo_dia, valor FROM bolsillo_dia WHERE id_bolsillo_dia = $1 LIMIT 1',
                idBolsillo,
            );
        } catch (error) {
            console.error('Error en la consulta getBolsilloDia:', error);
            throw new Error('Error en la consulta getBolsilloDia');
        }
    }

    public async crearBolsilloDia(
        id_recurso: number,
        dias_legalizacion: number,
        valor: number,
        fecha: string,
    ): Promise<void> {
        try {
            this.db.query(
                'INSERT INTO bolsillo_dia (id_bolsillo_dia, id_recurso, tipo_recurso, fecha_hora, valor, dias_legalizacion) VALUES ($1, $2, $3, $4, $5, $6)',
                [`${id_recurso}-${fecha.split('T')[0]}`, id_recurso, 1, fecha, valor, dias_legalizacion],
            );
        } catch (error) {
            console.error('Error en la consulta crearBolsilloDia:', error);
            throw new Error('Error en la consulta crearBolsilloDia');
        }
    }

    public async updateBolsilloDia(valor: number, idBolsillo: string): Promise<void> {
        this.db.query('UPDATE bolsillo_dia SET valor = valor + $1 WHERE id_bolsillo_dia = $2', [valor, idBolsillo]);
    }

    public async getBolsillosDia(idRecurso: string): Promise<IBolsilloSumaResponse | null> {
        try {
            const query = `SELECT
            bd.id_recurso,
            SUM(CASE WHEN bd.estado = 'vigente' THEN bd.valor ELSE 0 END) AS no_vencido,
            SUM(CASE WHEN bd.estado = 'vencido' THEN bd.valor ELSE 0 END) AS vencido,
            SUM(bd.valor) AS valor_total
            FROM
                bolsillo_dia bd
            WHERE
                bd.id_recurso = $1
                AND bd.estado IN ('vigente', 'vencido')
            GROUP BY
                bd.id_recurso;`;
            const result = await this.db.oneOrNone<IBolsilloSumaResponse>(query, idRecurso);
            return result || null;
        } catch (error) {
            console.error('Error en la consulta getBolsillosDia:', error);
            return null;
        }
    }

    public async getBolsilloByBolsilloDia(idRecurso: string): Promise<{ no_vencido: number; vencido: number } | null> {
        try {
            const query = `
            SELECT
            SUM(CASE WHEN bd.estado = 'vigente' THEN bd.valor ELSE 0 END) AS no_vencido,
            SUM(CASE WHEN bd.estado = 'vencido' THEN bd.valor ELSE 0 END) AS vencido
            FROM
                bolsillo_dia bd,
            WHERE
                bd.id_recurso = $1
            GROUP BY
                bd.id_recurso;

            `;
            const results = await this.db.oneOrNone<{ no_vencido: number; vencido: number }>(query, [idRecurso]);
            return results;
        } catch (error) {
            console.error('Error en la consulta getLegalizacionesBolsillo:', error);
            return null;
        }
    }

    public async getRecaudosVencidos(): Promise<IRecaudoNoVencidoResponse[] | null> {
        try {
            const query = `
            select id_bolsillo_dia, valor, dias_legalizacion, fecha_hora, id_recurso
            from bolsillo_dia where estado = 'vigente'`;
            const results = await this.db.manyOrNone<IRecaudoNoVencidoResponse>(query);
            return results || [];
        } catch (error) {
            console.error('Error en la consulta getRecaudosVencidos:', error);
            return null;
        }
    }

    public async updateBolsilloDiaVencido(idBolsillo: string, idRecurso: number): Promise<void> {
        try {
            await this.db.tx(async (transaction) => {
                await transaction.query('UPDATE bolsillo_dia SET estado = $1 WHERE id_bolsillo_dia = $2 ', [
                    'vencido',
                    idBolsillo,
                ]);
                const query = `SELECT
                    bd.id_recurso,
                    SUM(CASE WHEN bd.estado = 'vigente' THEN bd.valor ELSE 0 END) AS no_vencido,
                    SUM(CASE WHEN bd.estado = 'vencido' THEN bd.valor ELSE 0 END) AS vencido,
                    SUM(bd.valor) AS valor_total
                    FROM
                        bolsillo_dia bd
                    WHERE
                        bd.id_recurso = $1
                        AND bd.estado IN ('vigente', 'vencido')
                    GROUP BY
                        bd.id_recurso;`;
                const valores = await transaction.one<IBolsilloSumaResponse>(query, idRecurso);
                transaction.query(
                    'UPDATE bolsillo SET valor_total =  $1, valor_no_vencido = $2, valor_vencido = $3 WHERE id_recurso = $4',
                    [valores.valor_total, valores.no_vencido, valores.vencido, valores.id_recurso],
                );
            });
        } catch (error) {
            console.error('Error en la consulta updateBolsilloDiaVencido:', error);
            throw new Error('Error en la consulta updateBolsilloDiaVencido');
        }
    }

    public async getTotalesBolsilloDiaPorRecurso(id_recurso: number): Promise<IBolsilloDia[] | null> {
        try {
            const totales = await this.db.manyOrNone<IBolsilloDia>(
                `SELECT id_bolsillo_dia, valor, estado, fecha_hora
                FROM bolsillo_dia
                WHERE id_recurso = $1
                AND valor > 0
                order by fecha_hora asc`,
                [id_recurso],
            );
            return totales;
        } catch (error) {
            console.error('Error en la consulta getTotalesBolsilloPorRecurso:', error);
            return null;
        }
    }

    public async getBolsilloVencido(equipo: string, vencido: boolean): Promise<IBolsilloDiaVencido[]> {
        const estado = vencido ? 'vencido' : 'vigente';
        try {
            const query = `
            SELECT TO_CHAR(fecha_hora, 'YYYY-MM-DD') as fecha, valor
            FROM bolsillo_dia
            WHERE id_recurso =
            (SELECT id_recurso
            FROM recursos
            WHERE identificador_recurso = $1
            AND id_tipo_recurso = 1)
            AND estado = '${estado}'
            and valor > 0
            order by fecha_hora asc;`;
            const results = await this.db.query<IBolsilloDiaVencido[]>(query, [equipo]);
            return results;
        } catch (error: any) {
            console.error('Error en la consulta getBolsilloVencido:', error);
            throw new DataBaseError('Error en la consulta getBolsilloVencido', error.message);
        }
    }
}
