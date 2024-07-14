import { RxJsonSchema } from 'rxdb';
import { SignedProp, signedPropType } from '../utils';

export type ProfileWriteSchema = {
  avatar?: SignedProp;
  bio?: SignedProp;
  alias?: SignedProp;
};

export type ProfileSchema = ProfileWriteSchema & {
  id: string;
};

export const profileSchema: RxJsonSchema<ProfileSchema> = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 100,
    },
    avatar: signedPropType,
    bio: signedPropType,
    alias: signedPropType,
  },
  required: ['id'],
};
