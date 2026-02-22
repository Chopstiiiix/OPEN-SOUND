"use client";

import Plasma from "@/components/ui/Plasma";

export default function HeroPlasma() {
  return (
    <Plasma
      color="#e7ad0d"
      speed={0.6}
      direction="forward"
      scale={1.1}
      opacity={0.8}
      mouseInteractive={true}
    />
  );
}
