/**
 * 统一序列化层 — 自动转换 snake_case ↔ camelCase
 * 所有后端路由返回数据前必须调用此层
 */

/**
 * 将单个字符串从 snake_case 转为 camelCase
 */
export function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * 将单个字符串从 camelCase 转为 snake_case
 */
export function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => '_' + letter.toLowerCase());
}

/**
 * 递归将对象的 key 从 snake_case 转为 camelCase
 * 支持嵌套对象和数组
 * 跳过以 _ 开头的内部字段（如 SQLite rowid）
 */
export function keysToCamelCase(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) {
    return obj.map((item) => keysToCamelCase(item));
  }
  if (typeof obj !== 'object') return obj;

  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    // 跳过纯下划线开头的内部字段
    if (key.startsWith('_')) continue;
    const camelKey = toCamelCase(key);
    result[camelKey] = keysToCamelCase(value);
  }
  return result;
}

/**
 * 递归将对象的 key 从 camelCase 转为 snake_case
 * 用于接收前端请求体时转换
 */
export function keysToSnakeCase(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) {
    return obj.map((item) => keysToSnakeCase(item));
  }
  if (typeof obj !== 'object') return obj;

  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = toSnakeCase(key);
    result[snakeKey] = keysToSnakeCase(value);
  }
  return result;
}

/**
 * 标准 API 响应包装器
 * 自动将 data 中的字段转为 camelCase
 */
export function successResponse(data: any, meta?: Record<string, any>) {
  return {
    success: true,
    data: keysToCamelCase(data),
    ...(meta && { meta: keysToCamelCase(meta) }),
  };
}

/**
 * 错误响应包装器
 */
export function errorResponse(message: string, code?: string, statusCode = 400) {
  return {
    success: false,
    error: message,
    code,
    statusCode,
  };
}

/**
 * 从请求体中提取并转换 camelCase → snake_case
 */
export function parseBody(body: any): any {
  return keysToSnakeCase(body);
}

/**
 * 特殊字段白名单映射 — 用于无法自动转换的字段
 * 例如 SQLite 关键字 `order` 需要保留原样
 */
const FIELD_OVERRIDES: Record<string, string> = {
  // 前端 camelCase → 后端 snake_case 覆盖
  'order': 'order', // SQLite 关键字，保持原样
};

/**
 * 安全获取转换后的字段名
 */
export function getFieldName(camelName: string, direction: 'toSnake' | 'toCamel' = 'toSnake'): string {
  if (direction === 'toSnake' && FIELD_OVERRIDES[camelName]) {
    return FIELD_OVERRIDES[camelName];
  }
  return direction === 'toSnake' ? toSnakeCase(camelName) : toCamelCase(camelName);
}
