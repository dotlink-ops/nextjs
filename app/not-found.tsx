import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-white to-zinc-100 px-6 text-center dark:from-zinc-950 dark:to-black">
      <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
        404 error
      </p>
      <h1 className="mb-3 text-4xl font-semibold tracking-tight text-zinc-900 dark:text-white">
        Page not found
      </h1>
      <p className="max-w-xl text-lg text-zinc-600 dark:text-zinc-300">
        We couldn&apos;t find the page you&apos;re looking for. Check the URL or return to the homepage to continue exploring Avidelta.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center justify-center rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black dark:bg-white dark:text-black dark:hover:bg-zinc-200"
      >
        Back to home
      </Link>
    </main>
  )
}
