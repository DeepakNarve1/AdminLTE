const ContentHeader = ({ title }: { title: string }) => {
  return (
    <section className="content-header">
      <div className="container-fluid">
        <div className="row mb-2">
          <div className="col-sm-6">
            <h1 className="p-5 font-bold text-3xl text-gray-700">{title}</h1>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContentHeader;
