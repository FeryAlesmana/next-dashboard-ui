const Table = ({
  columns,
  renderRow,
  data,
  children,
  isRowSelected,
  onToggleRow,
}: {
  columns: { header: string; accessor: string; className?: string }[];
  renderRow?: (item: any) => React.ReactNode;
  data?: any[];
  children?: React.ReactNode;
  isRowSelected?: (item: any) => boolean;
  onToggleRow?: (item: any) => void;
}) => {
  return (
    <table className="w-full mt-4">
      <thead>
        <tr className="text-left text-gray-500 text-sm">
          {columns.map((col) => (
            <th key={col.accessor} className={col.className}>
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {/* If children are passed, render them, else use renderRow + data */}
        {children ? children : data?.map((item) => renderRow?.(item))}
      </tbody>
    </table>
  );
};

export default Table;
