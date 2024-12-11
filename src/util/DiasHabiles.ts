import got from 'got';

function esDomingo(fecha: Date): boolean {
    return fecha.getDay() === 0;
}

export async function getDiasFestivos(year: number): Promise<any> {
    const url = `https://date.nager.at/api/v3/PublicHolidays/${year}/CO`;
    try {
        const response = await got(url);
        const festivos = JSON.parse(response.body).map((holiday: any) => new Date(holiday.date));
        return festivos;
    } catch (error) {
        console.error('Error al obtener los días festivos :', error);
        return [];
    }
}
export async function contarDomingosYFestivos(desde: Date, hasta: Date, festivoArray: any): Promise<number> {
    let contador = 0;
    const currentDate = new Date(desde);

    while (currentDate <= hasta) {
        if (
            esDomingo(currentDate) ||
            festivoArray.some((festivo: any) => festivo.getTime() === currentDate.getTime())
        ) {
            contador++;
        }
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return contador;
}
