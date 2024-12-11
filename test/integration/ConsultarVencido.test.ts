import { application } from '@infrastructure/api/Application';
import { PREFIX } from '@util';

describe('Consultar Bolsillo Vencido', () => {
    it('Consulta Exitosa Bolsillo Vencido - Status 200', async () => {
        // Arrange
        const equipo = '1234-1';
        const vencido = true;
        // Act
        const response = await application.inject({
            method: 'GET',
            url: `${PREFIX}/v1/bolsillos/equipos/${equipo}?vencido=${vencido}`,
        });

        const payload = JSON.parse(response.payload);

        // Assert
        expect(response.statusCode).toBe(200);
        expect(payload.data.length).toBe(2);
        expect(payload.data[0].valor).toBe(100000);
        expect(payload.data[1].valor).toBe(1000000);
    });

    it('Consulta Exitosa Bolsillo NO Vencido - Status 200', async () => {
        // Arrange
        const equipo = '1234-1';
        const vencido = false;

        // Act
        const response = await application.inject({
            method: 'GET',
            url: `${PREFIX}/v1/bolsillos/equipos/${equipo}?vencido=${vencido}`,
        });

        const payload = JSON.parse(response.payload);

        // Assert
        expect(response.statusCode).toBe(200);
        expect(payload.data.length).toBe(1);
        expect(payload.data[0].valor).toBe(2000000);
    });

    it('Consulta Errada Bolsillo Vencido - Status 400', async () => {
        // Arrange
        const equipo = '1234-1';
        const vencido = 'falsed';

        // Act
        const response = await application.inject({
            method: 'GET',
            url: `${PREFIX}/v1/bolsillos/equipos/${equipo}?vencido=${vencido}`,
        });

        const payload = JSON.parse(response.payload);

        // Assert
        expect(response.statusCode).toBe(400);
        expect(payload.message).toBe('Los valores de entrada no son correctos.');
        expect(payload.cause).toBe('El campo vencido no es un booleano');
    });
});
