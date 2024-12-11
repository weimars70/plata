export interface IEvento<T> {
    /**
     * Representa el tipo de evento que se generó.
     * Cada nombre debe ser único y puede ser usado como la "dirección" de publicación.
     *
     * @return String - nombre único del evento.
     */
    nombre(): string;

    /**
     * Datos para ser publicados.
     *
     * @return Cualquier tipo de objeto.
     */
    contenido(): T;
}
