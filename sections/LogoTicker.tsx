'use client';
import acmeLogo from "@/public/logo-acme.png";
import quanyumLogo from "@/public/logo-quantum.png";
import echoLogo from "@/public/logo-echo.png";
import celestialLogo from "@/public/logo-celestial.png";
import pulseLogo from "@/public/logo-pulse.png";
import apexLogo from "@/public/logo-apex.png";
import Image from "next/image";
import {motion} from "framer-motion";

const LogoTicker = () => {
  return (
    <div className="py-8 overflow-hidden ">
      <div className="container">
        <div className="flex justify-center   [mask-image:linear-gradient(to_right,transparent,black,transparent)]">
          <motion.div className="flex gap-20 flex-none pr-14"
          animate={{
            translateX: "-20%",
          }}

          transition={{
            duration:20,
            repeat: Infinity,
            ease:"linear",
            repeatType:"loop"
          }}
          
          
          >
            <Image src={acmeLogo} alt="acme" className="logo-ticker-image" />
            <Image
              src={quanyumLogo}
              alt="quanyumLogo"
              className="logo-ticker-image"
            />
            <Image
              src={echoLogo}
              alt="echoLogo"
              className="logo-ticker-image"
            />
            <Image
              src={celestialLogo}
              alt="celestialLogo"
              className="logo-ticker-image"
            />
            <Image
              src={pulseLogo}
              alt="pulseLogo"
              className="logo-ticker-image"
            />
            <Image
              src={apexLogo}
              alt="apexLogo"
              className="logo-ticker-image"
            />

            {/* second set of logo */}

            <Image src={acmeLogo} alt="acme" className="logo-ticker-image" />
            <Image
              src={quanyumLogo}
              alt="quanyumLogo"
              className="logo-ticker-image"
            />
            <Image
              src={echoLogo}
              alt="echoLogo"
              className="logo-ticker-image"
            />
            <Image
              src={celestialLogo}
              alt="celestialLogo"
              className="logo-ticker-image"
            />
            <Image
              src={pulseLogo}
              alt="pulseLogo"
              className="logo-ticker-image"
            />
            <Image
              src={apexLogo}
              alt="apexLogo"
              className="logo-ticker-image"
            />

            
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LogoTicker;
