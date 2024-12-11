import { DEPENDENCY_CONTAINER, TYPES } from '@configuration';
import { Firestore } from '@google-cloud/firestore';
import { application } from '@infrastructure/api/Application';
import { PREFIX } from '@util';
import MockFirebase from 'mock-cloud-firestore';
import { FirestoreMockDataBolsilloRecaudo } from '../mocks/data/FirestoreMockBolsilloRecaudo';

describe('Modificar bolsillo', () => {
    beforeAll(async () => {
        const firebase = new MockFirebase(FirestoreMockDataBolsilloRecaudo);
        const firestore = firebase.firestore();
        DEPENDENCY_CONTAINER.rebind<Firestore>(TYPES.Firestore).toConstantValue(firestore);
    });
    it('Recaudo de bolsillo - 200', async () => {
        // Arrange
        const body = {
            subscription: '1-2024-07-30',
            message: {
                data: 'ewogICAib3BlcmFjaW9uIjoicmVjYXVkbyIsCiAgICJpZF90cmFuc2FjY2lvbiI6ODU5Mgp9',
                publishTime: '2024-07-30T11:34:00.000Z',
                messageId: '1',
            },
        };
        // Act
        const response = await application.inject({
            method: 'POST',
            url: `${PREFIX}/bolsillo`,
            payload: { ...body },
        });

        // Assert
        expect(response.statusCode).toBe(200);
    });
});
