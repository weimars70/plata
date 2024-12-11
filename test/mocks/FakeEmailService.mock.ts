import { MailEntity } from '@domain/entities';
import { IEmailService } from '@infrastructure/api-client/email/interfaces/IEmailService';

export class FakeEmailService implements IEmailService {
    readonly envios: MailEntity[] = [];
    async enviar(mail: MailEntity): Promise<void> {
        this.envios.push(mail);
    }
}
