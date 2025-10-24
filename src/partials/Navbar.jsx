import React, { useState, useEffect, useRef } from 'react'
import Notification from './Notification'
import { useAuth } from '../context/authContext'

function Navbar() {
  const { userData, handleSignOut } = useAuth()
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <>
      <nav className="sticky top-0 z-50 py-3 px-5 w-full flex justify-between items-center shadow-md bg-white/80 backdrop-blur-md border-b border-gray-200">
        <h1 className="text-2xl font-bold tracking-tight text-black">Sumify</h1>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-black transition"
          >
            <span>{userData?.email || 'User'}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : 'rotate-0'}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown menu */}
          <div
            className={`absolute right-0 mt-2 w-40 bg-white rounded-2xl shadow-lg border border-gray-100 transition-all duration-200 overflow-hidden
              ${open ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'}`}
          >
            <button
              onClick={handleSignOut}
              className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-100 transition"
            >
              keluar
            </button>
          </div>
        </div>
      </nav>

      <Notification />
    </>
  )
}

export default Navbar
