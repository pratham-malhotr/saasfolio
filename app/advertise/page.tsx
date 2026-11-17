import { permanentRedirect } from "next/navigation";

// Preserve old inbound links after switching to affiliate-funded publishing.
export default function Page() {
  permanentRedirect("/affiliate-disclosure");
}
