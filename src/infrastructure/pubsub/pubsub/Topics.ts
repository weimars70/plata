import { GCP_PROJECT, TOPIC_PUBSUB_ACTUALIZACION_BOLSILLO, TOPIC_PUBSUB_BOLSILLO } from '@util';

const topicName = (project: string, topic: string): string => `projects/${project}/topics/${topic}`;

export const TOPIC_DINEROS = topicName(GCP_PROJECT, TOPIC_PUBSUB_BOLSILLO);
export const TOPIC_ACTUALIZACION_BOLSILLOS = topicName(GCP_PROJECT, TOPIC_PUBSUB_ACTUALIZACION_BOLSILLO);
