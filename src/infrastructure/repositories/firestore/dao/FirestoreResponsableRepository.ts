import { injectable } from 'inversify';
import { DEPENDENCY_CONTAINER, TYPES } from '@configuration';
import { Firestore } from '@google-cloud/firestore';
import { FirestoreException } from '@domain/exceptions';
@injectable()
export class FirestoreResponsableRepository {
    private firestore = DEPENDENCY_CONTAINER.get<Firestore>(TYPES.Firestore);
    private collection = 'usuarios';

    async getNameResponsableByCodigo(codigo: string): Promise<any> {
        try {
            const nombreEmpleado = await this.firestore
                .collection(this.collection)
                .where('codigo_empleado', '==', codigo)
                .select('nombre_empleado')
                .get();

            return nombreEmpleado;
        } catch (error: any) {
            throw new FirestoreException(error.code as number | string | undefined, error.message as string);
        }
    }
}
