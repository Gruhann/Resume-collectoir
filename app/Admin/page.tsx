'use client';
import React, { useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import {  getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { db } from "../../firebase"; 
import * as XLSX from "xlsx";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, RefreshCw, FileDown, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { ThemeProvider } from "next-themes";

const ThemeToggle = () => {
  const { setTheme, theme } = useTheme();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="fixed top-4 right-4"
    >
      <SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};

interface Student {
  id: string;
  name: string;
  email: string;
  branch: string;
  cgpa: number;
  resumeURL: string;
}

const Admin: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [sortField, setSortField] = useState<keyof Student>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [loadingRefresh, setLoadingRefresh] = useState<boolean>(false);
  const [loadingExport, setLoadingExport] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  const fetchStudentData = async () => {
    setLoadingRefresh(true);
    try {
      const studentCollection = collection(db, "students");
      const studentSnapshot = await getDocs(studentCollection);

      const studentList = studentSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          email: data.email,
          branch: data.branch,
          cgpa: data.cgpa,
          resumeURL: data.resumeURL || "",
        } as Student;
      });

      setStudents(studentList);
    } catch (error) {
      console.error("Error fetching student data: ", error);
    } finally {
      setLoadingRefresh(false);
    }
  };

  const handleLogin = async () => {
    try {
      const auth = getAuth();
      await signInWithEmailAndPassword(auth, email, password);
      setIsLoggedIn(true);
      fetchStudentData();
    } catch (error) {
      console.error("Error logging in: ", error);
    }
  };

  const handleExport = async () => {
    setLoadingExport(true);
    const worksheet = XLSX.utils.json_to_sheet(students);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
    
    await new Promise(resolve => setTimeout(resolve, 1000));

    XLSX.writeFile(workbook, "students_data.xlsx");
    setLoadingExport(false);
  };

  const handleSort = (field: keyof Student) => {
    setSortField(field);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.branch.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedStudents = [...filteredStudents].sort((a, b) => {
    if (a[sortField] < b[sortField]) return sortOrder === 'asc' ? -1 : 1;
    if (a[sortField] > b[sortField]) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedStudents.length / itemsPerPage);
  const currentStudents = sortedStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ThemeToggle />
    {!isLoggedIn ? (
      <Card className="w-full max-w-md mx-auto max-h-screen bg-background text-foreground p-4">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">Admin Login</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <label htmlFor="email" className="block mb-1 font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block mb-1 font-medium">
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full"
            />
          </div>
          <Button onClick={handleLogin} className="w-full">
            Login
          </Button>
        </CardContent>
      </Card>
    ) : (
      <Card className="w-full h-screen max-w-6xl mx-auto bg-background text-foreground p-4">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">Students Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <div className="flex-1 mr-4">
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Button onClick={fetchStudentData} variant="outline" className="mr-2">
              {loadingRefresh ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
              Refresh
            </Button>
            <Button onClick={handleExport} variant="outline">
              {loadingExport ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />}
              Export
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">
                    <button className="font-semibold" onClick={() => handleSort('name')}>
                      Name {sortField === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </button>
                  </TableHead>
                  <TableHead>
                    <button className="font-semibold" onClick={() => handleSort('email')}>
                      Email {sortField === 'email' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </button>
                  </TableHead>
                  <TableHead>
                    <button className="font-semibold" onClick={() => handleSort('branch')}>
                      Branch {sortField === 'branch' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </button>
                  </TableHead>
                  <TableHead className="text-right">
                    <button className="font-semibold" onClick={() => handleSort('cgpa')}>
                      CGPA {sortField === 'cgpa' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </button>
                  </TableHead>
                  <TableHead className="text-right">Resume</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>{student.branch}</TableCell>
                    <TableCell className="text-right">{student.cgpa}</TableCell>
                    <TableCell className="text-right">
                      {student.resumeURL ? (
                        <a
                          href={student.resumeURL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 transition-colors duration-200 flex items-center justify-end"
                        >
                          View <ExternalLink className="ml-1 h-4 w-4" />
                        </a>
                      ) : (
                        <span className="text-gray-500">N/A</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between mt-4">
            <Button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              variant="outline"
            >
              <ChevronLeft className="mr-2 h-4 w-4" /> Previous
            </Button>
            <span className="text-sm font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              variant="outline"
            >
              Next <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="mt-4 flex justify-end">
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => {
                setCurrentPage(1);
                setItemsPerPage(Number(value));
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select rows per page" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 rows per page</SelectItem>
                <SelectItem value="10">10 rows per page</SelectItem>
                <SelectItem value="20">20 rows per page</SelectItem>
                <SelectItem value="50">50 rows per page</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    )}
    </ThemeProvider>
  );
};

export default Admin;