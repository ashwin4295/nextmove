import fs from "fs";
import path from "path";
import Image from "next/image";
import { ForkSketch } from "./ForkSketch";

export function HeroFork() {
  const pngPath = path.join(process.cwd(), "public", "fork.png");
  const hasPng = fs.existsSync(pngPath);
  if (hasPng) {
    return (
      <Image
        src="/fork.png"
        alt=""
        width={800}
        height={1000}
        className="h-auto w-full"
      />
    );
  }
  return <ForkSketch />;
}
