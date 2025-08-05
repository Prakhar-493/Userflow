import React from 'react'
import Link from 'next/link';
import Login from '@/app/Login/page';
const Landing = () => {
    return (
      <div className="p-2 m-2 flex flex-col justify-center items-center h-[82vh] gap-7">
        <div className='text-4xl'>Welcome to my userflow website</div>
        <Link href="/Login" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Get Started
        </Link>
      </div>
    );
}

export default Landing