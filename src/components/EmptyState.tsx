interface EmptyStateProps {
  onSuggestionClick: (suggestion: string) => void
}

export default function EmptyState({ onSuggestionClick }: EmptyStateProps) {
  const suggestions = ['Cody', 'Maltese', 'James', 'Active pets']

  return (
    <div className="flex min-h-[calc(100vh-var(--header-height)-3rem)] items-center justify-center !p-10">
      <div className="max-w-[560px] space-y-4 text-center">
        <div className="mb-6 flex justify-center text-gray-400">
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </div>

        <h2 className="mb-3 text-[2rem] leading-tight font-bold text-gray-800">
          Search for Animals
        </h2>

        <p className="mb-10 text-lg leading-relaxed text-gray-600">
          Enter an animal name, breed, or owner in the search box above to find
          grooming records.
        </p>

        <div className="rounded-xl border border-gray-200 bg-gray-50 !p-8">
          <p className="mb-4 text-xs font-semibold tracking-wider text-gray-700 uppercase">
            Try searching for:
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {suggestions.map(suggestion => (
              <button
                key={suggestion}
                onClick={() => onSuggestionClick(suggestion)}
                className="hover:border-primary hover:bg-primary-light hover:text-primary cursor-pointer rounded-full border border-gray-300 bg-white !px-4 !py-2 text-sm font-medium text-gray-700 transition-all hover:-translate-y-1 hover:shadow-sm"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
