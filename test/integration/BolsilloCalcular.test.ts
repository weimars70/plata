import { InconsistenciaAppService } from '@application/services';
import {
    IInconsistenciaFaltanteNombre,
    IInconsistenciaResponse,
} from '@infrastructure/repositories/postgres/dao/interfaces/IInconsistenciaResponse';

jest.mock('@infrastructure/repositories');
jest.mock('@infrastructure/api-client');
jest.mock('@infrastructure/api-client/recursos-api');

describe('InconsistenciaAppService', () => {
    let inconsistenciaAppService: InconsistenciaAppService;

    beforeEach(() => {
        inconsistenciaAppService = new InconsistenciaAppService();
    });

    describe('createInconsistenciaBody', () => {
        it('should handle sobrante inconsistencies correctly', () => {
            const inconsistencias: IInconsistenciaResponse[] = [
                {
                    id_inconsistencia: 1,
                    equipo: '',
                    tipo_inconsistencia: 'sobrante',
                    encargado: 0,
                    fecha_hora: '2021-10-10 10:10:10',
                    valor: '1000',
                    estado: 'activo',
                    observaciones: 'Observaciones',
                },
            ];
            const sobrantes: IInconsistenciaFaltanteNombre[] = [
                { id_inconsistencia: 1, encargado: 123, equipo: 'Equipo A', observaciones: 'Observaciones' },
            ];
            const faltantes: IInconsistenciaFaltanteNombre[] = [];

            const result = inconsistenciaAppService.createInconsistenciaBody(inconsistencias, sobrantes, faltantes);

            expect(result).toEqual([
                {
                    id_inconsistencia: 1,
                    equipo: 'Equipo A',
                    tipo_inconsistencia: 'sobrante',
                    encargado: 123,
                    fecha_hora: '2021-10-10 10:10:10',
                    valor: '1000',
                    estado: 'activo',
                    observaciones: 'Observaciones',
                },
            ]);
        });

        it('should handle faltante inconsistencies correctly', () => {
            const inconsistencias: IInconsistenciaResponse[] = [
                {
                    id_inconsistencia: 2,
                    tipo_inconsistencia: 'faltante',
                    encargado: 0,
                    equipo: '',
                    fecha_hora: '2021-10-10 10:10:10',
                    valor: '1000',
                    estado: 'activo',
                    observaciones: 'Observaciones',
                },
            ];
            const sobrantes: IInconsistenciaFaltanteNombre[] = [];
            const faltantes: IInconsistenciaFaltanteNombre[] = [
                { id_inconsistencia: 2, encargado: 456, equipo: 'Equipo B', observaciones: 'Observaciones' },
            ];

            const result = inconsistenciaAppService.createInconsistenciaBody(inconsistencias, sobrantes, faltantes);

            expect(result).toEqual([
                {
                    id_inconsistencia: 2,
                    tipo_inconsistencia: 'faltante',
                    encargado: 456,
                    equipo: 'Equipo B',
                    fecha_hora: '2021-10-10 10:10:10',
                    valor: '1000',
                    estado: 'activo',
                    observaciones: 'Observaciones',
                },
            ]);
        });
    });
});
