"use client";

import { ClerkLoaded, SignedIn, SignInButton, UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import Form from "next/form";
import { FiSearch } from "react-icons/fi";
import { CgShoppingBag } from "react-icons/cg";
import { BiPackage } from "react-icons/bi";
import useBasketStore from "@/store/store";
import { useEffect, useState } from "react";
import { motion, AnimatePresence} from "framer-motion";
import { MdLocationOn } from "react-icons/md";

const placeholders = [
  "Search nearby items",
  "Find local deals",
  "Shop smart today",
  "Discover offers",
  "Trending products",
  "Find it fast",
  "Deals near you",
  "Shop with ease",
  "Quick search",
  "Explore top picks"
];

function Header() {

  const [index, setIndex] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [width, setWidth] = useState<number>(0);

  useEffect(() => {
    // Set initial width
    setWidth(window.innerWidth);

    // Update width on resize
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (inputValue) return; // Stop animation when the user starts typing

    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % placeholders.length);
    }, 3000); // Change text every 3 seconds

    return () => clearInterval(interval);
  }, [inputValue]); // Dependency on inputValue to stop when typing
  
  const {user} = useUser();

  const itemCount = useBasketStore((state) => 
  state.items.reduce((total, item) => total + item.quantity, 0)
);

  const createClerkPasskey = async () => {
   try{
     const respose = await user?.createPasskey();
     console.log(respose);
   } catch (err) {
     console.error("Error: ", JSON.stringify(err, null, 2));
   }
  };

 
 
  return (
    <header className="flex flex-wrap justify-between items-center px-4 py-2 shadow-md" >
        {/* Top Row */}

        <div className="flex w-auto md:w-full flex-wrap justify-between  sm:gap-2 items-center " >

          <div className="md:flex-none justify-between items-center gap-2 flex flex-row w-full lg:w-auto ">
           <Link
            href="/"
            className="text-xl text-black font-bold hover:opacity-80 cursor-pointer mx-auto sm:mx-0 sm:text-2xl hover:scale-105 transition-all duration-150"

            >
             FindIt
            </Link>

            <Form action="/search" className="w-full sm:w-auto sm:flex-1 sm:mx-4  sm:mt-0">
              <div className="relative w-full">
                {/* Input Field */}
                <input
                  type="text"
                  name="query"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="bg-zinc-100 text-zinc-900 px-4 py-2 rounded-lg focus:ring-1 focus:outline-none focus:ring-blue-300 focus:ring-opacity-80 border w-full"
                />
                <button className="absolute right-2 top-2 text-xl opacity-60"><FiSearch/></button>
               

                {/* Animated Placeholder */}
                {!inputValue && (
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={index} // Triggers animation on change
                      className="absolute left-4 top-2 text-zinc-500 pointer-events-none"
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      transition={{ duration: 0.3 }}
                    >
                      {placeholders[index]}
                    </motion.span>
                  </AnimatePresence>
                )}
              </div>
            </Form>

            </div>

            <div className="flex items-center justify-evenly space-x-4 mt-4 sm:mt-0 flex-1 sm:flex-none lg:w-auto w-full" >

            <Link
              href="/nearBy"
              className=" relative flex justify-center sm:justify-start sm:flex-none items-center space-x-2 
                        bg-zinc-800 hover:bg-zinc-900 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300"
            >
              
              <MdLocationOn className="w-6 h-6" />

            </Link>
              
                <Link href="/basket" 
                className="flex-1 relative flex justify-center sm:justify-start sm:flex-none items-center space-x-2 bg-zinc-800 hover:bg-zinc-900
                 text-white font-bold py-2 px-4 rounded-lg">
                  
                <CgShoppingBag className="w-5 h-5" />

                {itemCount !== 0 && (
                  <span className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full
                    w-5 h-5 flex items-center justify-center text-xs">
                    {itemCount}
                  </span>
                )}
                
                <span className={` ${width < 580 ? "hidden md:block" : ""} `}>My Cart</span>
                </Link>

                {/* User */}
                <ClerkLoaded>
                    <SignedIn>
                      <Link href="/orders" className="flex-1 relative flex justify-center sm:justify-start sm:flex-none items-center space-x-2
                                                      bg-zinc-800 hover:bg-zinc-900 text-white font-bold py-2 px-4 rounded-lg">
                        <BiPackage className=" w-5 h-5"/>
                        <span className={` ${ width < 580 ? "hidden md:block" : ""} `} >My Orders</span>

                      </Link>
                   </SignedIn>
                   
                    {user ?(
                        <div className="flex items-center space-x-2">
                            <UserButton/>

                            <div className="hidden sm:block text-xs">
                                <p className="text-gray-400"> Welcome Back</p>
                                <p className="font-bold">{user.fullName}!</p>
                            </div>
                        </div>
                    ) : (
                        <SignInButton mode="modal"/>
                    )}

                    {user?.passkeys.length === 0 && (
                        <button
                            onClick={createClerkPasskey}
                            className="bg-white hover:bg-zinc-800 hover:text-white animate-pulse text-sm md:text-lg  hover:animate-none text-black font-bold py-2 px-4 rounded-lg border-zinc-950 border">
                                { width < 580 ? "PassKey" : "Create PassKey"}
                        </button>
                    )}

                </ClerkLoaded>
            </div>
        </div>
      
    </header>
  );
}

export default Header;
