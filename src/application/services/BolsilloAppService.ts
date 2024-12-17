import { DEPENDENCY_CONTAINER, TYPES } from '@configuration';
import { injectable } from 'inversify';
import { Result, Response } from '@domain/response';
import { PubSub } from '@google-cloud/pubsub';
import {
    IBolsillo,
    IConsultaBolsillo,
    ICrearBolsillo,
    Recurso,
    IBolsilloDia,
    IEquipo,
    IVencido,
    IErrorPitagoras,
} from '@application/data/in/';
import {
    BolsilloDao,
    FirestoreBolsilloRepository,
    BolsilloDiaDao,
    InconsistenciaDao,
    RecursosDao,
    TransaccionesDao,
} from '@infrastructure/repositories';
import { LISTA_TERMINALES } from '@util';
import { IBolsilloDiaALegalizar, IBolsillosALegalizar } from '@application/interfaces/IBolsillosALegalizar';
import { IBolsillosLegalizacion } from '@application/data/out/IBolsillosLegalizacion';
import {
    IBolsilloSumaResponse,
    ILegalizacionModel,
} from '@infrastructure/repositories/postgres/dao/interfaces/IConsultarRecaudoResponse';
import { IBolsilloCalculoResponse, IBolsilloDiaVencido, INoBolsilloResponse } from '@application/data/out';
import { BadSchemaException } from '@domain/exceptions';
import { IBolsilloPubSubRepository } from '@infrastructure/pubsub/IBolsilloPubSub';
import { IEstadoValores } from '@application/data/in/IEstadoValores';
import { EstadoValoresDao } from '@infrastructure/repositories/postgres/dao/EstadoValoresDao';
import { TOPIC_ACTUALIZACION_BOLSILLOS } from '@infrastructure/pubsub/pubsub/Topics';

@injectable()
export class BolsilloAppService {
    private readonly bolsilloDao = DEPENDENCY_CONTAINER.get(BolsilloDao);
    private readonly bolsilloDiaDao = DEPENDENCY_CONTAINER.get(BolsilloDiaDao);
    private readonly recursosDao = DEPENDENCY_CONTAINER.get(RecursosDao);
    private readonly transaccionesDao = DEPENDENCY_CONTAINER.get(TransaccionesDao);
    private readonly firestoreDAO = DEPENDENCY_CONTAINER.get<FirestoreBolsilloRepository>(
        TYPES.FirestoreBolsilloRepository,
    );
    private readonly inconsistenciDao = DEPENDENCY_CONTAINER.get(InconsistenciaDao);
    private readonly ESTADO_VENCIDO = 'vencido';
    private readonly ESTADO_NO_VENCIDO = 'vigente';
    private pubsubPublisher = DEPENDENCY_CONTAINER.get<IBolsilloPubSubRepository>(TYPES.PubSubBolsillo);
    private readonly array_terminales = LISTA_TERMINALES.split(',');
    private readonly estadoValoresDao = DEPENDENCY_CONTAINER.get(EstadoValoresDao);
    private readonly pubsub = DEPENDENCY_CONTAINER.get<PubSub>(TYPES.PubSub);

    async recaudoCalcularBolsillo(data: IBolsillo): Promise<Response<string | null>> {
        const idEquipo = await this.transaccionesDao.getRecursoTransaccion(data.id_transaccion);
        const aliadoEquipo = await this.bolsilloDao.getAliadoEquipo(idEquipo.id_recurso);
        const diasLegalizacion = aliadoEquipo ? 5 : 1;
        const date = new Date(idEquipo.fecha_hora_transaccion).toISOString();
        const idBolsilloDia = await this.bolsilloDiaDao.getBolsilloDia(`${idEquipo.id_recurso}-${date.split('T')[0]}`);
        const recaudo = await this.transaccionesDao.getRecaudo(data.id_transaccion);
        const crearBolsillo: ICrearBolsillo = {
            bolsilloDia: !!idBolsilloDia,
            diasLegalizacion: diasLegalizacion,
            idEquipo: idEquipo.id_recurso,
            valorRecaudo: recaudo.valor_transaccion,
            aliadoEquipo: aliadoEquipo?.aliado ?? null,
            date: date,
            idMovimiento: recaudo.id_movimiento,
        };
        await this.bolsilloDao.crearTransaccionBolsillo(crearBolsillo);
        try {
            await this.firestoreDAO.updateBolsillo(recaudo.id_movimiento);
        } catch (error) {
            return Result.error('Error al actualizar el estado del bolsillo en firestore');
        }
        return Result.ok('Bolsillo creado con exito');
    }

