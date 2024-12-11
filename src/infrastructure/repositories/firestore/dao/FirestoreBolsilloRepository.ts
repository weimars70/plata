import { injectable } from 'inversify';
import 'reflect-metadata';
import { DEPENDENCY_CONTAINER, TYPES } from '@configuration';
import { Firestore } from '@google-cloud/firestore';
import { BolsilloRepository } from '@domain/repository';
import { FirestoreException } from '@domain/exceptions';
import { IBolsilloInconsistencia } from '@application/interfaces/IBolsillosALegalizar';
@injectable()
export class FirestoreBolsilloRepository implements BolsilloRepository {
    private firestore = DEPENDENCY_CONTAINER.get<Firestore>(TYPES.Firestore);
    private collection = 'stage_recaudos';

    async updateBolsillo(recaudoId: string): Promise<void> {
        try {
            await this.firestore.collection(this.collection).doc(recaudoId).update({ estado_bolsillo: 'finalizado' });
        } catch (error: any) {
            throw new FirestoreException(error.code as number | string | undefined, error.message as string);
        }
    }

    async createInconsistenciaBolsillos(data: IBolsilloInconsistencia): Promise<void> {
        try {
            await this.firestore.collection('inconsistencia_bolsillo').doc().create(data);
        } catch ({ code, message }) {
            throw new FirestoreException(code as number | string | undefined, message as string);
        }
    }
}
