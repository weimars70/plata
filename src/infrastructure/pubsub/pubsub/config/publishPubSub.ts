import 'reflect-metadata';
import { injectable } from 'inversify';
import { PubSub } from '@google-cloud/pubsub';
import { DEPENDENCY_CONTAINER, TYPES } from '@configuration';
import { PubSubException } from '@domain/exceptions';

@injectable()
export class PublishPubSub {
    private pubsub = DEPENDENCY_CONTAINER.get<PubSub>(TYPES.PubSub);

    async publisher(publishData: Buffer, topic: string, guia?: string): Promise<string> {
        try {
            const message = await this.pubsub.topic(topic).publishMessage({ data: publishData });
            return message.toString();
        } catch (error: any) {
            console.error(
                'PublishPubSub',
                'Error publicando a bolsillo',
                `Error publicando la data, ${error} en el topic: ${topic}, guia: ${guia}`,
            );
            throw new PubSubException(error, 'Error publicando a pubsub top');
        }
    }
}
