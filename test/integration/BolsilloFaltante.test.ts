import { TYPES } from '@configuration';
import { application } from '@infrastructure/api/Application';
import { PREFIX } from '@util';
import { DBMemRepositoryTestFactory } from '../mocks/factories';

describe('Modificar bolsillo por Faltante', () => {
    it('Inconsistencia Faltante - 200', async () => {
        // Arrange
        const body = {
            subscription: '1-2024-07-30',
            message: {
                //operacion: Faltante, id_transaccion: 2
                data: 'eyJvcGVyYWNpb24iOiJGYWx0YW50ZSIsImlkX3RyYW5zYWNjaW9uIjoyfQ==',
                publishTime: '2024-10-03T11:34:00.000Z',
                messageId: '1',
            },
        };
        const queryFaltanteBolsillo = `SELECT * FROM faltante_bolsillo where id_inconsistencia_faltante = '2';`;
        const repositoryTestFactory = new DBMemRepositoryTestFactory();
        const repository = repositoryTestFactory.create(TYPES.Pg);
        const resultadoInconsistenciaAntes = await repository.executeQuery(queryFaltanteBolsillo);
        // Act
        const response = await application.inject({
            method: 'POST',
            url: `${PREFIX}/bolsillo`,
            payload: body,
        });
        const resultadoInconsistenciaDespues = await repository.executeQuery(queryFaltanteBolsillo);
        // Assert
        expect(response.statusCode).toBe(200);
        expect(resultadoInconsistenciaAntes.length).toBe(0);
        expect(resultadoInconsistenciaDespues.length).toBe(1);
    });

    it('Inconsistencia Faltante no existe transacción - 500', async () => {
        // Arrange
        const body = {
            subscription: '1-2024-07-30',
            message: {
                //operacion: Faltante, id_transaccion: 3
                data: 'eyJvcGVyYWNpb24iOiJGYWx0YW50ZSIsImlkX3RyYW5zYWNjaW9uIjozfQ==',
                publishTime: '2024-10-03T10:34:00.000Z',
                messageId: '1',
            },
        };

        // Act
        const response = await application.inject({
            method: 'POST',
            url: `${PREFIX}/bolsillo`,
            payload: body,
        });
        const payload = JSON.parse(response.payload);

        // Assert
        expect(response.statusCode).toBe(500);
        expect(payload.isError).toBe(true);
        expect(payload.message).toBe('Error en la consulta getRecursoTransaccion');
    });
});
