'use client'
import Link from 'next/link';
import { ThemeProvider } from "next-themes";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
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

export default function Home() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="flex flex-col items-center justify-center max-w-screen h-screen max-h-screen  bg-background text-foreground p-4">
        <ThemeToggle />
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-3xl text-center font-extrabold">Resume Collector</CardTitle>
            <CardDescription className="text-center font-semibold">Choose your login option</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Link href="/Users" passHref>
              <Button className="w-full shadow-xl shadow-black/10" size="lg">
                Login as Student
              </Button>
            </Link>
            <Link href="/Admin" passHref>
              <Button className="w-full shadow-xl shadow-black/10" size="lg" variant="outline">
                Login as Teacher
              </Button>
            </Link>
          </CardContent>
        </Card>
        
      </div>
      
    </ThemeProvider>
  );
}