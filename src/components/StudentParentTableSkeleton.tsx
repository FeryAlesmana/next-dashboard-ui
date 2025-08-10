const StudentParentTableSkeleton = () => {
  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0 animate-pulse">
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, idx) => (
          <div
            key={idx}
            className="grid grid-cols-6 gap-4 items-center p-4 border-b border-gray-200"
          >
            <div className="col-span-1 h-4 bg-gray-300 rounded"></div>
            <div className="col-span-1 h-4 bg-gray-300 rounded"></div>
            <div className="col-span-1 h-4 bg-gray-300 rounded hidden md:block"></div>
            <div className="col-span-1 h-4 bg-gray-300 rounded hidden md:block"></div>
            <div className="col-span-1 h-4 bg-gray-300 rounded hidden md:block"></div>
            <div className="col-span-1 h-4 bg-gray-300 rounded hidden md:block"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentParentTableSkeleton;
