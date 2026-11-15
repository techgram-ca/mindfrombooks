import Image from "next/image";
import type { CourseBook } from "@/lib/types";

/**
 * Our own "Inspired by" card: title + author as styled text on a coloured
 * card. Never an official publisher cover. If the admin uploaded their own
 * image, that is shown instead.
 */
export function BookCard({ book, color }: { book: CourseBook; color: string }) {
  if (book.image_url) {
    return (
      <figure className="w-36 shrink-0">
        <Image
          src={book.image_url}
          alt={`${book.title} by ${book.author}`}
          width={288}
          height={400}
          className="shadow-soft h-48 w-36 rounded-xl object-cover"
        />
      </figure>
    );
  }
  return (
    <div
      className="shadow-soft relative flex h-48 w-36 shrink-0 flex-col justify-between overflow-hidden rounded-xl p-4 text-white"
      style={{ background: `linear-gradient(155deg, ${color}, #172033 130%)` }}
    >
      <span aria-hidden className="absolute inset-y-0 left-2 w-px bg-white/25" />
      <span className="pl-2 text-[10px] font-medium tracking-[0.18em] uppercase opacity-80">
        Inspired by
      </span>
      <div className="pl-2">
        <p className="font-serif text-[17px] leading-tight font-semibold">{book.title}</p>
        <p className="mt-2 text-xs opacity-85">{book.author}</p>
      </div>
    </div>
  );
}
