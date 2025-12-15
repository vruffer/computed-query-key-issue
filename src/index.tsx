import { eq, useLiveQuery } from '@tanstack/react-db';

import { add, collection, node, type Item } from './collection';
import { useState } from 'react';

export function Index() {
  const data = useLiveQuery((q) =>
    q.from({ col: collection }).orderBy(({ col }) => col.id)
  );

  const [showNode, setShowNode] = useState(true);

  const onClick = async (i: Item) => {
    const updated = add(i.id);
    collection.utils.writeUpdate(updated);
    node.utils.writeUpdate(updated);
  };

  return (
    <>
      <h2>Collection</h2>
      <ul>
        {data.data.map((i) => (
          <li
            key={i.id}
            style={{
              cursor: 'pointer',
              userSelect: 'none',
            }}
            onClick={async () => onClick(i)}
          >
            id: {i.id}, name: {i.name}, count: {i.count}
          </li>
        ))}
      </ul>
      <button onClick={() => setShowNode((prev) => !prev)}>Toggle node</button>
      {showNode && <Node onClick={onClick} />}
    </>
  );
}

function Node(props: { onClick: (item: Item) => void }) {
  const { data: nodeData } = useLiveQuery((q) =>
    q
      .from({ col: node })
      .where(({ col }) => eq(col.id, 0))
      .findOne()
  );
  return (
    nodeData && (
      <>
        <h2>Node</h2>
        <div
          style={{
            cursor: 'pointer',
            userSelect: 'none',
          }}
          onClick={async () => props.onClick(nodeData)}
        >
          id: {nodeData.id}, name: {nodeData.name}, count: {nodeData.count}
        </div>
      </>
    )
  );
}
