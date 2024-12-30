'use client'
import { useRouter } from "next/navigation";


const NavItems = ({ children, className = '', onClick }) => (
    <div onClick={onClick} className={`flex items-center h-6 gap-1 px-3 py-4 border border-[#444c44] rounded-full hover:bg-gray-800/20 cursor-pointer transition-colors ${className}`}>
      {children}
    </div>
  );
  
  function Navbar() {
    const router = useRouter()
    return (
      <nav>
        <div className="px-1 py-3 flex justify-between border-[#444c44] items-center gap-2 border-b mx-1">
            <NavItems onClick={() => router.push('/dashboard')}>
                dashboard
            </NavItems>
            <NavItems onClick={() => router.push('/tasks')}>
                Tasks
            </NavItems>
        </div>
      </nav>
    )
  }
  
  export default Navbar