- [x] I've validated the bug against the latest version of DB packages

**Describe the bug**

For context, i'm using a `QueryCollection`.

Using a computed queryKey along with `syncMode: 'on-demand'` causes a weird behaviour in the `QueryClient` cache when using `collection.utils.writeUpdate`.
Using `@tanstack/query-client-devtools` and inspecting the query cache, a weird entry appears in the cache whenever an `on-demand` collection with a computed query key is written to. The write operation doesn't update the state of the original queryKey, but instead writes it to the new unknown queryKey.

The live-query shows the updated data as expected, but un-, then remounting the component shows the data as it were before the update operation.

The described behaviour happens in 3 different scenarios:

1.  An `on-demand` collection with a constant queryKey, but with a `liveQuery` with a where clause:

    ```ts
    const collection = createCollection(
      queryCollectionOptions({
        queryKey: ['collection'],
        queryClient,
        queryFn: async () => getData(),
        getKey: (item) => item.id,
        syncMode: 'on-demand',
      }),
    );
    const { data } = useLiveQuery((q) =>
      q.from({ collection }).where(({ collection }) => eq(collection.id, 0)),
    );
    // The following query keys are present after doing a direct write:
    // ["collection", "{\"where\":{\"type\":\"func\",\"name\":\"eq\",\"args\":[{\"type\":\"ref\",\"path\":[\"id\"]},{\"type\":\"val\",\"value\":0}]}}"]
    // ["collection"] <- This one contains the updated data
    ```

2.  An `on-demand` collection with a computed query akey that always returns the same value:

    ```ts
    const collection = createCollection(
      queryCollectionOptions({
        queryKey: () => ['collection'],
        queryClient,
        queryFn: async () => getData(),
        getKey: (item) => item.id,
        syncMode: 'on-demand',
      }),
    );
    const { data } = useLiveQuery((q) => q.from({ collection }));
    // The following query keys are presnet after doing a direct write:
    // ["collection"]
    // undefined <- This queryKey is empty and its data is not viewable
    ```

3.  An `on-demand` collection with a computed query key with two or more values. This is the same case as the first, the only difference being the missing `whereClause` item in the query key array.

Note that when I reference a "computed query key", I mean a queryKey that is either a function (case 2 and 3), or a queryKey that is not, but becomes computed because of an `on-demand` collection + a `where` clause (case 1).

**To Reproduce**

Steps to reproduce the behavior:

1. Create a collection using `createCollection(queryCollectionOptions())`
2. Specify a function as the `queryKey`
3. Specify `on-demand` as its sync mode
4. Subscribe to the collection data using `useLiveQuery`
5. Perform a direct update on the data
6. Remount the component with the live query
7. Notice that the result of the direct write is gone, and you are left with the data as it was before

I've created a basic reproduction in the following github repo: https://github.com/vruffer/computed-query-key-issue.

To run it:

1. Install dependencies using a package manager of your choice (i've used `pnpm i`)
2. Start the vite dev server using `pnpm dev`
3. Make sure the `query-client-devtools` are expanded
4. Click on one of the items in any list, the 'count' should be incremented, both under "Collection" and "Toggled"
5. Notice the extra query entry in the devtools
6. Click on the `toggle node` button twice to hide/show the toggled div
7. Notice that the item you clicked has reset its count

**Expected behavior**

I expected the query cache to be updated correctly, and for liveQueries to retain the updated information across remounts.

**Screenshots**

I've provided two screenshots displaying the query cache as seen in the `react-query-devtools` in case 1 and 2 of the bug description.

**Desktop (please complete the following information):**

- OS: MacOS 15.7.2
- Browser: chrome 143.0.7499.170
- Version:
  - `@tanstack/react-db`: 0.1.64
  - `@tanstack/query-db-collection`: 1.0.17
  - `@tanstack/react-query`: 5.90.19
  - `@tanstack/react-query-devtools`: 5.91.2

**Additional notes**

I haven't tested direct write operations other than `writeUpdate`.
