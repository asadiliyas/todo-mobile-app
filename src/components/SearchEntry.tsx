import Link from "next/link";
import { Search } from "lucide-react";

/** The Figma's search bar on Home — tapping it goes to the dedicated
 *  Search screen where the keyboard opens immediately. */
export function SearchEntry() {
  return (
    <Link
      href="/search"
      className="flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-400 transition-colors hover:border-slate-300"
    >
      <span className="text-[15px]">Search for a task</span>
      <Search className="ml-auto h-4 w-4" />
    </Link>
  );
}
