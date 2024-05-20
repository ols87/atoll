import { addRxPlugin } from 'rxdb';
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';
export * from './lib/identity';
addRxPlugin(RxDBDevModePlugin);
