import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex text-xl flex-col text-center w-screen h-screen font-extrabold items-center justify-center ">
      <h1>Resume collector</h1>
      <Link href="/Users" className='bg-gray-800 text-white text-sm p-4 m-4 font-bold rounded-xl shadow-2xl shadow-black/30'>
        Login as Student
      </Link>
      <Link href="/Admin" className='bg-gray-800 text-white text-sm p-4 m-4 font-bold rounded-xl shadow-2xl shadow-black/30'>
        Login as Teacher
      </Link>
    </div>
  );
}
