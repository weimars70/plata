import { application } from '@infrastructure/api/Application';
import { PREFIX } from '@util';

describe('Consultar inconsistencias', () => {
    it('Consulta exitosa de inconsistencias con recurso - Status 200', async () => {
        // Arrange
        const query = {
            aliado: '123',
            pagina: 1,
            registros_por_pagina: 10,
            orden_por: 'fecha_hora',
            orden_dir: 'asc',
        };
        // Act
        const response = await application.inject({
            method: 'GET',
            url: `${PREFIX}/v1/inconsistencia?aliado=${query.aliado}&pagina=${query.pagina}&registros_por_pagina=${query.registros_por_pagina}&orden_por=${query.orden_por}&orden_dir=${query.orden_dir}`,
        });
        const payload = JSON.parse(response.payload);
        // Assert
        expect(response.statusCode).toBe(200);
        expect(payload.data.data).toBeDefined();
        expect(payload.data.paginador).toBeDefined();
    });

    it('Consulta exitosa de inconsistencias con recurso - Status 200', async () => {
        // Arrange
        const query = {
            aliado: '244',
            pagina: 1,
            registros_por_pagina: 10,
            orden_por: 'fecha_hora',
            orden_dir: 'asc',
        };
        // Act
        const response = await application.inject({
            method: 'GET',
            url: `${PREFIX}/v1/inconsistencia?aliado=${query.aliado}&pagina=${query.pagina}&registros_por_pagina=${query.registros_por_pagina}&orden_por=${query.orden_por}&orden_dir=${query.orden_dir}`,
        });
        const payload = JSON.parse(response.payload);
        console.log(payload);
        // Assert
        expect(response.statusCode).toBe(200);
        expect(payload.data.data.length).toBe(0);
        expect(payload.data.paginador).toBeDefined();
    });

});
