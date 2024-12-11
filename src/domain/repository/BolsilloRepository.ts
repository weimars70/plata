export interface BolsilloRepository {
    updateBolsillo(recaudoId: string): Promise<void>;
}
