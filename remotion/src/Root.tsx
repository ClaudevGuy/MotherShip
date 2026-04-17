import React from "react";
import { Composition } from "remotion";
import { MothershipHero } from "./MothershipHero";
import { timing } from "./theme";

// The Root registers every composition available in the Studio and for
// rendering. For now we have one — the landing hero loop.
export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="MothershipHero"
        component={MothershipHero}
        durationInFrames={timing.durationInFrames}
        fps={timing.fps}
        width={1920}
        height={1080}
      />
    </>
  );
};
