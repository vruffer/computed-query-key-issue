import { useLiveQuery } from '@tanstack/react-db';
import { add, collection, toggled, type Item } from './collection';
import { useState } from 'react';

export function Index() {
  const data = useLiveQuery((q) =>
    q.from({ col: collection }).orderBy(({ col }) => col.id),
  );

  const [showNode, setShowNode] = useState(true);

  const onClick = async (i: Item) => {
    const updated = add(i.id);
    collection.utils.writeUpdate(updated);
    toggled.utils.writeUpdate(updated);
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
            onClick={() => onClick(i)}
          >
            id: {i.id}, name: {i.name}, count: {i.count}
          </li>
        ))}
      </ul>
      <button onClick={() => setShowNode((prev) => !prev)}>
        Toggle toggled
      </button>
      {showNode && <Toggled onClick={onClick} />}
    </>
  );
}

function Toggled(props: { onClick: (item: Item) => void }) {
  const { data } = useLiveQuery((q) => q.from({ col: toggled }));
  return (
    <div>
      <h2>Toggled</h2>
      {data.map((i) => (
        <li
          key={i.id}
          style={{
            cursor: 'pointer',
            userSelect: 'none',
          }}
          onClick={() => props.onClick(i)}
        >
          id: {i.id}, name: {i.name}, count: {i.count}
        </li>
      ))}
    </div>
  );
}
