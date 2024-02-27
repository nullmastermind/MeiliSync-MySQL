import { forEach, map } from 'lodash';
import { Index, Meilisearch } from 'meilisearch';
import slugify from 'slugify';

import { Config } from './types';

type Op = 'c' | 'u' | 'd' | 'r'; // create/update/delete/read
type Data = Record<any, any> | null;
export type Config2 = Config & {
  tableName: string;
};
export const clients: Record<any, Meilisearch> = {};
const indexes: Record<any, Index> = {};

export const handleModify = async (
  topic: string,
  before: Data,
  after: Data,
  op: Op,
  config: Config2,
) => {
  const newData = after || before;
  const syncData = getSyncData(config.tableName, newData as Record<any, any>, config);

  if (Object.keys(syncData).length > 1) {
    const index = getIndex(config, topic);
    await index.addDocuments([syncData], {
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

  if (Object.keys(syncData).length > 1) {
    const index = getIndex(config, topic);
    await index.deleteDocument(syncData.referenceUid);
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

  syncData.referenceUid = map(primary, (v, k) => `${k}_${v}`).join('_');

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

export const getIndex = (config: Config | Config2, topic: string) => {
  topic = topic.split('.').join('_');
  topic = slugify(topic, { replacement: '_' });

  if (!(topic in indexes)) {
    const client = getClient(config);
    indexes[topic] = client.index(topic);
  }

  return indexes[topic];
};
