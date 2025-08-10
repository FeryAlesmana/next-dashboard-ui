export default function MenuSkeleton() {
  return (
    <div className="mt-4 text-sm space-y-4 animate-pulse">
      {[...Array(2)].map((_, sectionIdx) => (
        <div key={sectionIdx}>
          <div className="hidden lg:block h-3 w-24 bg-gray-300 rounded my-4" />
          {[...Array(4)].map((_, itemIdx) => (
            <div
              key={itemIdx}
              className="flex items-center gap-4 py-2 md:px-2"
            >
              <div className="w-5 h-5 bg-gray-300 rounded" />
              <div className="w-24 h-3 bg-gray-300 rounded" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
