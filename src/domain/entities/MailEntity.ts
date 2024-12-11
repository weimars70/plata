export class MailEntity {
    //private static NOMBRE_PRUEBA = `PruebaMail-`.concat(DateUtil.generarFecha()).concat(`.txt`);
    private static SUBJECT_PRUEBA = `Asunto de Prueba`;
    private static NOMBRE_PRUEBA = `Prueba Mail`;

    readonly from: string;
    readonly to: string;
    readonly subject?: string;
    readonly fileName?: string;
    readonly fileNameToSend?: string;
    readonly htmlMessage: string;

    // eslint-disable-next-line max-params
    constructor(
        from: string,
        to: string,
        subject: string,
        htmlMessage: string,
        fileName?: string,
        fileNameToSend?: string,
    ) {
        this.from = from;
        this.to = to;
        this.subject = subject;
        this.fileNameToSend = fileNameToSend;
        this.fileName = fileName;
        this.htmlMessage = htmlMessage;
    }

    // eslint-disable-next-line max-params
    static crearPrueba(
        from: string,
        to: string,
        htmlMessage: string,
        fileName: string,
        fileNameToSend: string = this.NOMBRE_PRUEBA,
        subject: string = this.SUBJECT_PRUEBA,
    ) {
        return new MailEntity(from, to, subject, htmlMessage, fileName, fileNameToSend);
    }
}
