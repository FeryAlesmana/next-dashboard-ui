export function QuickAddButtons({ current = 0, onChange }: any) {
  const add = (amount: number) => {
    onChange((current || 0) + amount);
  };

  return (
    <div className="flex gap-2 mt-1">
      {[10000, 50000, 100000].map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => add(v)}
          className="px-2 py-1 text-xs rounded bg-gray-200 hover:bg-gray-300"
        >
          +{v.toLocaleString("id-ID")}
        </button>
      ))}
    </div>
  );
}
