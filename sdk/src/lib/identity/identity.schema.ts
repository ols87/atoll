import { PrimaryKey, RxJsonSchema, TopLevelProperty } from 'rxdb';

export type Identity = {
  id: string;
  publicKey: string;
  signatures: object;
  type: string;
  sign: void;
  verify: void;
};

type IdentitySchema = {
  id: string;
  keys: [];
  identity: Identity;
};

export const identitySchema: RxJsonSchema<IdentitySchema> = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 100,
    },
    keys: {
      type: 'array',
    },
    identity: {
      type: 'object',
    },
  },
  required: ['id', 'keys'],
  encrypted: ['keys', 'identity'],
};

export type DynamicSchemaBase = {
  [key: string]: TopLevelProperty;
};

export function generateDynamicSchema<DynamicSchema extends DynamicSchemaBase>(
  schema: Partial<RxJsonSchema<DynamicSchema>>,
): RxJsonSchema<DynamicSchema> {
  return {
    version: 0,
    primaryKey: 'id' as PrimaryKey<DynamicSchema>,
    type: 'object',
    ...schema,
    properties: {
      id: {
        type: 'string',
        maxLength: 100,
      },
      ...schema.properties,
    } as { [key in Extract<keyof DynamicSchema, string>]: TopLevelProperty },
    required: [
      'id',
      ...(schema.required || []),
    ] as RxJsonSchema<DynamicSchema>['required'],
    encrypted: [],
  };
}
