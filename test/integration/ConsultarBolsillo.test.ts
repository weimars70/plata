import { application } from '@infrastructure/api/Application';
import { PREFIX } from '@util';

describe('Consultar Bolsillo', () => {
    it('Consulta Exitosa con recurso y id_recurso - Status 200', async () => {
        // Arrange
        const recurso = '1234-1';
        const tipo_recurso = 1;
        // Act
        const response = await application.inject({
            method: 'GET',
            url: `${PREFIX}/v1/bolsillo?recurso=${recurso}&tipo_recurso=${tipo_recurso}`,
        });

        const payload = JSON.parse(response.payload);

        // Assert
        expect(response.statusCode).toBe(200);
        expect(payload.data.bolsillo).toBe(true);
        expect(payload.data.valor_total).toBe(3100000);
        expect(payload.data.saldo_favor_inconsistencias).toBe(0);
    });

    it('Consulta Exitosa con aliado - Status 200', async () => {
        // Arrange
        const aliado = 123;
        // Act
        const response = await application.inject({
            method: 'GET',
            url: `${PREFIX}/v1/bolsillo?aliado=${aliado}`,
        });

        const payload = JSON.parse(response.payload);

        // Assert
        expect(response.statusCode).toBe(200);
        expect(payload.data.bolsillo).toBe(true);
        expect(payload.data.valor_total).toBe(3100000);
        expect(payload.data.saldo_favor_inconsistencias).toBe(0);
    });

    it('Consulta Fallida No se envía recurso, y se envía tipo recurso - Status 400', async () => {
        // Arrange
        const recurso = '';
        const tipo_recurso = 1;

        // Act
        const response = await application.inject({
            method: 'GET',
            url: `${PREFIX}/v1/bolsillo?recurso=${recurso}&tipo_recurso=${tipo_recurso}`,
        });
        const payload = JSON.parse(response.payload);

        // Assert
        expect(response.statusCode).toBe(400);
        expect(payload.message).toBe('Debe enviar el recurso si envía tipo_recurso');
    });

    it('Consulta Fallida Se envía aliado y se envía recurso - Status 400', async () => {
        // Arrange
        const recurso = '1234-1';
        const aliado = 1;

        // Act
        const response = await application.inject({
            method: 'GET',
            url: `${PREFIX}/v1/bolsillo?recurso=${recurso}&aliado=${aliado}`,
        });
        const payload = JSON.parse(response.payload);

        // Assert
        expect(response.statusCode).toBe(400);
        expect(payload.message).toBe('No se puede enviar recurso o tipo_recurso si se envía aliado');
    });
});
