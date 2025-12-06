import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-semibold">Page not found</h1>
      <p className="text-muted-foreground">
        This thread of the maze doesn&apos;t exist. Let&apos;s get you back home.
      </p>
      <Link href="/" className="underline">
        Go to homepage
      </Link>
    </main>
  );
}
