"use client";
import React, { useState } from "react";
import useClickOutside from "@/hooks/useClickOutside";
import LinkTelegram from "@/public/assets/icons/LinkTelegram";
import LinkWebsite from "@/public/assets/icons/LinkWebsite";
import LinkTwitter from "@/public/assets/icons/LinkTwitter";
import LinkDocs from "@/public/assets/icons/LinkDocs";
import LinkPfp from "@/public/assets/icons/LinkPfp";


interface LinksDropdownProps {
  className?: string;
}

interface LinkItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const LinksDropdown: React.FC<LinksDropdownProps> = ({ className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);


  const dropdownRef = useClickOutside<HTMLDivElement>(() => setIsOpen(false));

  const toggleDropdown = () => setIsOpen((prev) => !prev);

  const links: LinkItem[] = [

    {
      href: "https://about.chonkler.com",
      label: "Website",
      icon: (
        <LinkWebsite/>
      ),
    },

    // {
    //   href: "https://x.com/chonkler777?s=21",
    //   label: "X/Twitter",
    //   icon: (
    //     <LinkTwitter/>
    //   ),
    // },

    {
      href: "https://t.me/chonk777",
      label: "Telegram",
      icon: (
        <LinkTelegram/>
      ),
    },

    {
      href: "https://medium.com/@anonwhale777/chonk-2d93c2cab01a",
      label: "Meme Paper",
      icon: (
        <LinkDocs/>
      ),
    },
    {
      href: "https://pfpmaker.chonkler.com/",
      label: "Pfp maker",
      icon: (
        <LinkPfp/>
      ),
    },
  ];

  return (
    <div
      ref={dropdownRef}
      className={`relative flex ${className}`}
    >
      
      <button
        onClick={toggleDropdown}
        className="text-[#C3C8CC] hover:text-[#86EFAC] transition-colors duration-300 cursor-pointer relative text-[18px] font-roboto inline-flex items-center"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span>Links</span>
        
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="24"
          height="24"
          className={`fill-current transform transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          <path d="M11.9997 13.1714L16.9495 8.22168L18.3637 9.63589L11.9997 16.0001L5.63574 9.63589L7.04996 8.22168L11.9997 13.1714Z"></path>
        </svg>
      </button>

      
      {isOpen && (
        <div className="absolute left-0 top-full  w-40 bg-gray-900 border border-gray-700 rounded-md shadow-md z-50 overflow-hidden">
          <div className="overflow-y-auto">
            <ul className="text-sm text-gray-200 cursor-pointer  divide-y divide-gray-700">
              {links.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex gap-1 font-roboto items-center px-2 py-2 hover:bg-gray-700  "
                  >
                    {link.icon}
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default LinksDropdown;
