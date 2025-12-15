- [x] I've validated the bug against the latest version of DB packages

**Describe the bug**
For context, i'm using a `QueryCollection`.

Using a computed queryKey causes a weird behaviour in the `QueryClient` cache when using direct writes.
Using `@tanstack/query-client-devtools` and inspecting the query cache, a weird entry appears in the cache whenever a collection with a computed query key is written to. The entry's cache key is undefined, and you cannot inspect it using the devtool. The queryKey that you expected to be modified is also unchanged.

The live-query shows the updated data as expected (be it a `writeUpdate`, `writeDelete`, `writeInsert` or `writeUpsert`), but un-, then remounting the component causes the liveQuery to read from its queryKey once more, effectively nullifying the result of the direct write.

**To Reproduce**
Steps to reproduce the behavior:

1. Create a collection using `createCollection(queryCollectionOptions())`
2. Specify a function as the `queryKey`
3. Subscribe to the collection data using `useLiveQuery`
4. Perform a direct write on the data
5. Remount the component with the live query
6. Notice that the result of the direct write is gone, and you are left with the data as it was before

I've created a basic reproduction in the following github repo: [insert repo](insert-github-addr).

To run it:

1. Install dependencies using a package manager of your choice (i've used `pnpm i`)
2. Start the vite dev server using `pnpm dev`
3. Make sure the `query-client-devtools` are expanded
4. Under the `Node` header, click on the text, the 'count' should be incremented.
5. Notice the invalid query entry in the devtools
6. Click on the `toggle node` button twice to hide/show the node div
7. Notice that the item you clicked has reset its count

**Expected behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Desktop (please complete the following information):**

- OS: [e.g. iOS]
- Browser [e.g. chrome, safari]
- Version [e.g. 22]

**Smartphone (please complete the following information):**

- Device: [e.g. iPhone6]
- OS: [e.g. iOS8.1]
- Browser [e.g. stock browser, safari]
- Version [e.g. 22]

**Additional context**
Add any other context about the problem here.
