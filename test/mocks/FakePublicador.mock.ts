/* eslint-disable @typescript-eslint/no-explicit-any */

import { IEvento, IPubSubRepository } from '@infrastructure/api-client/pubsub/interfaces';

export class FakePublicador implements IPubSubRepository {
    readonly eventos: IEvento<any>[] = [];

    async publishEvent(evento: IEvento<any>): Promise<void> {
        this.eventos.push(evento);
    }
}


