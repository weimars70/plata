import { application } from '@infrastructure/api/Application';

describe('Testing App Request', () => {
    it('test de prueba con error 404', async () => {
        const response = await application.inject({
            method: 'POST',
            url: '/route-not-found',
        });
        expect(response.statusCode).toBe(404);
    });
});
