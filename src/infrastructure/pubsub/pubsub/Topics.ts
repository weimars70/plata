import { GCP_PROJECT, TOPIC_PUBSUB_BOLSILLO } from '@util';

const topicName = (project: string, topic: string): string => `projects/${project}/topics/${topic}`;

export const TOPIC_DINEROS = topicName(GCP_PROJECT, TOPIC_PUBSUB_BOLSILLO);
