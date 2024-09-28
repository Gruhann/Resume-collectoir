'use client'
import React, { useState, useEffect } from "react";
import { auth, storage, db } from "../../firebase.js";
import { GoogleAuthProvider, signInWithPopup, User, signOut } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {  doc, onSnapshot, setDoc,DocumentSnapshot } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { ThemeProvider } from "next-themes";
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { FirebaseError } from "firebase/app";
import ResumeGeneratorBox from "./ResumeGeneratorBox";

interface UserData {
  name: string;
  branch: string;
  cgpa: string;
  resumeURL: string;
}

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

const Users: React.FC = () => {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [branch, setBranch] = useState<string>("");
  const [cgpa, setCgpa] = useState<string>("");
  const [resume, setResume] = useState<File | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [downloadURL, setDownloadURL] = useState<string>("");
  const [isNewUser, setIsNewUser] = useState<boolean>(false);
  const { toast } = useToast();
  
  
  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const loggedInUser = result.user;
      setUser(loggedInUser);
      setEmail(loggedInUser.email || "");
      localStorage.setItem("user", JSON.stringify(loggedInUser));
      checkUserData(loggedInUser);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast({
          title: "Error",
          description: `Failed to sign in with Google: ${error.message}`,
          variant: "destructive",
        });
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      localStorage.removeItem("user");
      toast({
        title: "Success",
        description: "Logged out successfully",
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast({
          title: "Error",
          description: `Failed to log out: ${error.message}`,
          variant: "destructive",
        });
      }
    }
  };
  const checkUserData = async (user: User) => {
    try {
      const docRef = doc(db, "students", user.uid);
      const unsubscribe = onSnapshot(docRef, (docSnapshot: DocumentSnapshot) => {
        if (docSnapshot.exists()) {
          const userData = docSnapshot.data() as UserData;
          setName(userData.name);
          setBranch(userData.branch);
          setCgpa(userData.cgpa);
          setDownloadURL(userData.resumeURL);
          setIsNewUser(false);
        } else {
          setIsNewUser(true);
        }
      });
  
      // Clean up the listener when the component unmounts
      return unsubscribe;
    } catch (error: unknown) {
      if (error instanceof FirebaseError && error.code === 'failed-precondition') {
        // Handle offline scenario
        console.log('Offline, unable to fetch user data');
      } else {
        // Handle other errors
        console.error('Error fetching user data:', error);
      }
    }
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!resume && isNewUser) {
      toast({
        title: "Error",
        description: "Please select a resume file.",
        variant: "destructive",
      });
      return;
    }
    if (!user) {
      toast({
        title: "Error",
        description: "User is not authenticated",
        variant: "destructive",
      });
      return;
    }

    setUploadStatus("uploading");

    try {
      let fileDownloadURL = downloadURL;
      if (resume) {
        const storageRef = ref(storage, `resumes/${user.uid}/${resume.name}`);
        await uploadBytes(storageRef, resume);
        fileDownloadURL = await getDownloadURL(storageRef);
        setDownloadURL(fileDownloadURL);
      }

      const userRef = doc(db, "students", user.uid);
      const userData = { uid: user.uid, name, email, branch, cgpa, resumeURL: fileDownloadURL };
      
      // Use setDoc with merge option to update or create the document
      await setDoc(userRef, userData, { merge: true });

      setUploadStatus("success");
      setIsNewUser(false);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error: unknown) {
      setUploadStatus("error");
      if (error instanceof Error) {
        toast({
          title: "Error",
          description: `Failed to update profile: ${error.message}`,
          variant: "destructive",
        });
      }
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setEmail(parsedUser.email);
      checkUserData(parsedUser);
    }
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
    <ThemeToggle />
      {user ? (
        <>
        <Card className="w-full max-w-6xl mx-auto overflow-hidden relative shadow-xl shadow-black/15 "> {/* Increased width to 500px */}
          <Button
            onClick={handleLogout}
            className="absolute top-2 right-2 shadow-xl shadow-black/10"
            variant="outline"
          >
            Logout
          </Button>
          <CardHeader>
            <CardTitle className="font-bold text-xl">User Profile</CardTitle>
            <CardDescription>View or update your information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Name:</strong> {name}</p>
              <p><strong>Email:</strong> {email}</p>
              <p><strong>Branch:</strong> {branch}</p>
              <p><strong>CGPA:</strong> {cgpa}</p>
              {downloadURL && (
                <Button asChild variant="link" className="shadow-xl shadow-black/15 border-black  ">
                  <a href={downloadURL} target="_blank" rel="noopener noreferrer">View Resume</a>
                </Button>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <AlertDialog>
              <AlertDialogTrigger asChild className="shadow-xl shadow-black/15">
                <Button>Update Details</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Update Your Details</AlertDialogTitle>
                  <AlertDialogDescription>
                    Make changes to your profile here. Click save when you&apos;re done.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="branch">Branch</Label>
                      <Select value={branch} onValueChange={setBranch}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Branch" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CSE">CSE</SelectItem>
                          <SelectItem value="ECE">ECE</SelectItem>
                          <SelectItem value="CSE-AIML">CSE-AIML</SelectItem>
                          <SelectItem value="CSE-DS">CSE-DS</SelectItem>
                          <SelectItem value="Civil">Civil</SelectItem>
                          <SelectItem value="Mech">Mech</SelectItem>
                          <SelectItem value="EEE">EEE</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cgpa">CGPA</Label>
                      <Input id="cgpa" type="number" step="0.01" value={cgpa} onChange={(e) => setCgpa(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="resume">Resume</Label>
                      <Input id="resume" type="file" accept=".pdf,.doc,.docx" onChange={(e) => setResume(e.target.files ? e.target.files[0] : null)} />
                    </div>
                  </div>
                  <AlertDialogFooter className="mt-4">
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction type="submit">
                      {uploadStatus === "uploading" ? "Updating..." : "Save Changes"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </form>
              </AlertDialogContent>
            </AlertDialog>
          </CardFooter>
        </Card>
        <div className="container mx-auto p-4">
      <ResumeGeneratorBox />
    </div>
       </>
      ) : (
        <Card className="w-[full]"> {/* Increased width to 500px */}
          <CardHeader>
            <CardTitle>Welcome</CardTitle>
            <CardDescription>Please sign in to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleGoogleSignIn} className="w-full">
              Sign in with Google
            </Button>
          </CardContent>
        </Card>
        
      )}
    </div>
    </ThemeProvider>
  );
};

export default Users;