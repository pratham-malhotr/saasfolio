import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ResearchPhoto } from "@/lib/data/research-photography";
import "./research-photo.css";

export function ResearchPhotoPanel({ photo, heading, links }: {
  photo: ResearchPhoto;
  heading: string;
  links: readonly { label: string; href: string }[];
}) {
  return (
    <div className="research-photo-panel hosting-enter">
      <figure>
        <div className="research-photo-frame">
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            sizes="(max-width: 767px) 100vw, (max-width: 1280px) 46vw, 540px"
            loading="eager"
          />
        </div>
        <figcaption className="research-photo-credit">
          Reference photo by <a href={photo.credit.sourceUrl}>{photo.credit.author}</a>
        </figcaption>
      </figure>
      <nav aria-label={heading} className="research-photo-links">
        <h2>{heading}</h2>
        <ul>
          {links.map(link => (
            <li key={link.href}>
              <Link href={link.href} prefetch={false}>
                {link.label} <ArrowUpRight size={15} aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
