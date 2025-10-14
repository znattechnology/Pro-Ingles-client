import React, { FC } from 'react';
import { Icon } from "@iconify/react";


type Props = {
  rating: number;
}

const Ratings:FC<Props> = ({rating}) => {
  const stars = [];

  for (let i = 1; i <= 5; i++) {
    if (i<= rating) {
      stars.push(
        <Icon
        icon="lucide:star"
        width="20"
        height="20"
        color='#f6b100'
        className=" mr-2cursor-pointer"
      />
      );
    }else if (i === Math.ceil(rating) && !Number.isInteger(rating)) {
      stars.push(
        <Icon
        icon="lucide:star:half"
        width="10"
        height="10"
        color='#f6b100'
        className=" mr-2cursor-pointer"
      />
      );
    }else {
      stars.push(
        <Icon
        icon="lucide:star:off"
        width="10"
        height="10"
        color='#f6b100'
        className=" mr-2cursor-pointer"
      />
      );
    }
    
  }




  return (
    <div className='flex mt-1 ml-2 800px:mt-0 800px:ml-0'>{stars}</div>
  )
}

export default Ratings