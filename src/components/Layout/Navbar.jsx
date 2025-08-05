import Link from 'next/link';
import React from 'react'
import Login from '@/app/Login/page';

const Navbar = () => {
  return (
    <nav className="bg-blue-600 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <a href="#" className="text-white text-2xl font-bold">
          Brand
        </a>

        <ul className="flex space-x-4">
          <li>
            <Link href="/Login" className="text-white hover:text-blue-200">
              Login
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar