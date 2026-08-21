import ZoomRoot from "@/components/scroll/ZoomRoot";
import SemanticOutline from "@/components/SemanticOutline";
import LanguageToggle from "@/components/ui/LanguageToggle";

export default function Home() {
  return (
    <main>
      <SemanticOutline />
      <LanguageToggle />
      <ZoomRoot />
    </main>
  );
}
