// DeleteManyForm.tsx
type DeleteManyFormProps = {
  ids: string[];
  formAction: (formData: FormData) => void;
  table: string;
};

export default function DeleteManyForm({
  ids,
  formAction,
  table,
}: DeleteManyFormProps) {
  if (!ids || ids.length === 0)
    return <span>Tidak ada data yang dipilih.</span>;

  return (
    <form action={formAction} className="p4 flex flex-col gap-4">
      <input type="hidden" name="table" value={table} />
      {ids.map((id) => (
        <input key={id} type="hidden" name="ids" value={id} />
      ))}
      <span className="text-center font-medium">
        {ids.length} data akan terhapus. Apakah anda yakin?
      </span>
      <button className="bg-red-700 text-white py-2 px-4 rounded-md border-none w-max self-center">
        Hapus Banyak
      </button>
    </form>
  );
}
