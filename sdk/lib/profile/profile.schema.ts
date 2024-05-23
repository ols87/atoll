import { RxJsonSchema } from 'rxdb';
import { SignedProp, signedPropType } from '../utils';

export type ProfileSchema = {
  id: string;
  avatar?: SignedProp;
  bio?: SignedProp;
  name?: SignedProp;
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
    name: signedPropType,
  },
  required: ['id'],
};
