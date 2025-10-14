import React from 'react';

const HeaderAdmin = ({ category, title }) => {
  return (
    <div className=" mb-4">
    <p className="font-bold text-2xl text-sky-500">{category}</p>
    <p className="text-[24px] ml-20   text-sky-500">
    {title}
    </p>
  </div>
  )

};

export default HeaderAdmin;
