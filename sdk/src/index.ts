import { addRxPlugin } from 'rxdb';
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';
export * from './lib/identity';
export * from './lib/media';
export * from './lib/utils';
addRxPlugin(RxDBDevModePlugin);