    async calcularBolsillo(): Promise<Response<string | null>> {
        const transacciones = await this.transaccionesDao.getTransacctions();
        const date = new Date().toISOString().split('T')[0];
        if (!transacciones || transacciones.length === 0)
            return Result.ok('No hay transacciones en los ultimos 15 minutos');
        transacciones.forEach(async (transaccion) => {
            const bolsillo = await this.transaccionesDao.getAllTransacctionsDayByRecurso(transaccion.id_recurso);
            if (bolsillo) {
                let valorBolsilloDia = 0;
                bolsillo.forEach(async (bolsilloDia) => {
                    if (bolsilloDia.ingreso_dinero) {
                        valorBolsilloDia += bolsilloDia.valor_transaccion;
                    } else {
                        valorBolsilloDia -= bolsilloDia.valor_transaccion;
                    }
                });
                const bolsilloDiaActual = await this.bolsilloDiaDao.getBolsilloDia(`${transaccion.id_recurso}-${date}`);
                if (bolsilloDiaActual?.valor !== valorBolsilloDia)
                    return Result.error(`Los bolsillos para el recurso ${transaccion.id_recurso} no coinciden`);
                await this.bolsilloDiaDao.updateBolsilloDia(
                    valorBolsilloDia,
                    `${transaccion.id_recurso}-${date.split('T')[0]}`,
                );
                const bolsilloRecurso = await this.bolsilloDiaDao.getBolsilloByBolsilloDia(transaccion.id_recurso + '');
                if (!bolsilloRecurso) throw new Error('No se pudo calcular los valores para el bolsillo');
                const bolsilloRecursoUpdate: IBolsilloSumaResponse = {
                    id_recurso: transaccion.id_recurso + '',
                    no_vencido: bolsilloRecurso.no_vencido,
                    vencido: bolsilloRecurso.vencido,
                    valor_total: bolsilloRecurso.vencido + bolsilloRecurso.no_vencido,
                };
                this.bolsilloDao.updateBolsillo(bolsilloRecursoUpdate);
            }
        });
        return Result.ok('Bolsillos actualizados con exito');
    }

    async calcularVencidos(): Promise<Response<string | null>> {
        const recaudos = await this.bolsilloDiaDao.getRecaudosVencidos();
        if (!recaudos || recaudos.length === 0) throw new Error('No se encontraron recaudos vigentes');
        for (const recaudo of recaudos) {
            try {
                // Publish recaudos to PubSub
                await this.pubsub.topic(TOPIC_ACTUALIZACION_BOLSILLOS).publishMessage({
                    json: { ...recaudo },
                });
            } catch (error) {
                console.error('Error publicando Bolsillos vencidos a PubSub:', error);
                throw new Error('Error publicando Bolsillos vencidos a PubSub');
            }
        }
        return Result.ok('Bolsillos vencidos enviados para actualización');
    }

