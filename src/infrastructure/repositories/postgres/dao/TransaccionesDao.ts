import { DEPENDENCY_CONTAINER, TYPES } from '@configuration';
import { injectable } from 'inversify';
import { IDatabase, IMain } from 'pg-promise';

@injectable()
export class TransaccionesDao {
    private db = DEPENDENCY_CONTAINER.get<IDatabase<IMain>>(TYPES.Pg);

    public async getRecaudo(id_recaudo: number): Promise<{ id_movimiento: string; valor_transaccion: number }> {
        try {
            return this.db.one<{ id_movimiento: string; valor_transaccion: number }>(
                'select id_movimiento, VALOR_TRANSACCION from transacciones t  where t.id_transaccion  = $1',
                id_recaudo,
            );
        } catch (error) {
            console.error('Error en la consulta getRecaudo:', error);
            throw new Error('Error en la consulta getRecaudo');
        }
    }

    public async getRecursoTransaccion(
        idTransaccion: number,
    ): Promise<{ id_recurso: number; fecha_hora_transaccion: string }> {
        try {
            const query = `
            SELECT id_recurso, fecha_hora_transaccion FROM transacciones WHERE id_transaccion = $1
            `;
            const results = await this.db.one<{ id_recurso: number; fecha_hora_transaccion: string }>(query, [
                idTransaccion,
            ]);
            return results;
        } catch (error) {
            console.error('Error en la consulta getRecursoTransaccion:', error);
            throw new Error('Error en la consulta getRecursoTransaccion');
        }
    }

    public async getTransaccion(
        idTransaccion: number,
    ): Promise<{ valor_transaccion: number; ingreso_dinero: boolean; id_movimiento: string; id_recurso: number }> {
        try {
            const query = `
            SELECT VALOR_TRANSACCION, INGRESO_DINERO, id_movimiento, ID_RECURSO FROM transacciones WHERE id_transaccion = $1
            `;
            const results = await this.db.one<{
                valor_transaccion: number;
                ingreso_dinero: boolean;
                id_movimiento: string;
                id_recurso: number;
            }>(query, [idTransaccion]);
            return results;
        } catch (error) {
            console.error('Error en la consulta getRecursoTransaccion:', error);
            throw new Error('Error en la consulta getRecursoTransaccion');
        }
    }

    public async getTerminalLegalizacion(idTransaccion: number): Promise<{ terminal: number }> {
        try {
            const query = `
            select SPLIT_PART(r.IDENTIFICADOR_RECURSO, '-', 2) as terminal
                    from transacciones t
                            join legalizaciones l on t.id_movimiento::INTEGER = l.id_legalizacion
                            join recursos r on l.recurso = r.id_recurso
                    where t.id_transaccion = $1;
            `;
            const results = await this.db.one<{ terminal: number }>(query, [idTransaccion]);
            return results;
        } catch (error) {
            console.error('Error en la consulta getRecursoTransaccion:', error);
            throw new Error('Error en la consulta getRecursoTransaccion');
        }
    }

    public async getTransacctions(): Promise<{ id_recurso: number }[] | null> {
        try {
            const query = `
            SELECT DISTINCT id_recurso
            FROM transacciones
            WHERE fecha_hora_transaccion >= NOW() - INTERVAL '15 minutes' - INTERVAL '5 hour'
            and fecha_hora_transaccion <= NOW() - INTERVAL '5 hour';
            `;
            const results = await this.db.manyOrNone<{ id_recurso: number }>(query);
            return results;
        } catch (error) {
            console.error('Error en la consulta getTransacctions:', error);
            return null;
        }
    }

    public async getAllTransacctionsDayByRecurso(
        idRecurso: number,
    ): Promise<{ valor_transaccion: number; ingreso_dinero: boolean }[] | null> {
        try {
            const query = `
            SELECT valor_transaccion, ingreso_dinero
            FROM transacciones
            WHERE fecha_hora_transaccion::date = CURRENT_DATE;
            `;
            const results = await this.db.many<{ valor_transaccion: number; ingreso_dinero: boolean }>(query, [
                idRecurso,
            ]);
            return results;
        } catch (error) {
            console.error('Error en la consulta getAllTransacctionsDayByRecurso:', error);
            return null;
        }
    }
}
