
"use client";

interface AdminSearchComponentProps {
  searchCandidate: string;
  setSearchCandidate: (value: string) => void;
  minExperience: number;
  setMinExperience: (value: number) => void;
  selectedJobTitle: string;
  setSelectedJobTitle: (value: string) => void;
  availableJobTitles: string[];
  resultCount: number;
  totalCount: number;
}

export function AdminSearchComponent({
  searchCandidate,
  setSearchCandidate,
  minExperience,
  setMinExperience,
  selectedJobTitle,
  setSelectedJobTitle,
  availableJobTitles,
  resultCount,
  totalCount,
}: AdminSearchComponentProps) {
  function clearFilters() {
    setSearchCandidate("");
    setMinExperience(0);
    setSelectedJobTitle("ALL");
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm sm:flex-row">
        {/* Candidate search */}
        <div className="min-w-0 flex-1">
          <label
            htmlFor="candidate-search"
            className="mb-1 block text-[11px] font-bold uppercase text-zinc-500"
          >
            Search Candidate
          </label>

          <input
            id="candidate-search"
            type="text"
            value={searchCandidate}
            onChange={(event) =>
              setSearchCandidate(event.target.value)
            }
            placeholder="Search name or email..."
            className="w-full rounded-lg border border-zinc-200 p-2 text-xs focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* Experience filter */}
        <div className="w-full sm:w-52">
          <label
            htmlFor="min-experience"
            className="mb-1 block text-[11px] font-bold uppercase text-zinc-500"
          >
            Min Experience
          </label>

          <select
            id="min-experience"
            value={minExperience}
            onChange={(event) =>
              setMinExperience(Number(event.target.value))
            }
            className="w-full rounded-lg border border-zinc-200 bg-white p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value={0}>All Experience Levels</option>
            {[1, 2, 3, 5, 6, 7, 8, 9, 10].map((years) => (
              <option key={years} value={years}>
                {years}+ Years
              </option>
            ))}
          </select>
        </div>

        {/* Dynamic job title filter */}
        <div className="w-full sm:w-64">
          <label
            htmlFor="job-title-filter"
            className="mb-1 block text-[11px] font-bold uppercase text-zinc-500"
          >
            Filter by Job Title
          </label>

          <select
            id="job-title-filter"
            value={selectedJobTitle}
            onChange={(event) =>
              setSelectedJobTitle(event.target.value)
            }
            className="w-full rounded-lg border border-zinc-200 bg-white p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="ALL">All Job Titles</option>

            {availableJobTitles.map((title) => (
              <option key={title} value={title}>
                {title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 text-xs text-zinc-500">
        <span>
          {resultCount} of {totalCount} applications
        </span>

        <button
          type="button"
          onClick={clearFilters}
          disabled={
            !searchCandidate &&
            minExperience === 0 &&
            selectedJobTitle === "ALL"
          }
          className="font-medium text-blue-600 hover:text-blue-800 disabled:cursor-not-allowed disabled:text-zinc-400"
        >
          Clear filters
        </button>
      </div>
    </div>
  );
}
