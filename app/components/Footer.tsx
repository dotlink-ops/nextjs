import Link from "next/link";

const footerLinks = [
  { href: "#privacy", label: "Privacy" },
  { href: "#terms", label: "Terms" },
  { href: "mailto:hello@avidelta.com", label: "Contact" },
];

const socialLinks = [
  { href: "https://www.linkedin.com", label: "LinkedIn" },
  { href: "https://twitter.com", label: "Twitter / X" },
  { href: "https://github.com", label: "GitHub" },
];

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-zinc-200 bg-white py-10 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-black dark:text-zinc-400">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 lg:flex-row lg:items-start lg:justify-between lg:px-8">
        <div className="max-w-md space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-lg font-bold text-white dark:bg-white dark:text-black">
              A
            </div>
            <div>
              <p className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Avidelta</p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Advisory & ops systems for ambitious teams.</p>
            </div>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            We partner with founders to design resilient systems across strategy, operations, and technology.
          </p>
        </div>

        <div className="grid flex-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Explore</p>
            <div className="flex flex-col gap-2">
              {footerLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="transition hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black dark:hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Connect</p>
            <div className="flex flex-col gap-2">
              {socialLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="transition hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black dark:hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Newsletter</p>
            <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              Get monthly insights on scaling operations and technology without the noise.
            </p>
            <Link
              href="#contact"
              className="inline-flex w-fit items-center gap-2 rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-800 transition hover:border-zinc-900 hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black dark:border-zinc-700 dark:text-zinc-100 dark:hover:border-white"
            >
              Say hello
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-8 px-4 text-center text-xs text-zinc-500 dark:text-zinc-500 lg:px-8">
        © {new Date().getFullYear()} Avidelta. All rights reserved.
      </div>
    </footer>
  );
}
