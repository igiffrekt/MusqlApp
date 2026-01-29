"use client";
import React, { useRef, useState, useEffect } from "react";
import { useScroll, useTransform, motion, MotionValue } from "framer-motion";

export const ContainerScroll = ({
  titleComponent,
  children,
}: {
  titleComponent: string | React.ReactNode;
  children: React.ReactNode;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasScrolled, setHasScrolled] = useState(false);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });
  
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  // Track if user has scrolled
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setHasScrolled(true);
      }
    };
    window.addEventListener("scroll", handleScroll);
    // Check initial position
    if (window.scrollY > 50) {
      setHasScrolled(true);
    }
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scaleDimensions = () => {
    return isMobile ? [0.7, 0.9] : [1.08, 1];
  };

  const rotate = useTransform(scrollYProgress, [0, 0.5], [40, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], scaleDimensions());
  const translate = useTransform(scrollYProgress, [0, 0.5], [0, -100]);

  return (
    <div
      className="h-[50rem] md:h-[60rem] flex items-center justify-center relative p-2 md:p-20"
      ref={containerRef}
    >
      <div
        className="py-6 md:py-16 w-full relative"
        style={{
          perspective: "1000px",
        }}
      >
        <Header translate={hasScrolled ? translate : undefined} titleComponent={titleComponent} />
        <Card rotate={hasScrolled ? rotate : undefined} translate={translate} scale={hasScrolled ? scale : undefined} hasScrolled={hasScrolled} isMobile={isMobile}>
          {children}
        </Card>
      </div>
    </div>
  );
};

export const Header = ({ translate, titleComponent }: any) => {
  return (
    <motion.div
      style={{
        translateY: translate,
      }}
      className="div max-w-5xl mx-auto text-center"
    >
      {titleComponent}
    </motion.div>
  );
};

export const Card = ({
  rotate,
  scale,
  children,
  hasScrolled,
  isMobile,
}: {
  rotate?: MotionValue<number>;
  scale?: MotionValue<number>;
  translate: MotionValue<number>;
  children: React.ReactNode;
  hasScrolled: boolean;
  isMobile: boolean;
}) => {
  return (
    <motion.div
      style={{
        rotateX: hasScrolled ? rotate : 40,
        scale: hasScrolled ? scale : (isMobile ? 0.7 : 1.08),
        boxShadow:
          "0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a, 0 233px 65px #00000003",
      }}
      className="max-w-5xl -mt-12 mx-auto h-[30rem] md:h-[40rem] w-full border-4 border-[#6C6C6C] p-2 md:p-6 bg-[#222222] rounded-[30px] shadow-2xl"
    >
      <div className="h-full w-full overflow-hidden rounded-2xl bg-gray-100 dark:bg-zinc-900 md:rounded-2xl md:p-4">
        {children}
      </div>
    </motion.div>
  );
};
