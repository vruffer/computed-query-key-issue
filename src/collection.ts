import {
  queryCollectionOptions,
  type SimpleComparison,
} from '@tanstack/query-db-collection';
import { createCollection, parseLoadSubsetOptions } from '@tanstack/react-db';
import { QueryClient } from '@tanstack/react-query';

export async function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export const queryClient = new QueryClient();

export type Item = {
  id: number;
  name: string;
  count: number;
};

function populateDb() {
  const db = [
    {
      id: 0,
      name: 'first',
      count: 0,
    },
  ];
  localStorage.setItem('db', JSON.stringify(db));
  return db;
}

function getDb() {
  const db = localStorage.getItem('db');
  if (!db) {
    return populateDb();
  }
  return JSON.parse(db) as Item[];
}

export function add(id: number) {
  const db = localStorage.getItem('db');
  if (!db) {
    throw new Error(`DB not initialized`);
  }
  const existingMap = new Map((JSON.parse(db) as Item[]).map((i) => [i.id, i]));
  const existingItem = existingMap.get(id);
  if (!existingItem) {
    throw new Error(`Item with id: ${id} not found`);
  }
  const newItem = { ...existingItem, count: existingItem.count + 1 };
  existingMap.set(id, newItem);
  localStorage.setItem('db', JSON.stringify(Array.from(existingMap.values())));
  return newItem;
}

export const collection = createCollection(
  queryCollectionOptions({
    id: 'collection',
    queryKey: ['collection'],
    queryClient,
    queryFn: async () => {
      return getDb();
    },
    getKey: (item) => item.id,
  })
);

export const node = createCollection(
  queryCollectionOptions({
    queryKey: (opts) => [
      'node',
      getIdFromFilters(parseLoadSubsetOptions(opts).filters),
    ],
    queryClient,
    queryFn: async () => {
      await wait(50);
      const db = getDb();
      const node = db.find((i) => i.id === 0);
      if (node) return db;
      return [];
    },
    getKey: (item) => item.id,
    syncMode: 'on-demand',
  })
);

export function getIdFromFilters(filters: SimpleComparison[]) {
  for (const filter of filters) {
    const [field, ...rest] = filter.field;

    if (
      field === 'id' &&
      !rest.length &&
      filter.operator === 'eq' &&
      typeof filter.value === 'number'
    ) {
      return filter.value;
    }
  }
  throw new Error(`No eq(collection.id, 'id') filter in where clause`);
}
