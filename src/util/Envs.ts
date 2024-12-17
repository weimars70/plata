export const NODE_ENV = process.env.NODE_ENV?.toLowerCase() || 'local';

export const GCP_PROJECT = process.env.GCP_PROJECT ?? 'cm-dineros-test';

export const PREFIX = `/${process.env.DOMAIN}/${process.env.SERVICE_NAME}`;

export const HOST = process.env.HOST || 'localhost';

export const API_MAESTROS =
    process.env.API_MAESTROS || 'https://api-testing.coordinadora.com/cm-maestros-equipos-consulta/api/v1/equipos/';

export const API_RECURSOS =
    process.env.API_RECURSOS || 'https://apiv2-dev.coordinadora.com/dineros/cm-dineros-recursos/responsable/';

export const TOPIC_PUBSUB_BOLSILLO = process.env.TOPIC_PUBSUB_BOLSILLO ?? 'confirmacion-legalizacion-bolsillo';

export const TOPIC_PUBSUB_ACTUALIZACION_BOLSILLO =
    process.env.TOPIC_PUBSUB_ACTUALIZACION_BOLSILLO ?? 'actualizacion-bolsillo';

export const LISTA_TERMINALES = process.env.LISTA_TERMINALES ?? '1,2,3,4,5,6,7,8,9,10';
