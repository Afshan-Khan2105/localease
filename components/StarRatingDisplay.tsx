type Props = { avgRating: number };

export default function StarRatingDisplay({ avgRating }: Props) {
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => {
        let fill = "#d1d5db";
        if (avgRating >= star) fill = "#facc15";
        else if (avgRating >= star - 0.5) fill = "url(#half)";
        return (
          <svg
            key={star}
            className="w-5 h-5 mr-0.5"
            fill={fill}
            viewBox="0 0 20 20"
          >
            <defs>
              <linearGradient id="half">
                <stop offset="50%" stopColor="#facc15" />
                <stop offset="50%" stopColor="#d1d5db" />
              </linearGradient>
            </defs>
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.385 2.46a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.385-2.46a1 1 0 00-1.176 0l-3.385 2.46c-.784.57-1.838-.196-1.539-1.118l1.287-3.966a1 1 0 00-.364-1.118l-3.385-2.46c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.286-3.967z" />
          </svg>
        );
      })}
      <span className="ml-2 text-sm text-gray-700">{avgRating.toFixed(1)}</span>
    </div>
  );
}