import { ErrorCode, StatusCode } from './ErrorCode';

export abstract class Exception {
    isError: boolean;
    message: string;
    code: ErrorCode;
    statusCode: number;
    cause: string | null;

    constructor(message: string, code: ErrorCode, statusCode: number, cause?: string) {
        this.isError = true;
        this.message = message;
        this.code = code;
        this.statusCode = statusCode;
        this.cause = cause || null;
    }
}

export class BadMessageException extends Exception {
    constructor(cause: string, message: string) {
        super(message, ErrorCode.BAD_MESSAGE, StatusCode.BAD_REQUEST, cause);
    }
}

export class BadRequestException extends Exception {
    constructor(cause: string) {
        super('Bad request', ErrorCode.BAD_MESSAGE, StatusCode.BAD_REQUEST, cause);
    }
}

export class RepositoryException extends Exception {
    constructor() {
        const message = 'Ocurrió un error al momento de guardar la guía';
        super(message, ErrorCode.REPOSITORY_ERROR, StatusCode.INTERNAL_ERROR);
    }
}

export class PubSubException extends Exception {
    constructor(message: string, cause: string) {
        super(message, ErrorCode.PUBSUB_ERROR, StatusCode.INTERNAL_ERROR, cause);
    }
}

export class FirestoreException extends Exception {
    constructor(code: number | string | undefined, message: string) {
        const fsError = ErrorCode.REPOSITORY_ERROR;
        switch (code) {
            case 1:
            case '1':
                super(message, fsError, StatusCode.INTERNAL_ERROR, 'Firestore action cancelled');
                break;
            case 2:
            case '2':
                super(message, fsError, StatusCode.INTERNAL_ERROR, 'Firestore unknown error');
                break;
            case 3:
            case '3':
                super(message, fsError, StatusCode.OK, 'Firestore invalid argument');
                break;
            case 4:
            case '4':
                super(message, fsError, StatusCode.INTERNAL_ERROR, 'Firestore deadline exceeded');
                break;
            case 5:
            case '5':
                super(message, fsError, StatusCode.INTERNAL_ERROR, 'Update nonexistent document');
                break;
            case 6:
            case '6':
                super(message, fsError, StatusCode.OK, 'Firestore document already exists');
                break;
            case 7:
            case '7':
                super(message, fsError, StatusCode.INTERNAL_ERROR, 'Firestore permission denied');
                break;
            case 8:
            case '8':
                super(message, fsError, StatusCode.OK, 'Firestore resource exhausted');
                break;
            case 9:
            case '9':
                super(message, fsError, StatusCode.INTERNAL_ERROR, 'Firestore precondition failed');
                break;
            default:
                super(message, fsError, StatusCode.INTERNAL_ERROR, 'Defaulted unkwnown fs error');
                break;
        }
    }
}

export class PostgresError extends Exception {
    constructor(code: string, message: string) {
        const pgError = ErrorCode.REPOSITORY_ERROR;
        switch (code) {
            case 'P0001':
                super(message, pgError, StatusCode.INTERNAL_ERROR, 'Raise Exception');
                break;
            case '23505':
                super(message, pgError, StatusCode.INTERNAL_ERROR, 'Intentando insertar llave única duplicada');
                break;
            case '23514':
                super(message, pgError, StatusCode.INTERNAL_ERROR, 'Acción viola una restricción de la tabla');
                break;
            case '23502':
                super(message, pgError, StatusCode.INTERNAL_ERROR, 'Insertando una llave nula que no puede serlo');
                break;
            case '42883':
                super(message, pgError, StatusCode.INTERNAL_ERROR, 'llamado a funcion Inexistente');
                break;
            case '42P01':
                super(message, pgError, StatusCode.INTERNAL_ERROR, 'llamado a tabla Inexistente');
                break;
            case '42P02':
                super(message, pgError, StatusCode.INTERNAL_ERROR, 'llamado a parametro Inexistente');
                break;
            case '42704':
                super(message, pgError, StatusCode.INTERNAL_ERROR, 'llamado a objeto Inexistente');
                break;
            case '42703':
                super(message, pgError, StatusCode.INTERNAL_ERROR, 'llamado a columna Inexistente');
                break;
            case '57014':
                super(message, pgError, StatusCode.INTERNAL_ERROR, 'Query cancelled');
                break;
            case 'ECONNREFUSED':
                super(message, pgError, StatusCode.INTERNAL_ERROR, 'Conexión con pg rechazada');
                break;
            default:
                super(message, pgError, StatusCode.INTERNAL_ERROR, 'Error desconocido');
                break;
        }
    }
}
export class BadSchemaException extends Exception {
    constructor(cause: string, message: string) {
        super(message, ErrorCode.BAD_MESSAGE, StatusCode.BAD_REQUEST, cause);
    }
}

export class DataBaseError extends Exception {
    constructor(_code: number | string | undefined, message: string) {
        const fsError = ErrorCode.REPOSITORY_ERROR;
        super(message, ErrorCode.POSTGRES_ERROR, StatusCode.INTERNAL_ERROR, fsError);
    }
}
