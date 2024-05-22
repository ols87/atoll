import { RxJsonSchema } from 'rxdb';
import { SignedProp } from '../utils/database';

export type ProfileSchema = {
  id: string;
  name: SignedProp;
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
    name: {
      type: 'object',
    },
  },
  required: ['id', 'name'],
};
