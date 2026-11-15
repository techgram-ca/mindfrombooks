import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Prose } from "@/components/marketing/prose";
import { INSTAGRAM_URL } from "@/lib/utils";

export const metadata: Metadata = {
  title: "About",
  description:
    "mindfrombooks started as an Instagram page sharing book wisdom. This is where the ideas turn into action.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <Prose title="About mindfrombooks" intro="Books teach. Daily action changes you.">
      <p>
        mindfrombooks started on Instagram: one idea from a great book, shared in a way you could
        take in over a coffee. Tens of thousands of readers now follow along.
      </p>
      <p>
        But over time one message kept coming back:{" "}
        <em>“I love these ideas. I just don&apos;t do anything with them.”</em> That&apos;s the
        honest problem with book wisdom. Reading feels like progress. It isn&apos;t, until something
        in your day actually changes.
      </p>
      <h2>So we built the missing half</h2>
      <p>
        Instead of another ebook, each course gives you one small action a day and asks you to write
        down what happened. It&apos;s short on purpose. The point isn&apos;t to know more —
        it&apos;s to do one thing today, then one thing tomorrow.
      </p>
      <p>
        And because we believe in it, there&apos;s a simple promise: do the work every day, and if
        you&apos;re still not happy,{" "}
        <Link href="/guarantee">you get your money back with one click</Link>.
      </p>
      <h2>About the books</h2>
      <p>
        Our courses are inspired by ideas from well-known books, explained in our own words. We
        aren&apos;t affiliated with the authors or publishers, and they haven&apos;t endorsed these
        courses. If a course helps you, read the book — the authors deserve it.
      </p>
      <div className="flex flex-col gap-3 pt-4 sm:flex-row">
        <Button asChild size="lg">
          <Link href="/courses">See the courses</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
            Follow @mindfrombooks
          </a>
        </Button>
      </div>
    </Prose>
  );
}
