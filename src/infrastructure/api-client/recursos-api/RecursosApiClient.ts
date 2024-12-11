import 'reflect-metadata';
import { injectable } from 'inversify';
import got from 'got';
import { IResponseRecursos } from './interfaces';
import { API_RECURSOS } from '@util';

@injectable()
export class RecursosApiClient {
    async getNombreEquipos(idRecurso: number): Promise<IResponseRecursos> {
        try {
            const url = `${API_RECURSOS}${idRecurso}`;
            const response = await got.get<IResponseRecursos>({
                url,
                responseType: 'json',
                resolveBodyOnly: true,
            });
            return response;
        } catch (e) {
            console.error(`No se pudo conectar al servicio de equipos`, e);
            throw new Error(`No se pudo conectar al servicio de equipos ${e}`);
        }
    }
}
