import { Exception } from '@domain/exceptions';

export interface Response<T> {
    isError: boolean;
    data: T;
    timestamp: Date;
}

export class Result {
    static ok<T>(data: T): Response<T> {
        return {
            isError: false,
            data: data,
            timestamp: new Date(),
        };
    }

    static error<T>(data: T): Response<T> {
        return {
            isError: true,
            data: data,
            timestamp: new Date(),
        };
    }

    static failure<E = Exception>(exception: E): E {
        throw exception;
    }
}
