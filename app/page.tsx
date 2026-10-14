import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { Features } from "@/components/features";
import { Footer } from "@/components/footer";
import { AssistantLauncher } from "@/components/assistant-launcher";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Features />
      <Footer />
      <AssistantLauncher />
    </main>
  );
}
