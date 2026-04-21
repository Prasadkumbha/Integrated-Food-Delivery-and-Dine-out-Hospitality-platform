import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setReviewText,
  setMedia,
  toggleKeyword,
  calculatePointsPreview,
  clearReview,
} from "../features/review/reviewSlice";

function ReviewPage() {
  const dispatch = useDispatch();
  const {
    reviewText,
    media,
    suggestedKeywords,
    selectedKeywords,
    pointsPreview,
  } = useSelector((state) => state.review);

  useEffect(() => {
    dispatch(calculatePointsPreview());
  }, [reviewText, selectedKeywords, media, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Review submitted (frontend only)");
    dispatch(clearReview());
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-3xl rounded-2xl bg-slate-900 p-6 shadow-lg">
        <h1 className="mb-6 text-3xl font-bold">Write a Review</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium">Your Review</label>
            <textarea
              value={reviewText}
              onChange={(e) => dispatch(setReviewText(e.target.value))}
              rows="6"
              placeholder="Write about your food and delivery experience..."
              className="w-full rounded-xl border border-slate-700 bg-slate-800 p-4 text-white outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Upload Media</label>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={(e) => dispatch(setMedia(e.target.files[0] || null))}
              className="block w-full rounded-xl border border-slate-700 bg-slate-800 p-3"
            />
            {media && (
              <p className="mt-2 text-sm text-slate-300">
                Selected: {media.name}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Suggested Keywords
            </label>
            <div className="flex flex-wrap gap-3">
              {suggestedKeywords.map((keyword) => (
                <button
                  type="button"
                  key={keyword}
                  onClick={() => dispatch(toggleKeyword(keyword))}
                  className={`rounded-full px-4 py-2 text-sm font-medium ${
                    selectedKeywords.includes(keyword)
                      ? "bg-orange-500 text-white"
                      : "bg-slate-800 text-slate-300"
                  }`}
                >
                  {keyword}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-slate-800 p-4">
            <p className="text-lg font-semibold">Points Preview: {pointsPreview}</p>
            <p className="mt-1 text-sm text-slate-400">
              More words, selected keywords, and media can increase points.
            </p>
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-green-600 px-4 py-3 font-semibold hover:bg-green-700"
          >
            Submit Review
          </button>
        </form>
      </div>
    </div>
  );
}

export default ReviewPage;