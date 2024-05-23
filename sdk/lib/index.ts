import { AtollIdentity } from './identity';
import { AtollProfile } from './profile';
import { AtollDatabase, AtollUtils } from './utils';
export * from './identity';
export * from './media';
export * from './utils';
export * from './profile';

class Atoll {
  static identity = AtollIdentity;
  static profile = AtollProfile;
  static database = AtollDatabase;
  static utils = AtollUtils;
}

export const atoll = Atoll;
