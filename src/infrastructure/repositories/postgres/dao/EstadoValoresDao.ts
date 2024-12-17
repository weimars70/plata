import { DEPENDENCY_CONTAINER, TYPES } from '@configuration';
import { injectable } from 'inversify';
import { IDatabase, IMain } from 'pg-promise';
import { DataBaseError } from '@domain/exceptions';

@injectable()
export class EstadoValoresDao {
    private db = DEPENDENCY_CONTAINER.get<IDatabase<IMain>>(TYPES.Pg);

    async actualizarEstadoValores(idLote: number): Promise<void> {
        try {
            await this.db.none('UPDATE lote_bolsillo_vencido SET estado = 2 WHERE id_lote = $1', [idLote]);
            if (!this.actualizarBolsillos(idLote)) {
                console.error('Error en la transacción, se realizó un rollback en actualizar bolsillos:');
            }
        } catch (error: any) {
            console.error('Error actualizando estado de valores:', error);
            throw new DataBaseError('Error actualizando estado de valores', error.message);
        }
    }

    async actualizarBolsillos(idLote: number): Promise<boolean> {
        console.log('idLote:::', idLote);
        const client = await this.db.connect();

        try {
            // Iniciar la transacción
            await client.query('BEGIN');
            const updateDiaQuery = `UPDATE bolsillo_dia bd SET estado = 'vencido' WHERE bd.numero_lote = $1 RETURNING id_recurso;`;
            const updateDiaResult = await client.query(updateDiaQuery, [idLote]);
            const idRecursos = updateDiaResult.rows.map((row: { id_recurso: any }) => row.id_recurso);
            console.log('Recursos afectados:', idRecursos);
            // Loop por cada `id_recurso` afectado
            for (const idRecurso of idRecursos) {
                // Segunda consulta: Calcular totales
                const sumQuery = `SELECT SUM(CASE WHEN bd.estado = 'vigente' THEN bd.valor ELSE 0 END) AS no_vencido,
                                    SUM(CASE WHEN bd.estado = 'vencido' THEN bd.valor ELSE 0 END) AS vencido
                                    FROM bolsillo_dia bd
                                    WHERE bd.id_recurso = $1
                                    GROUP BY bd.id_recurso;`;
                const sumResult = await client.query(sumQuery, [idRecurso]);

                const { no_vencido, vencido } = sumResult.rows[0] || { no_vencido: 0, vencido: 0 };
                console.log(`Totales para recurso ${idRecurso}: no_vencido=${no_vencido}, vencido=${vencido}`);

                // Tercera consulta: Actualizar valores en bolsillo
                const updateBolsilloQuery = `UPDATE bolsillo SET valor_no_vencido = $1, valor_vencido = $2 WHERE id_recurso = $3;`;
                await client.query(updateBolsilloQuery, [no_vencido, vencido, idRecurso]);
            }
            // Consulta adicional: Actualizar número de lote
            const updateNumeroLoteQuery = `UPDATE bolsillo_dia SET numero_lote = $1;`;
            await client.query(updateNumeroLoteQuery, [idLote]);

            // Confirmar la transacción
            await client.query('COMMIT');
            return true;
        } catch (error) {
            // Deshacer la transacción en caso de error
            await client.query('ROLLBACK');
            return false;
        } finally {
            // Liberar el cliente
            client.done();
        }
    }
}
