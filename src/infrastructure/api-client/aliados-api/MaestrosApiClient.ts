import 'reflect-metadata';
import { injectable } from 'inversify';
import got from 'got';
import { IResponseEquiposAliados } from './interfaces';
import { API_MAESTROS } from '@util';

@injectable()
export class MaestrosApiClient {
    async getNombreEquipos(idEquipo: string): Promise<IResponseEquiposAliados | null> {
        try {
            const url = `${API_MAESTROS}${idEquipo}`;
            const response = await got.get<IResponseEquiposAliados>({
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
