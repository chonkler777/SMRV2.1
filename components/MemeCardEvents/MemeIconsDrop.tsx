'use client'

import { useState, useRef, useEffect } from 'react'; 
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify'; 
import CardDownloadButton from './DownloadMeme'
import ShareIcon from '@/public/assets/icons/ShareIcon'
import MoreSvg from '@/public/assets/icons/MoreSvg'
import Tooltip from './ToolTip';
import useClickOutside from '@/hooks/useClickOutside';

interface IconsDropdownProps {
    imageUrl: string;
    docId: string; 
}

const IconsDropdown: React.FC<IconsDropdownProps> = ({ imageUrl, docId }) => {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);
    const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
    
    const dropdownRef = useClickOutside<HTMLDivElement>(() => {
        setIsOpen(false);
        setActiveTooltip(null);
        setHoveredItem(null);
    });

    const itemRefs = {
      share: useRef<HTMLDivElement>(null),
      download: useRef<HTMLDivElement>(null),
    };

    useEffect(() => {
      router.prefetch(`/Meme/${docId}`);
    }, [router, docId]);
  
    const toggleDropdown = () => {
      setIsOpen(!isOpen);
    };
  
    const calculateCenterPosition = (ref: React.RefObject<HTMLElement | null>): number => {
      if (!ref.current) return 0;
      const rect = ref.current.getBoundingClientRect();
      return rect.height / 2;
    };
  
    const handleMouseEnter = (itemName: string) => {
      setHoveredItem(itemName);
      const centerPosition = calculateCenterPosition(itemRefs[itemName as keyof typeof itemRefs]);
      setTimeout(() => {
        setActiveTooltip(itemName);
      });
    };
  
    const handleMouseLeave = () => {
      setHoveredItem(null);
      setActiveTooltip(null);
    };
  
    const getHoverClass = (itemName: string): string => {
      return hoveredItem === itemName ? 'bg-white bg-opacity-60 rounded-[8px]' : '';
    };

    // ✅ Updated handler with copy to clipboard using react-toastify
    const handleShareClick = async () => {
      setIsOpen(false);
      
      // Copy URL to clipboard
      const memeUrl = `${window.location.origin}/Meme/${docId}`;
      
      try {
        await navigator.clipboard.writeText(memeUrl);
        toast.success('Meme link copied!', {
          position: 'top-center',
          autoClose: 2000,
        });
      } catch (error) {
        console.error('Failed to copy:', error);
        toast.error('Failed to copy link', {
          position: 'top-center',
          autoClose: 2000,
        });
      }
      
      // Navigate to the meme page
      router.push(`/Meme/${docId}`, { scroll: false });
    };
  
    return (
      <div ref={dropdownRef} className="relative inline-block bg-[#E5E7EBBF] hover:bg-[#E5E7EB] transition duration-200 p-[2px] rounded-full shadow-[0_3px_7px_rgba(12,18,25,0.7)]">
        <button
          onClick={toggleDropdown}
          className="flex items-center cursor-pointer justify-center duration-200"
        >
          <MoreSvg/>
        </button>
  
        <div
          className={`mt- space-y-2 transition-all duration-200 ease-in-out ${
            isOpen ? 'max-h-60 opacity-100 overflow-visible pb-[5px]' : 'max-h-0 opacity-0 overflow-hidden'
          }`}
        >
          <div
            ref={itemRefs.share}
            className={`relative block transition-colors duration-200 cursor-pointer ${getHoverClass('share')}`}
            onMouseEnter={() => handleMouseEnter('share')}
            onMouseLeave={handleMouseLeave}
            onClick={handleShareClick}
          >
            <ShareIcon/>
            <Tooltip 
              text="Share" 
              visible={activeTooltip === 'share'} 
              itemRef={itemRefs.share}
            />
          </div>
          
          <div 
            ref={itemRefs.download}
            className={`relative transition-colors duration-200 ${getHoverClass('download')}`}
            onMouseEnter={() => handleMouseEnter('download')}
            onMouseLeave={handleMouseLeave}
          >
            <CardDownloadButton imageUrl={imageUrl} />
            <Tooltip 
              text="Download" 
              visible={activeTooltip === 'download'} 
              itemRef={itemRefs.download}
            />
          </div>
        </div>
      </div>
    );
};
  
