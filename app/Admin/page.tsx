'use client';
import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase"; 
import * as XLSX from "xlsx";

interface Student {
  id: string;
  name: string;
  email: string;
  resumeURL: string;
}

const Admin: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);

  const fetchStudentData = async () => {
    try {
      const studentCollection = collection(db, "students");
      const studentSnapshot = await getDocs(studentCollection);
      
      const studentList = studentSnapshot.docs.map((doc) => {
        const data = doc.data();
        
        return {
          id: doc.id,
          name: data.name,
          email: data.email,
          resumeURL: data.resumeURL || "", 
        } as Student;
      });

      setStudents(studentList);
    } catch (error) {
      console.error("Error fetching student data: ", error);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, []);

  const handleExport = () => {
    const worksheet = XLSX.utils.json_to_sheet(students);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
    XLSX.writeFile(workbook, "students_data.xlsx");
  };

  return (
    <div className="p-8 flex flex-col items-center justify-center">

      <h1 className="text-2xl font-extrabold mb-4">Students Data</h1>

      <div className="mb-4">
        <button
          onClick={fetchStudentData}
          className="bg-gray-800 hover:bg-gray-900 text-white font-bold py-2 px-4 rounded"
        >
          Refresh Data
        </button>
      </div>

      <table className="table-auto w-full border-collapse">
        <thead>
          <tr>
            <th className="border px-4 py-2">Name</th>
            <th className="border px-4 py-2">Email</th>
            <th className="border px-4 py-2">Resume</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.id}>
              <td className="border px-4 py-2">{student.name}</td>
              <td className="border px-4 py-2">{student.email}</td>
              <td className="border px-4 py-2">
                {student.resumeURL ? (
                  <a
                    href={student.resumeURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    View Resume
                  </a>
                ) : (
                  <span className="text-gray-500">No Resume Available</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6">
        <button
          onClick={handleExport}
          className="bg-green-700 hover:bg-green-800 text-white font-bold py-2 px-4 rounded">
          Export as Excel
        </button>
      </div>
    </div>
  );
};

export default Admin;
