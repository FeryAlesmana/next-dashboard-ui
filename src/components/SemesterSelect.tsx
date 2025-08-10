'use client';
import Select from "react-select";
import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

type SemesterOption = {
  label: string;
  start: Date;
  end: Date;
};

type SemesterSelectProps = {
  semesters: SemesterOption[];
  selected?: SemesterOption;
  onChange: (semester: SemesterOption) => void;
  placeholder?: string;
};

export default function SemesterSelect({
  semesters,
  selected,
  onChange,
  placeholder = "Pilih Semester...",
}: SemesterSelectProps) {
  
  return (
    <Select
      options={semesters}
      getOptionLabel={(option) => option.label}
      getOptionValue={(option) => option.label}
      value={selected || null}
      onChange={(option) => {
        if (option) onChange(option);
      }}
      placeholder={placeholder}
      className="min-w-[200px]"
      classNamePrefix="react-select"
    />
  );
}
