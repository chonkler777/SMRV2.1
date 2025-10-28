'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function NavbarLinks() {
  const pathname = usePathname();

  const getLinkClasses = (path: string) => {
    const isActive = pathname === path;
    return isActive
      ? "text-[#86EFAC] duration-300 text-[18px] font-roboto"
      : "hover:text-[#86EFAC] duration-300 text-[18px] font-roboto text-[#C3C8CC]";
  };

  return (
    <div className="hidden lg:flex items-center gap-6 leading-none">
      <Link href="/" className={getLinkClasses("/")}>
        Explore
      </Link>
      <Link href="/Videos" className={getLinkClasses("/Videos")}>
        Videos
      </Link>
      <Link href="/Gifs" className={getLinkClasses("/Gifs")}>
        Gifs
      </Link>
    </div>
  );
}















// 'use client';

// import { usePathname } from 'next/navigation';
// import Link from 'next/link';

// export default function NavbarLinks() {
//   const pathname = usePathname();

//   const getLinkClasses = (path: string) => {
//     const isActive = pathname === path;
//     return isActive 
//       ? "text-[#86EFAC] duration-300 text-[18px] font-roboto"
//       : "hover:text-[#86EFAC] duration-300 text-[18px] font-roboto text-[#C3C8CC]"; 
//   };

//   return (
//     <>
//       <div className="hidden lg:flex space-x-6">
//         <Link
//           href="/"
//           className={getLinkClasses("/")}
//         >
//           Explore
//         </Link>
//       </div>

//       <div className="hidden lg:flex space-x-6">
//         <Link
//           href="/Explore"
//           className={getLinkClasses("/Explore")}
//         >
//           Gif/Videos
//         </Link>
//       </div>
//     </>
//   );
// }