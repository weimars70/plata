export const SwaggerErrors = {
    BAD_REQUEST: (cause: string) => {
        return {
            description: 'Bad Request',
            type: 'object',
            properties: {
                isError: { type: 'boolean', example: true },
                message: { type: 'string', example: cause },
                code: { type: 'string', example: 'BAD_REQUEST' },
                statusCode: { type: 'number', example: 400 },
                cause: { type: ['string', 'null'], example: cause },
            },
        };
    },
    INTERNAL_SERVER_ERROR: {
        isError: { type: 'boolean', example: true },
        message: { type: 'string', example: 'getaddrinfo ENOTFOUND dbcmtest.loc' },
        code: { type: 'string', example: 'ENOTFOUND' },
        cause: { type: ['string', 'null'], example: 'Default translator error' },
        timestap: { type: 'string', format: 'date-time', example: '2021-07-21T17:32:28Z' },
        statusCode: { type: 'number', example: 500 },
    },
    EXCEPCION_DE_NEGOCIO: {
        description: 'Excepcion de negocio',
        type: 'object',
        properties: {
            isError: { type: 'boolean', example: true },
            message: {
                type: 'string',
                example:
                    'Los cortes 1, 2 por valor de 1000000, 2000000 respectivamente que estás intentando procesar ya han sido utilizados previamente',
            },
            code: { type: 'string', example: 'ExcepcionDeNegocio' },
            statusCode: { type: 'number', example: 400 },
            cause: { type: ['string', 'null'], example: 'Default translator error' },
        },
    },
};
