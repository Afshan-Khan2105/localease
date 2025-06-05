import { useEffect, useState } from "react";
import StarRatingDisplay from "./StarRatingDisplay";

interface Rating {
  _key?: string;
  username: string;
  score: number;
  comment: string;
  createdAt: string;
}

interface Props {
  ratings: Rating[];
  user: {
    id: string;
    fullName?: string | null;
    emailAddresses: Array<{ emailAddress: string }>;
  } | null | undefined;
  onNewComment: (score: number, comment: string) => Promise<void>;
}

export default function CommentSection({ ratings, user, onNewComment }: Props) {
  const [score, setScore] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!score || !comment.trim() || !user) return;
    setSubmitting(true);

    try {
      await onNewComment(score, comment);
      setScore(0);
      setComment("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-8">
      <h3 className="font-semibold mb-2">Ratings & Comments</h3>
      <div
        className={`space-y-4 mb-6 ${
          ratings.length > 2 ? "max-h-32 overflow-y-auto pr-2" : ""
        }`}
      >
        {ratings.length === 0 && (
          <div className="text-gray-500 text-sm">No comments yet.</div>
        )}
        {ratings.map((r, idx) => (
          <div key={idx} className="border-b pb-2">
            <div className="flex items-center gap-2">
              <StarRatingDisplay avgRating={r.score} />
              <span className="text-xs text-gray-500">{r.username}</span>
              {r.createdAt && <CommentDate dateString={r.createdAt} />}
            </div>
            <div className="text-gray-700 text-sm mt-1">{r.comment}</div>
          </div>
        ))}
      </div>
      {user ? (
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm">Your Rating:</span>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onClick={() => setScore(star)}
                className="focus:outline-none"
              >
                <svg
                  className="w-6 h-6"
                  fill={score >= star ? "#facc15" : "#d1d5db"}
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.385 2.46a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.385-2.46a1 1 0 00-1.176 0l-3.385 2.46c-.784.57-1.838-.196-1.539-1.118l1.287-3.966a1 1 0 00-.364-1.118l-3.385-2.46c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.286-3.967z" />
                </svg>
              </button>
            ))}
          </div>
          <textarea
            className="w-full border rounded p-2 text-sm"
            rows={3}
            placeholder="Write your comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            disabled={submitting || !score || !comment.trim()}
          >
            {submitting ? "Submitting..." : "Submit"}
          </button>
        </form>
      ) : (
        <div className="text-sm text-gray-500">Login to rate and comment.</div>
      )}
    </div>
  );
}

function CommentDate({ dateString }: { dateString: string }) {
  const [formatted, setFormatted] = useState("");

  useEffect(() => {
    if (dateString) {
      setFormatted(new Date(dateString).toLocaleString());
    }
  }, [dateString]);

  return <span className="text-xs text-gray-400 ml-2">{formatted}</span>;
}