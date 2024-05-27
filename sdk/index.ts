import { AtollIdentity } from './identity';
import { AtollMessage } from './message';
import { AtollProfile } from './profile';
import { AtollDatabase, AtollUtils } from './utils';
export * from './identity';
export * from './utils';
export * from './profile';
export * from './message';
export class Atoll {
  static identity = AtollIdentity;
  static profile = AtollProfile;
  static database = AtollDatabase;
  static utils = AtollUtils;
  static message = AtollMessage;
}
