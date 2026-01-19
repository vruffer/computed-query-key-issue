import { queryCollectionOptions } from '@tanstack/query-db-collection';
import { createCollection } from '@tanstack/react-db';
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
    {
      id: 1,
      name: 'second',
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
  }),
);

export const toggled = createCollection(
  queryCollectionOptions({
    queryKey: () => ['toggled'],
    queryClient,
    queryFn: async () => {
      return getDb();
    },
    getKey: (item) => item.id,
    syncMode: 'on-demand',
  }),
);
