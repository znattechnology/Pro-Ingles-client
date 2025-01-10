import React, { FC } from 'react'
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
type Props = {
    className: string,
    icon:string,
    title:string,
    description:string
    handleClick: () => void;
}

const HomeCard:FC<Props> = ({className,icon,title,description,handleClick}) => {
  return (
    <div className={cn(' bg-opacity-40 px-4 py-6 flex flex-col justify-between w-full xl:max-w-[270px] min-h-[260px] rounded-[14px] cursor-pointer',className)}
        onClick={handleClick}
        >
                <div className='flex-center glassmorphism size-12 rounded-[10px]'>
                <Icon icon={icon} width="30" height="30" />
                </div>
                <div className='flex flex-col gap-2'>
                    <h1 className='text-2xl font-bold'>{title}</h1>
                    <p className='text-xl font-normal'>{description}</p>
                </div>
        </div>
  )
}

export default HomeCard