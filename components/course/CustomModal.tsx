import React from "react";

const CustomModal = ({ isOpen, onClose, children }: CustomFixedModalProps) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />
      <div className=" fixed inset-y-0 right-0 w-full max-w-md bg-customgreys-secondarybg shadow-lg z-50 overflow-y-auto">
        <div className="p-6">{children}</div>
      </div>
    </>
  );
};

export default CustomModal;
