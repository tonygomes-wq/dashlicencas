/**
 * Utilitários para transformar dados entre snake_case (banco) e camelCase (API)
 */

// Converter snake_case para camelCase
export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

// Converter camelCase para snake_case
export function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

// Transformar objeto de snake_case para camelCase
export function transformToCamelCase<T = any>(obj: any): T {
  if (obj === null || obj === undefined) return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => transformToCamelCase(item)) as any;
  }
  
  if (typeof obj === 'object' && obj.constructor === Object) {
    const transformed: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const camelKey = snakeToCamel(key);
        transformed[camelKey] = transformToCamelCase(obj[key]);
      }
    }
    return transformed;
  }
  
  return obj;
}

// Transformar objeto de camelCase para snake_case
export function transformToSnakeCase<T = any>(obj: any): T {
  if (obj === null || obj === undefined) return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => transformToSnakeCase(item)) as any;
  }
  
  if (typeof obj === 'object' && obj.constructor === Object) {
    const transformed: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const snakeKey = camelToSnake(key);
        transformed[snakeKey] = transformToSnakeCase(obj[key]);
      }
    }
    return transformed;
  }
  
  return obj;
}

// Remover campos sensíveis de objetos
export function removeSensitiveFields<T extends Record<string, any>>(
  obj: T,
  fields: string[]
): Partial<T> {
  const result = { ...obj };
  fields.forEach(field => {
    delete result[field];
  });
  return result;
}
