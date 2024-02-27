import { forEach, map } from 'lodash';
import { Meilisearch } from 'meilisearch';
import slugify from 'slugify';

import { Config } from './types';

type Op = 'c' | 'u' | 'd'; // create/update
type Data = Record<any, any> | null;
export type Config2 = Config & {
  tableName: string;
};
export const clients: Record<any, Meilisearch> = {};

export const handleModify = async (
  topic: string,
  before: Data,
  after: Data,
  op: Op,
  config: Config2,
) => {
  const newData = after || before;
  const syncData = getSyncData(config.tableName, newData as Record<any, any>, config);
  const client = getClient(config);

  if (Object.keys(syncData).length > 1) {
    const index = getIndex(topic);

    await client.index(getIndex(topic)).addDocuments([syncData], {
      primaryKey: 'referenceUid',
    });
  }
};

export const handleDelete = async (
  topic: string,
  before: Data,
  after: Data,
  op: Op,
  config: Config2,
) => {
  const newData = after || before;
  const syncData = getSyncData(config.tableName, newData as Record<any, any>, config);
  const client = getClient(config);

  if (Object.keys(syncData).length > 1) {
  }
};

const getSyncData = (tableName: string, newData: Record<any, any>, config: Config2) => {
  const syncData: Record<any, any> & {
    referenceUid: string;
  } = {
    referenceUid: '',
  };
  const fieldConfig = {
    primary: ['id'],
    exclude: [],
    ...(config.tables[tableName] || {
      include: [],
    }),
  };
  const primary: Record<any, any> = {};

  forEach(newData, (value, field) => {
    if (fieldConfig.primary.length === 0 || fieldConfig.primary.includes(field)) {
      primary[field] = value;
    }

    if (fieldConfig.exclude.includes('*') || fieldConfig.exclude.includes(field)) {
      return;
    }

    if (fieldConfig.include.includes('*') || fieldConfig.include.includes(field)) {
      syncData[field] = value;
    }
  });

  syncData.referenceUid = map(primary, (v, k) => `${k}:${v}`).join();

  return syncData;
};

export const getClient = (config: Config | Config2) => {
  const key = map(config.connection.meilisearch, (v) => v).join();

  if (!(key in clients)) {
    const { host, api_key, ...others } = config.connection.meilisearch;
    clients[key] = new Meilisearch({
      host,
      apiKey: api_key,
      ...others,
    });
  }

  return clients[key];
};

export const getIndex = (topic: string) => {
  topic = topic.split('.').join('_');
  return slugify(topic, { replacement: '_' });
};
