import { DEPENDENCY_CONTAINER } from '@configuration';
import { injectable } from 'inversify';
import { Result, Response } from '@domain/response';
import { IInconsistenciaDataIn } from '@application/data/in/IInconsistenciaDataIn';
import { RecursosDao, InconsistenciaDao } from '@infrastructure/repositories';
import {
    IInconsistenciaFaltanteNombre,
    IInconsistenciaResponse,
} from '@infrastructure/repositories/postgres/dao/interfaces/IInconsistenciaResponse';
import { IPaginador } from '@application/data/out/IPaginador';
import { MaestrosApiClient } from '@infrastructure/api-client';
import { RecursosApiClient } from '@infrastructure/api-client/recursos-api';
import { generarPaginador } from '@application/util/IPaginador';

@injectable()
export class InconsistenciaAppService {
    private inconsistenciDao = DEPENDENCY_CONTAINER.get(InconsistenciaDao);
    private recursosDao = DEPENDENCY_CONTAINER.get(RecursosDao);
    private maestrosApiClient = DEPENDENCY_CONTAINER.get(MaestrosApiClient);
    private recursosApiClient = DEPENDENCY_CONTAINER.get(RecursosApiClient);

    async getInconsistencia(recursos: IInconsistenciaDataIn): Promise<
        Response<{
            data: IInconsistenciaResponse[] | null;
            paginador: IPaginador;
        }>
    > {
        const idEquipo = recursos.equipo ? +(await this.recursosDao.updsertRecaudoSql(recursos.equipo, 1)) : 0;
        const inconsistencias = await this.getDataInconsitencias(recursos, idEquipo);

        const count = await this.inconsistenciDao.getInconsistenciasCount(recursos, idEquipo);
        const paginador = generarPaginador(recursos.pagina, recursos.registros_por_pagina, count);

        return Result.ok({
            data: inconsistencias,
            paginador,
        });
    }
    private async getDataInconsitencias(
        recursos: IInconsistenciaDataIn,
        idEquipo: number,
    ): Promise<IInconsistenciaResponse[] | null> {
        let inconsistencias = await this.inconsistenciDao.getInconsistencias(recursos, idEquipo);
        if (!inconsistencias || inconsistencias.length === 0) {
            return [];
        }

        const nombreSobrante = await this.inconsistenciDao.getRecursosInconsistenciaSobrante(inconsistencias);
        const nombreFaltantes = await this.inconsistenciDao.getRecursosInconsistenciasFaltantes(inconsistencias);
        inconsistencias = this.createInconsistenciaBody(inconsistencias, nombreSobrante, nombreFaltantes);
        inconsistencias = await this.getNombreEquipo(inconsistencias);

        return inconsistencias;
    }

    createInconsistenciaBody(
        inconsistencia: IInconsistenciaResponse[],
        sobrantes: IInconsistenciaFaltanteNombre[],
        faltantes: IInconsistenciaFaltanteNombre[],
    ): IInconsistenciaResponse[] {
        inconsistencia.forEach((inconsistenciaItem) => {
            if (inconsistenciaItem.tipo_inconsistencia === 'sobrante') {
                const nombreSobrante = sobrantes.find(
                    (s) => s.id_inconsistencia === inconsistenciaItem.id_inconsistencia,
                );
                inconsistenciaItem.observaciones = nombreSobrante?.observaciones ?? '';
                inconsistenciaItem.encargado = nombreSobrante?.encargado ?? 0;
                inconsistenciaItem.equipo = nombreSobrante?.equipo ?? '';
            } else {
                const nombreFaltantes = faltantes.find(
                    (f) => f.id_inconsistencia === inconsistenciaItem.id_inconsistencia,
                );
                inconsistenciaItem.observaciones = nombreFaltantes?.observaciones ?? '';
                inconsistenciaItem.encargado = nombreFaltantes?.encargado ?? 0;
                inconsistenciaItem.equipo = nombreFaltantes?.equipo ?? '';
            }
        });
        return inconsistencia;
    }

    async getNombreEquipo(inconsistencias: IInconsistenciaResponse[] | null): Promise<IInconsistenciaResponse[]> {
        if (!inconsistencias) return [];
        for (const inconsistencia of inconsistencias) {
            const equipo = await this.maestrosApiClient.getNombreEquipos(inconsistencia.equipo);
            const encargado = await this.recursosApiClient.getNombreEquipos(inconsistencia.encargado);
            inconsistencia.nombre_equipo = equipo?.data.nombre;
            inconsistencia.nombre_encargado = encargado?.data.includes('El responsable con el código')
                ? ''
                : encargado?.data;
        }
        return inconsistencias;
    }
}
