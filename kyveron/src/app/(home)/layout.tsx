import { StoreShell } from "@/components/site/StoreShell";

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return <StoreShell headerTone="overlay">{children}</StoreShell>;
}
