import { IConsultaBolsillo } from '@application/data/in';
import { DEPENDENCY_CONTAINER, TYPES } from '@configuration';
import { DataBaseError } from '@domain/exceptions';
import { injectable } from 'inversify';
import { IDatabase, IMain } from 'pg-promise';

@injectable()
export class RecursosDao {
    private db = DEPENDENCY_CONTAINER.get<IDatabase<IMain>>(TYPES.Pg);

    public updsertRecaudoSql(recurso: string, idTipoRecurso: number): Promise<{ id_recurso: string }> {
        const sql = `WITH consultar AS (
                        SELECT id_recurso FROM recursos where identificador_recurso = $1 and id_tipo_recurso = $2
                    ),
                    insertar AS (
                        INSERT INTO recursos (identificador_recurso, id_tipo_recurso)
                        SELECT $1, $2 WHERE 1 NOT IN (SELECT 1 FROM consultar)
                        ON CONFLICT (identificador_recurso, id_tipo_recurso)
                        DO UPDATE SET id_tipo_recurso=EXCLUDED.id_tipo_recurso
                        RETURNING id_recurso
                    ),
                    tmp AS (
                        SELECT id_recurso FROM insertar
                        UNION ALL
                        SELECT id_recurso FROM consultar
                    )
                    SELECT DISTINCT id_recurso FROM tmp;`;

        return this.db.one<{ id_recurso: string }>(sql, [recurso, idTipoRecurso]);
    }

    async getIdEquipo(data: IConsultaBolsillo): Promise<{ id_recurso: number } | null> {
        try {
            const query = `select ID_RECURSO from recursos where id_tipo_recurso = $1 and IDENTIFICADOR_RECURSO = $2`;
            const response = await this.db.oneOrNone<{ id_recurso: number } | null>(query, [
                data.tipo_recurso,
                data.recurso,
            ]);
            return response;
        } catch (error: any) {
            throw new DataBaseError('Error obteniendo el id del equipo: ' + data.recurso, error.message);
        }
    }
}
