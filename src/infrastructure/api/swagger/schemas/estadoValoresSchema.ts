export const estadoValoresSchema = {
    schema: {
        description: 'Actualiza el estado de valores en lote_bolsillo_vencido',
        tags: ['estado_valores'],
        body: {
            type: 'object',
            properties: {
                message: {
                    type: 'object',
                    properties: {
                        data: {
                            type: 'string',
                            description: 'Base64 encoded string containing id_lote',
                            example: 'eyJpZF9sb3RlIjoxMjN9',
                        },
                        publishTime: {
                            type: 'string',
                            format: 'date-time',
                            example: '2024-03-21T10:00:00.000Z',
                        },
                        messageId: {
                            type: 'string',
                            example: '1234567890',
                        },
                    },
                },
            },
        },
        response: {
            '200-OK': {
                description: 'Successful response',
                type: 'object',
                properties: {
                    isError: { type: 'boolean', example: false },
                    data: { type: 'string', example: 'Estado de valores actualizado con éxito' },
                    timestamp: { type: 'string', format: 'date-time', example: '2024-03-21T10:00:00.000Z' },
                    id: { type: 'string', example: 'abc123xyz' },
                },
            },
            '400-BAD_REQUEST': {
                description: 'Bad Request',
                type: 'object',
                properties: {
                    isError: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Los valores de entrada no son correctos.' },
                    code: { type: 'string', example: 'BAD_MESSAGE' },
                    statusCode: { type: 'number', example: 400 },
                    cause: { type: 'string', example: 'El campo id_lote debe ser un número positivo' },
                    id: { type: 'string', example: 'abc123xyz' },
                },
            },
            '500-INTERNAL_SERVER_ERROR': {
                description: 'Internal Server Error',
                type: 'object',
                properties: {
                    isError: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Error actualizando estado de valores' },
                    code: { type: 'string', example: 'REPOSITORY_ERROR' },
                    statusCode: { type: 'number', example: 500 },
                    cause: { type: 'string', example: 'Database error' },
                    id: { type: 'string', example: 'abc123xyz' },
                },
            },
        },
    },
};
