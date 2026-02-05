"use client";
import React, { useState } from "react";
// Define these interfaces at the top of your file
interface Lesson {
  id: number | string;
  subject?: { name: string };
  day: string;
  startTime: string;
  endTime: string;
  teacher?: { name: string };
}

interface SupervisedClass {
  id: number | string;
  name: string;
  lessons: Lesson[];
}

// In your component, use the type in useState:

const SupervisedView = ({ teacherLesson }: { teacherLesson: any }) => {
  // ... inside your component ...
  const [selectedClass, setSelectedClass] = useState<SupervisedClass | null>(
    null,
  );

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <h1 className="text-lg font-semibold mb-4">Jadwal Guru</h1>

      <div className="mb-8">
        <h2 className="text-md font-semibold mb-4 text-gray-600">
          Jadwal Kelas yang Disupervisi
        </h2>

        {teacherLesson.length > 0 ? (
          <div
            className={
              teacherLesson.length === 1
                ? "w-full"
                : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
            }
          >
            {teacherLesson.map((cls: any) => (
              <div
                key={cls.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-gray-50 hover:border-lamaBlue transition-colors cursor-pointer group"
                onClick={() => setSelectedClass(cls)}
              >
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 uppercase font-bold">
                    Kelas
                  </span>
                  <span className="font-semibold text-lg">{cls.name}</span>
                </div>
                <button className="text-lamaBlue text-xs font-medium group-hover:underline">
                  Lihat Jadwal →
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 text-sm">
            Anda tidak mengawasi kelas manapun.
          </div>
        )}
      </div>

      {/* POPOVER / MODAL OVERLAY */}
      {selectedClass && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg sm:text-xl">
                Jadwal Kelas {selectedClass.name}
              </h3>
              <button
                onClick={() => setSelectedClass(null)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Content Area */}
            <div className="p-3 sm:p-4 overflow-y-auto">
              {selectedClass.lessons.length > 0 ? (
                <>
                  {/* 1. TABLE VIEW (Desktop - md and up) */}
                  <div className="hidden md:block border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-100 text-gray-600">
                          <th className="p-3 text-left">Mata Pelajaran</th>
                          <th className="p-3 text-left">Hari</th>
                          <th className="p-3 text-left">Jam</th>
                          <th className="p-3 text-left">Guru</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {selectedClass.lessons.map((lesson) => (
                          <tr key={lesson.id} className="hover:bg-gray-50">
                            <td className="p-3 font-medium">
                              {lesson.subject?.name || "-"}
                            </td>
                            <td className="p-3">{lesson.day}</td>
                            <td className="p-3 whitespace-nowrap text-gray-500">
                              {lesson.startTime} - {lesson.endTime}
                            </td>
                            <td className="p-3">
                              {lesson.teacher?.name || "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* 2. CARD VIEW (Mobile - below md) */}
                  <div className="md:hidden space-y-3">
                    {selectedClass.lessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        className="p-4 rounded-lg border bg-gray-50 shadow-sm"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-bold text-lamaBlue text-base">
                            {lesson.subject?.name || "-"}
                          </span>
                          <span className="bg-white px-2 py-1 rounded text-[10px] font-bold uppercase border text-gray-400">
                            {lesson.day}
                          </span>
                        </div>

                        <div className="flex flex-col gap-1 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400">🕒</span>
                            <span>
                              {lesson.startTime} - {lesson.endTime}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400">👤</span>
                            <span>{lesson.teacher?.name || "-"}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-center py-8 text-gray-500">
                  Tidak ada jadwal ditemukan.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupervisedView;