    async calcularDinerosLegalizacion(data: IBolsillo): Promise<Response<string | null>> {
        const transaccion = await this.transaccionesDao.getTransaccion(data.id_transaccion);
        const bolsillo = await this.bolsilloDao.getTotalesBolsilloPorRecurso(transaccion.id_recurso);
        const totalLegalizado = transaccion.valor_transaccion;
        const bolsillosDia = await this.bolsilloDiaDao.getTotalesBolsilloDiaPorRecurso(transaccion.id_recurso);
        if (bolsillosDia && bolsillosDia.length > 0) {
            const bolsilloVencido = bolsillo ? bolsillo.valor_vencido : 0;
            const bolsilloNoVencido = bolsillo ? bolsillo.valor_no_vencido : 0;
            if (bolsilloVencido > 0 || bolsilloNoVencido > 0) {
                let bolsillosALegalizar: IBolsilloDiaALegalizar[] = [];
                let valorRestante = totalLegalizado;
                if (bolsilloVencido > 0 && valorRestante > 0) {
                    const bolsillosVencidosLegalizados = this.getBolsillosVencidosCalculo(
                        totalLegalizado,
                        bolsillosDia,
                        this.ESTADO_VENCIDO,
                    );
                    bolsillosALegalizar = bolsillosVencidosLegalizados.bolsillos;
                    valorRestante = bolsillosVencidosLegalizados.restante;
                }
                if (bolsilloNoVencido > 0 && valorRestante > 0) {
                    const bolsillosNoVencidosLegalizados = this.getBolsillosVencidosCalculo(
                        valorRestante,
                        bolsillosDia,
                        this.ESTADO_NO_VENCIDO,
                    );
                    bolsillosALegalizar = bolsillosALegalizar.concat(bolsillosNoVencidosLegalizados.bolsillos);
                }
                const valoresLegalizar = this.getValoresLegalizacionBolsillos(bolsillosALegalizar);
                const legalizacionModel: ILegalizacionModel = {
                    bolsillos: bolsillosALegalizar,
                    idLegalizacion: transaccion.id_movimiento,
                    valoresBolsillo: valoresLegalizar,
                    idRecurso: transaccion.id_recurso,
                };
                await this.inconsistenciDao.legalizarBolsillo(legalizacionModel, data.operacion);
            }
        } else if (!bolsillo) this.bolsilloDao.createEmptyBolsilloDia(transaccion.id_recurso);
        if (data.operacion === 'legalizacion') {
            const terminal = await this.transaccionesDao.getTerminalLegalizacion(data.id_transaccion);
            if (this.array_terminales.includes(String(terminal.terminal))) {
                this.pubsubPublisher.publicarPitagoras({
                    id_transaccion: data.id_transaccion,
                });
            }
        }
        return Result.ok('Bolsillo legalizado con exito');
    }

    private getValoresLegalizacionBolsillos(bolsillos: IBolsilloDiaALegalizar[]): IBolsillosLegalizacion {
        let valorVencido = 0;
        let valorNoVencido = 0;
        for (const bolsillo of bolsillos) {
            if (bolsillo.estado === this.ESTADO_VENCIDO) {
                valorVencido += +bolsillo.valor;
            } else {
                valorNoVencido += +bolsillo.valor;
            }
        }
        return { vencidos: valorVencido, noVencidos: valorNoVencido };
    }

    private getBolsillosVencidosCalculo(
        valorLegalizado: number,
        bolsillosDia: IBolsilloDia[],
        estado: string,
    ): IBolsillosALegalizar {
        const bolsillosVencidos = bolsillosDia.filter((bolsillo) => bolsillo.estado === estado);
        const bolsillosALegalizar: {
            id_bolsillo_dia: string;
            valor: number;
            estado: string;
            valor_inicial_bolsillo: number;
            valor_final_bolsillo: number;
        }[] = [];
        let valorRestante = valorLegalizado;
        for (const bolsillo of bolsillosVencidos) {
            if (valorRestante <= 0) {
                break;
            }
            const valorInicial = bolsillo.valor;
            const valorALegalizar = Math.min(bolsillo.valor, valorRestante);
            const valorFinal = valorInicial - valorALegalizar;
            bolsillosALegalizar.push({
                ...bolsillo,
                valor: valorALegalizar,
                valor_inicial_bolsillo: valorInicial,
                valor_final_bolsillo: valorFinal,
            });
            valorRestante -= valorALegalizar;
        }
        return { bolsillos: bolsillosALegalizar, restante: valorRestante };
    }

