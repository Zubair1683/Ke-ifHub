import ItemCard from './ItemCard.jsx';

export default function ItemGrid({ items, showAuthor = true, empty }) {
  if (!items || items.length === 0) {
    return <div className="empty">{empty || 'Nothing here yet.'}</div>;
  }
  return (
    <div className="grid">
      {items.map(item => <ItemCard key={`${item.kind}-${item._id}`} item={item} showAuthor={showAuthor} />)}
    </div>
  );
}