export default IconsDropdown;













// 'use client'

// import { useState, useRef } from 'react';
// import Link from 'next/link';
// import CardDownloadButton from './DownloadMeme'
// import ShareIcon from '@/public/assets/icons/ShareIcon'
// import MoreSvg from '@/public/assets/icons/MoreSvg'
// import Tooltip from './ToolTip';
// import useClickOutside from '@/hooks/useClickOutside';

// interface IconsDropdownProps {
//     imageUrl: string;
//     docId: string; 
// }

// const IconsDropdown: React.FC<IconsDropdownProps> = ({ imageUrl, docId }) => {
//     const [isOpen, setIsOpen] = useState(false);
//     const [hoveredItem, setHoveredItem] = useState<string | null>(null);
//     const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
    
//     const dropdownRef = useClickOutside<HTMLDivElement>(() => {
//         setIsOpen(false);
//         setActiveTooltip(null);
//         setHoveredItem(null);
//     });

//     const itemRefs = {
//       share: useRef<HTMLAnchorElement>(null), 
//       download: useRef<HTMLDivElement>(null),
//     };
  
//     const toggleDropdown = () => {
//       setIsOpen(!isOpen);
//     };
  
//     const calculateCenterPosition = (ref: React.RefObject<HTMLElement | null>): number => { // ← Changed type
//       if (!ref.current) return 0;
//       const rect = ref.current.getBoundingClientRect();
//       return rect.height / 2;
//     };
  
//     const handleMouseEnter = (itemName: string) => {
//       setHoveredItem(itemName);
//       const centerPosition = calculateCenterPosition(itemRefs[itemName as keyof typeof itemRefs]);
//       setTimeout(() => {
//         setActiveTooltip(itemName);
//       });
//     };
  
//     const handleMouseLeave = () => {
//       setHoveredItem(null);
//       setActiveTooltip(null);
//     };
  
//     const getHoverClass = (itemName: string): string => {
//       return hoveredItem === itemName ? 'bg-white bg-opacity-60 rounded-[8px]' : '';
//     };
  
//     return (
//       <div ref={dropdownRef} className="relative inline-block bg-[#E5E7EBBF] hover:bg-[#E5E7EB] transition duration-200 p-[2px] rounded-full shadow-[0_3px_7px_rgba(12,18,25,0.7)]">
//         <button
//           onClick={toggleDropdown}
//           className="flex items-center cursor-pointer justify-center duration-200"
//         >
//           <MoreSvg/>
//         </button>
  
//         <div
//           className={`mt- space-y-2 transition-all duration-200 ease-in-out ${
//             isOpen ? 'max-h-60 opacity-100 overflow-visible pb-[5px]' : 'max-h-0 opacity-0 overflow-hidden'
//           }`}
//         >
//           <Link 
//             href={`/Meme/${docId}`}
//             scroll={false}
//             ref={itemRefs.share} // ← Now works!
//             prefetch={true}
//             className={`relative block transition-colors duration-200 cursor-pointer ${getHoverClass('share')}`}
//             onMouseEnter={() => handleMouseEnter('share')}
//             onMouseLeave={handleMouseLeave}
//             onClick={() => setIsOpen(false)}
//           >
//             <ShareIcon/>
//             <Tooltip 
//               text="Share" 
//               visible={activeTooltip === 'share'} 
//               itemRef={itemRefs.share}
//             />
//           </Link>
          
//           <div 
//             ref={itemRefs.download}
//             className={`relative transition-colors duration-200 ${getHoverClass('download')}`}
//             onMouseEnter={() => handleMouseEnter('download')}
//             onMouseLeave={handleMouseLeave}
//           >
//             <CardDownloadButton imageUrl={imageUrl} />
//             <Tooltip 
//               text="Download" 
//               visible={activeTooltip === 'download'} 
//               itemRef={itemRefs.download}
//             />
//           </div>
//         </div>
//       </div>
//     );
// };
  
// export default IconsDropdown;











