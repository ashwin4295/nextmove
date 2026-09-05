import { HeroFork } from "@/components/HeroFork";
import { Landing } from "./landing";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ src?: string }>;
}) {
  const { src } = await searchParams;
  return <Landing source={src ?? ""} heroArt={<HeroFork />} />;
}
