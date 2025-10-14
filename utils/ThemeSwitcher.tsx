'use client';

import React, { useEffect, useState } from 'react';
import {BiMoon, BiSun} from "react-icons/bi";

type Props = {}

const ThemeSwitcher = (props: Props) => {
    const [mounted , setMounted] = useState(false);
    const [theme, setTheme ] = useState();

    useEffect(() => {
        setMounted(true);
    },[]);

    if (!mounted) {
        return null;
    }

  return (
    <div className='flex items-center justify-center mx-4'>
        {
            theme === "light" ? (
                <BiMoon 
                className='cursor-point ' 
                fill='black' 
                size={25} 
                // onClick={()=>setTheme("")} 
                />
            ) : (
                <BiSun
                className='cursor-point ' 
                fill='black' 
                size={25} 
                // onClick={()=>setTheme("")}
                
                />
            )
        }
    </div>
  )
}

export default ThemeSwitcher