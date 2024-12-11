import { IEvento } from './IEvento';

export interface IPubSubRepository {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    publishEvent(evento: IEvento<any>): Promise<void>;
}
