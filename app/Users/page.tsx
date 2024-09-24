"use client";
import React, { useState } from "react";
import { auth, storage, db } from "../../firebase.js"; // Import Firestore
import { GoogleAuthProvider, signInWithPopup, User } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc } from "firebase/firestore"; // Import Firestore functions

const Users: React.FC = () => {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [resume, setResume] = useState<File | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [downloadURL, setDownloadURL] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const loggedInUser = result.user;
      setUser(loggedInUser);
      setEmail(loggedInUser.email || "");
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error signing in with Google: ", error.message);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!resume) {
      console.error("No resume file selected!");
      return;
    }
    if (!user) {
      console.error("User is not authenticated");
      return;
    }

    setUploadStatus("uploading");
    setErrorMessage(null);

    try {
      const storageRef = ref(storage, `resumes/${user.uid}/${resume.name}`);
      await uploadBytes(storageRef, resume);
      const fileDownloadURL = await getDownloadURL(storageRef);
      setDownloadURL(fileDownloadURL);
      
      await addDoc(collection(db, "students"), {
        uid: user.uid,
        name,
        email,
        resumeURL: fileDownloadURL,
      });

      setUploadStatus("success");
      console.log("Resume uploaded and student details saved successfully");
    } catch (error: unknown) {
      setUploadStatus("error");
      if (error instanceof Error) {
        setErrorMessage(error.message);
        console.error("Error uploading file: ", error.message);
      }
    }
  };

  const handleModalClose = () => {
    setUploadStatus("idle");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      {user ? (
        uploadStatus === "success" ? (
          <div className="flex flex-col items-center justify-center space-y-4">
            <h2 className="text-2xl font-extrabold mb-4">Thank You!</h2>
            <p>Your resume has been successfully uploaded.</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-4">
            <h2 className="text-2xl font-extrabold mb-4">User Profile</h2>
            <form
              onSubmit={handleSubmit}
              className="w-full max-w-sm border-2 p-8 rounded-2xl shadow-xl shadow-black/25"
              encType="multipart/form-data"
            >
              <div className="mb-4">
                <label
                  htmlFor="name"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                  readOnly // Make it read-only if you don't want the user to edit it
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="resume"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Resume
                </label>
                <input
                  type="file"
                  id="resume"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => {
                    if (e.target.files) {
                      setResume(e.target.files[0]);
                    }
                  }}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="flex items-center justify-center">
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Save Profile
                </button>
              </div>
            </form>

            {uploadStatus === "uploading" && <p>Uploading your resume...</p>}
            {errorMessage && <p className="text-red-500">{errorMessage}</p>}

            {uploadStatus === "success" && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="bg-white p-6 rounded-lg shadow-lg max-w-md">
                  <h3 className="text-2xl font-semibold mb-4">Resume Uploaded!</h3>
                  <p className="mb-4">
                    Your resume has been uploaded successfully. You can view it{" "}
                    <a
                      href={downloadURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline break-words"
                    >
                      here
                    </a>.
                  </p>
                  <div className="mt-6 text-right">
                    <button
                      onClick={handleModalClose}
                      className="bg-gray-800 hover:bg-gray-900 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      ) : (
        <button
          onClick={handleGoogleSignIn}
          className="bg-gray-800 hover:bg-gray-900 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Sign in with Google
        </button>
      )}
    </div>
  );
};

export default Users;