    buscarEquipo(recursos: Recurso[]): string | undefined {
        return recursos.find((recurso) => recurso.tipo === 1)?.valor;
    }

    async consultarBolsillo(
        data: IConsultaBolsillo,
    ): Promise<Response<IBolsilloCalculoResponse | INoBolsilloResponse>> {
        this.validarData(data);
        let equipo = 0;
        if (!data.aliado) {
            const response = await this.recursosDao.getIdEquipo(data);
            equipo = response ? response.id_recurso : 0;
        }
        const bolsillo = await this.bolsilloDao.getBolsilloEquipoAliado(equipo, data.aliado);
        const inconsistencia = await this.inconsistenciDao.getInconsistencia(equipo, 'sobrante', data.aliado);
        const faltante = await this.inconsistenciDao.getInconsistencia(equipo, 'faltante', data.aliado);
        const legalizacion = await this.inconsistenciDao.getLegalizacion(equipo);
        if (!bolsillo) {
            return Result.ok({
                bolsillo: false,
                message: 'El equipo no tiene bolsillo',
            });
        }
        return Result.ok({
            bolsillo: true,
            id_responsable: bolsillo.id_responsable,
            valor_total: +bolsillo.valor_total,
            valor_no_vencido: +bolsillo.valor_no_vencido,
            valor_vencido: +bolsillo.valor_vencido,
            saldo_favor_inconsistencias: inconsistencia ? +inconsistencia.saldo_favor : 0,
            total_inconsistencias: inconsistencia ? +inconsistencia.total : 0,
            saldo_favor_faltantes: faltante ? +faltante.saldo_favor : 0,
            total_faltantes: faltante ? +faltante.total : 0,
            legalizacion: legalizacion,
        });
    }

    private validarData(data: IConsultaBolsillo): void {
        if (data.aliado)
            if (data.recurso || data.tipo_recurso)
                throw new BadSchemaException('Schema', 'No se puede enviar recurso o tipo_recurso si se envía aliado');
        if (data.recurso && !data.tipo_recurso)
            throw new BadSchemaException('Schema', 'Debe enviar el tipo_recurso si envía recurso');
        if (!data.recurso && data.tipo_recurso)
            throw new BadSchemaException('Schema', 'Debe enviar el recurso si envía tipo_recurso');
        if (!data.recurso && !data.tipo_recurso && !data.aliado)
            throw new BadSchemaException('Schema', 'Debe enviar al menos un filtro');
    }

    async consultarVencido(equipo: IEquipo, vencido: IVencido): Promise<Response<IBolsilloDiaVencido[]>> {
        const response = await this.bolsilloDiaDao.getBolsilloVencido(equipo.equipo, vencido.vencido);
        return Result.ok(response);
    }

    async errorConfirmacionBolsillo(data: IErrorPitagoras): Promise<Response<string>> {
        const consultarReintentos = await this.inconsistenciDao.getReintentos(data.id_transaccion);
        if (consultarReintentos.reintentos <= 10) {
            await this.inconsistenciDao.updateReintentos(consultarReintentos.id_legalizacion);
            this.pubsubPublisher.publicarPitagoras({
                id_transaccion: data.id_transaccion,
            });
            return Result.ok('Reintentos actualizados con exito');
        }
        return Result.ok('Limite de reintentos alcanzado');
    }

    async actualizarEstadoValores(data: IEstadoValores): Promise<Response<string>> {
        await this.estadoValoresDao.actualizarEstadoValores(data.id_lote);
        return Result.ok('Estado de valores actualizado con éxito');
    }
}
