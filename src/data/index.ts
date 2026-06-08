import { useData } from '@/hooks/useData';
export { useData };
export type { AppData } from '@/hooks/useData';

// 保留所有类型定义和静态数据，作为离线回退
export * from './static-data';
