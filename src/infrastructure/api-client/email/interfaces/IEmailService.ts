import { MailEntity } from '@domain/entities';

export interface IEmailService {
    enviar(file: MailEntity, corte?: boolean): Promise<void>;
}
