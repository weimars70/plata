import { application } from '@infrastructure/api/Application';
import { PREFIX } from '@util';
import { DBMemRepositoryTestFactory } from '../mocks/factories';
import { TYPES } from '@configuration';

describe('Estado Valores', () => {
    it('Actualización exitosa del estado - Status 200', async () => {
        // Arrange
        const body = {
            message: {
                data: 'eyJpZF9sb3RlIjoiMSJ9', // Base64 encoded: {"id_lote":'123'}
                publishTime: '2024-03-21T10:00:00.000Z',
                messageId: '1234567890',
            },
        };

        // Act
        const response = await application.inject({
            method: 'POST',
            url: `${PREFIX}/v1/estado-valores`,
            payload: body,
        });
        // Get updated record
        const repositoryTestFactory = new DBMemRepositoryTestFactory();
        const repository = repositoryTestFactory.create(TYPES.Pg);
        const result = await repository.executeQuery('SELECT estado FROM lote_bolsillo_vencido WHERE id_lote = 123');

        // Assert
        expect(response.statusCode).toBe(200);
        const payload = JSON.parse(response.payload);
        expect(payload.isError).toBe(false);
        expect(payload.data).toBe('Estado de valores actualizado con éxito');
        expect(result[0].estado).toBe(1);
    });
});
