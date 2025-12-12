const PlaceholderPage = ({ title }: { title: string }) => {
  return (
    <div className="container-fluid">
      <div className="card p-4 mt-3">
        <h4>{title}</h4>
        <p className="mb-0 text-muted">
          Placeholder page. Content coming soon.
        </p>
      </div>
    </div>
  );
};

export default PlaceholderPage;
