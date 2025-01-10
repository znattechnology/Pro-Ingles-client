

'use client';
import { useState } from "react";
import { motion } from 'framer-motion';
import { navigation } from "../constants";
import styles from '../styles';
import { navVariants } from '../utils/motion';
import { usePathname } from 'next/navigation';
import { HamburgerMenu } from "./design/Header";
import { disablePageScroll, enablePageScroll } from "scroll-lock";

import Image from "next/image";
import Button from "./Button";
import MenuSvg from "@/public/svg/MenuSvg";
import Login from "@/components/auth/Login";
import SignUp from "@/components/auth/Sign-Up";
import Verification from "@/components/auth/verification";
import { useSelector } from "react-redux";
import CustomModal from "@/utils/CustomModal";

type Props = {}

const Navbar = (props: Props) => {
  const pathname = usePathname();
  const [openNavigation, setOpenNavigation] = useState(false);

  const [open, setOpen] = useState(false);
  const [activeItem, setActiveItem] = useState(0);
  const [route, setRoute] = useState("Login");
  const toggleNavigation = () => {
    if (openNavigation) {
      setOpenNavigation(false);
      enablePageScroll();
    } else {
      setOpenNavigation(true);
      disablePageScroll();
    }
  };

  const handleClick = () => {
    if (!openNavigation) return;

    enablePageScroll();
    setOpenNavigation(false);
  };
  return (
    <motion.nav
    variants={navVariants}
    initial="hidden"
    whileInView="show"
    className={`${styles.xPaddings} py-4 relative`}
  >
    <div className="absolute w-[50%] inset-0 gradient-01" />
    <div
      className={`${styles.innerWidth} mx-auto flex justify-between gap-8`}
    >
      <a className="block w-[12rem] xl:mr-8" href="#hero">
          
        </a>
      {/* <h2 className="font-extrabold text-[24px] leading-[30.24px] text-white">
        METAVERSUS
      </h2> */}

<nav
          className={`${
            openNavigation ? "flex" : "hidden"
          } fixed top-[5rem] left-0 right-0 bottom-0 bg-n-8 lg:static lg:flex lg:mx-auto lg:bg-transparent`}
        >
          <div className="relative z-2 flex flex-col items-center justify-center m-auto lg:flex-row">
            {navigation.map((item) => (
              <a
                key={item.id}
                href={item.url}
                onClick={handleClick}
                className={`block relative font-code text-2xl uppercase text-n-1 transition-colors hover:text-color-1 ${
                  item.onlyMobile ? "lg:hidden" : ""
                } px-6 py-6 md:py-8 lg:-mr-0.25 lg:text-xs lg:font-semibold ${
                  item.url === pathname
                    ? "z-2 lg:text-n-1"
                    : "lg:text-n-1/50"
                } lg:leading-5 lg:hover:text-n-1 xl:px-12`}
              >
                {item.title}
              </a>
            ))}
          </div>

          <HamburgerMenu />
        </nav>

        {/* <a
          href="#signup"
          className="button hidden mr-8 text-n-1/50 transition-colors hover:text-n-1 lg:block"
        >
          New account
        </a> */}
        <button className="hidden lg:flex" onClick={() => setOpen(true)}>
          Login
        </button>

        <button
          className="ml-auto lg:hidden px-3"
         
          onClick={toggleNavigation}
        >
          <MenuSvg openNavigation={openNavigation} />
        </button>
      {/* <img
        src="/menu.svg"
        alt="menu"
        className="w-[24px] h-[24px] object-contain"
      /> */}
            {route === "Login" && (
        <>
          {open && (
            <CustomModal
              open={open}
              setOpen={setOpen}
              setRoute={setRoute}
              activeItem={activeItem}
              component={Login}
            />
          )}
        </>
      )}
      {route === "SignUp" && (
        <>
          {open && (
            <CustomModal
              open={open}
              setOpen={setOpen}
              setRoute={setRoute}
              activeItem={activeItem}
              component={SignUp}
            />
          )}
        </>
      )}

      {route === "verification" && (
        <>
          {open && (
            <CustomModal
              open={open}
              setOpen={setOpen}
              setRoute={setRoute}
              activeItem={activeItem}
              component={Verification}
            />
          )}
        </>
      )}
    </div>
  </motion.nav>
  )
}

export default Navbar
















// const Navbar = () => {

//   const pathname = usePathname();
//   const [openNavigation, setOpenNavigation] = useState(false);

//   const toggleNavigation = () => {
//     if (openNavigation) {
//       setOpenNavigation(false);
//       enablePageScroll();
//     } else {
//       setOpenNavigation(true);
//       disablePageScroll();
//     }
//   };

//   const handleClick = () => {
//     if (!openNavigation) return;

//     enablePageScroll();
//     setOpenNavigation(false);
//   };
//   return (
//     <motion.nav
//     variants={navVariants}
//     initial="hidden"
//     whileInView="show"
//     className={`${styles.xPaddings} py-8 relative`}
//   >
//     <div className="absolute w-[50%] inset-0 gradient-01" />
//     <div
//       className={`${styles.innerWidth} mx-auto flex justify-between gap-8`}
//     >
//       <img
//         src="/search.svg"
//         alt="search"
//         className="w-[24px] h-[24px] object-contain"
//       />
//       {/* <h2 className="font-extrabold text-[24px] leading-[30.24px] text-white">
//         METAVERSUS
//       </h2> */}

// <nav
//           className={`${
//             openNavigation ? "flex" : "hidden"
//           } fixed top-[5rem] left-0 right-0 bottom-0 bg-n-8 lg:static lg:flex lg:mx-auto lg:bg-transparent`}
//         >
//           <div className="relative z-2 flex flex-col items-center justify-center m-auto lg:flex-row">
//             {navigation.map((item) => (
//               <a
//                 key={item.id}
//                 href={item.url}
//                 onClick={handleClick}
//                 className={`block relative font-code text-2xl uppercase text-n-1 transition-colors hover:text-color-1 ${
//                   item.onlyMobile ? "lg:hidden" : ""
//                 } px-6 py-6 md:py-8 lg:-mr-0.25 lg:text-xs lg:font-semibold ${
//                   item.url === pathname
//                     ? "z-2 lg:text-n-1"
//                     : "lg:text-n-1/50"
//                 } lg:leading-5 lg:hover:text-n-1 xl:px-12`}
//               >
//                 {item.title}
//               </a>
//             ))}
//           </div>

//           <HamburgerMenu />
//         </nav>
//       <img
//         src="/menu.svg"
//         alt="menu"
//         className="w-[24px] h-[24px] object-contain"
//       />
//     </div>
//   </motion.nav>
//   )
 
//               };

// export default Navbar;
