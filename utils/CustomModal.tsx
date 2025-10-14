import React, { FC } from "react";
import { Modal, Box } from "@mui/material";

import { Icon } from "@iconify/react";

type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
  activeItem: any;
  component: any;
  setRoute?: (route: string) => void;
};

const CustomModal: FC<Props> = ({
  open,
  setOpen,
  setRoute,
  component: Component,

}) => {
  return (
    <>
      <div className="gradient-04 z-0">
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          arial-aria-labelledby="modal-modal-title"
          arial-aria-describedby="modal-modal-description"
        >
          <div className="fixed inset-0 flex items-center justify-center">
          
            <Box className="relative w-[450px] bg-black overflow-hidden text-white rounded-md shadow p-4 mt-[30px] outline-none">
           
              <button
                onClick={() => setOpen(false)}
                className="absolute top-2 right-4"
              >
                <Icon
                  icon="lucide:x"
                  width="25"
                  height="25"
                  className="cursor-pointer text-white "
                />
              </button>
              <Component setOpen={setOpen} setRoute={setRoute} />
            </Box>
          </div>
        </Modal>
      </div>
    </>
  );
};

export default CustomModal;
