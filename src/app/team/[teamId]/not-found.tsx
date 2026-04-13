import Link from "next/link";

export default function TeamNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center">
      <h1 className="mb-2 text-2xl font-bold text-text-primary">
        Team Not Found
      </h1>
      <p className="mb-6 text-sm text-text-secondary">
        The team you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link
        href="/"
        className="rounded-lg bg-text-primary px-4 py-2 text-sm font-medium text-bg transition-opacity hover:opacity-90"
      >
        Back to Home
      </Link>
    </div>
  );
}
