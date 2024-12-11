export const messages = (field: string, option?: string): Record<string, string> => ({
    'any.required': `El campo ${field} es obligatorio`,
    'string.empty': `El campo ${field} No puede estar vacío`,
    'string.base': `El campo ${field} no es string`,
    'string.length': `El campo ${field} No puede estar vacío o tener +/- de
    Buscar esto en ${option} dígitos`,
    'string.email': `El campo ${field} debe tener un array de correos válidos`,
    'string.max': `El campo ${field} excede el número de caracteres permitidos ${option}`,
    'string.min': `El campo ${field} debe tener al menos ${option} caracteres `,
    'string.pattern.base': `El campo ${field} solo debe contener números `,
    'number.base': `El campo ${field} no es número`,
    'number.min': `El campo ${field} debe ser mayor o igual a 0`,
    'number.integer': `El campo ${field} no puede ser un decimal`,
    'number.greater': `El campo ${field} debe ser mayor que ${option}`,
    'boolean.base': `El campo ${field} no es un booleano`,
    'array.base': `El campo ${field} no es un array`,
    'array.includesRequiredUnknowns': `El ${field} debe tener al menos 1 artículo`,
});
