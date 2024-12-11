import { IPubSubBolsillo } from './pubsub/interfaces/IBolsilloPubSub';

export interface IBolsilloPubSubRepository {
    publicarPitagoras(model: IPubSubBolsillo): Promise<string>;
}
