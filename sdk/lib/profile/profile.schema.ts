import { RxJsonSchema } from 'rxdb';
import { SignedProp, signedPropType } from '../utils';

export type ProfileSchemaBase = {
  id: string;
  icon: SignedProp;
  qr: SignedProp;
};

export type ProfileWriteSchema = {
  avatar?: SignedProp;
  bio?: SignedProp;
  name?: SignedProp;
};

export type ProfileSchema = ProfileSchemaBase & ProfileWriteSchema;

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
    name: signedPropType,
    icon: signedPropType,
    qr: signedPropType,
  },
  required: ['id'],
};
