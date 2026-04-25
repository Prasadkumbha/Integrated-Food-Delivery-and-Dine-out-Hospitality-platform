import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';

const ReviewPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  // Fetch order details
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const { data } = await API.get(`/orders/${orderId}`);
        setOrder(data.order);
      } catch (err) {
        setError('Failed to load order details.');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) fetchOrder();
  }, [orderId]);

  // Analyze review quality in real-time
  useEffect(() => {
    if (comment.length < 10) {
      setAnalysis(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setAnalyzing(true);
        const { data } = await API.post('/ai/analyze-review', { comment });
        setAnalysis(data.analysis);
      } catch (err) {
        console.log('Analysis failed:', err);
      } finally {
        setAnalyzing(false);
      }
    }, 800); // debounce — wait 800ms after user stops typing

    return () => clearTimeout(timer);
  }, [comment]);

  // Submit review
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const { data } = await API.post(`/reviews/${orderId}`, {
        rating,
        comment,
      });

      setSuccess(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  // Quality label color
  const getQualityColor = (label) => {
    if (label?.includes('Excellent')) return 'text-green-500';
    if (label?.includes('Good')) return 'text-blue-500';
    return 'text-yellow-500';
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <p className='text-gray-500'>Loading...</p>
      </div>
    );
  }

  // Success Screen
  if (success) {
    return (
      <div className='flex flex-col items-center justify-center min-h-screen p-6'>
        <div className='bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center'>
          <span className='text-8xl mb-4 block'>🎉</span>
          <h2 className='text-2xl font-bold text-green-600 mb-2'>
            Review Submitted!
          </h2>
          <p className='text-gray-500 mb-6'>
            Thank you for your feedback!
          </p>

          {/* Loyalty Points */}
          <div className='bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6'>
            <p className='text-yellow-600 text-sm font-semibold'>
              🏆 Loyalty Points Earned
            </p>
            <p className='text-4xl font-bold text-yellow-500 mt-1'>
              +{success.review?.loyaltyPoints}
            </p>
            <p className='text-yellow-600 text-sm mt-1'>
              {success.rewardMessage}
            </p>
          </div>

          {/* Sentiment */}
          <div className='bg-gray-50 rounded-xl p-4 mb-6'>
            <p className='text-sm text-gray-500'>Review Sentiment</p>
            <p className='font-bold text-lg capitalize mt-1'>
              {success.review?.sentiment === 'positive' && '😊 Positive'}
              {success.review?.sentiment === 'negative' && '😞 Negative'}
              {success.review?.sentiment === 'neutral' && '😐 Neutral'}
            </p>
          </div>

          <div className='flex flex-col gap-3'>
            <button
              onClick={() => navigate('/my-orders')}
              className='bg-orange-500 text-white p-3 rounded-xl font-semibold hover:bg-orange-600'
            >
              Back to My Orders
            </button>
            <button
              onClick={() => navigate('/restaurants')}
              className='bg-gray-100 text-gray-700 p-3 rounded-xl font-semibold hover:bg-gray-200'
            >
              Order Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='max-w-2xl mx-auto p-6'>
      {/* Header */}
      <div className='flex items-center gap-4 mb-6'>
        <button
          onClick={() => navigate('/my-orders')}
          className='text-gray-500 hover:text-gray-700'
        >
          ← Back
        </button>
        <h1 className='text-2xl font-bold text-gray-800'>
          ⭐ Write a Review
        </h1>
      </div>

      {/* Restaurant Info */}
      <div className='bg-white rounded-xl shadow p-4 mb-6'>
        <p className='text-sm text-gray-500'>Reviewing order from</p>
        <p className='font-bold text-gray-800 text-lg'>
          {order?.restaurant?.name}
        </p>
        <div className='mt-3 flex flex-wrap gap-2'>
          {order?.items?.map((item, index) => (
            <span
              key={index}
              className='bg-orange-50 text-orange-600 text-xs px-3 py-1 rounded-full'
            >
              {item.name} × {item.quantity}
            </span>
          ))}
        </div>
      </div>

      {/* Review Form */}
      <form onSubmit={handleSubmit}>
        {/* Star Rating */}
        <div className='bg-white rounded-xl shadow p-6 mb-4'>
          <h2 className='font-bold text-gray-800 mb-4'>
            How was your experience?
          </h2>
          <div className='flex justify-center gap-3 mb-2'>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type='button'
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className='text-5xl transition-transform hover:scale-110'
              >
                <span
                  className={
                    star <= (hoveredRating || rating)
                      ? 'text-yellow-400'
                      : 'text-gray-200'
                  }
                >
                  ★
                </span>
              </button>
            ))}
          </div>
          <p className='text-center text-gray-500 text-sm'>
            {rating === 1 && '😞 Poor'}
            {rating === 2 && '😐 Fair'}
            {rating === 3 && '🙂 Good'}
            {rating === 4 && '😊 Very Good'}
            {rating === 5 && '🤩 Excellent!'}
            {rating === 0 && 'Tap a star to rate'}
          </p>
        </div>

        {/* Comment Box */}
        <div className='bg-white rounded-xl shadow p-6 mb-4'>
          <h2 className='font-bold text-gray-800 mb-2'>
            Share your experience
          </h2>
          <p className='text-sm text-gray-500 mb-3'>
            More details = more loyalty points! 🏆
          </p>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder='Tell others about the food quality, delivery speed, packaging...'
            rows={5}
            className='w-full border p-3 rounded-lg resize-none focus:outline-none focus:border-orange-400'
          />
          <div className='flex justify-between text-xs text-gray-400 mt-1'>
            <span>{comment.trim().split(/\s+/).filter(Boolean).length} words</span>
            <span>50+ words = maximum points!</span>
          </div>
        </div>

        {/* Real-time Review Analysis */}
        {(analysis || analyzing) && (
          <div className='bg-white rounded-xl shadow p-6 mb-4'>
            <h2 className='font-bold text-gray-800 mb-3'>
              📊 Review Quality Analysis
            </h2>

            {analyzing ? (
              <p className='text-gray-400 text-sm'>Analyzing your review...</p>
            ) : analysis ? (
              <div>
                {/* Quality Score Bar */}
                <div className='mb-4'>
                  <div className='flex justify-between text-sm mb-1'>
                    <span className='text-gray-500'>Quality Score</span>
                    <span
                      className={`font-bold ${getQualityColor(
                        analysis.qualityLabel
                      )}`}
                    >
                      {analysis.qualityLabel}
                    </span>
                  </div>
                  <div className='w-full bg-gray-100 rounded-full h-3'>
                    <div
                      className='bg-orange-500 h-3 rounded-full transition-all duration-500'
                      style={{ width: `${analysis.qualityScore}%` }}
                    />
                  </div>
                  <p className='text-xs text-gray-400 mt-1'>
                    {analysis.qualityScore}/100
                  </p>
                </div>

                {/* Estimated Points */}
                <div className='bg-yellow-50 rounded-lg p-3 mb-4'>
                  <p className='text-sm text-yellow-600'>
                    🏆 Estimated Loyalty Points
                  </p>
                  <p className='text-2xl font-bold text-yellow-500'>
                    +{analysis.estimatedLoyaltyPoints}
                  </p>
                </div>

                {/* Feedback */}
                <div className='flex flex-col gap-2'>
                  {analysis.feedback.map((tip, index) => (
                    <p key={index} className='text-sm text-gray-600'>
                      {tip}
                    </p>
                  ))}
                </div>

                {/* Keywords Found */}
                {analysis.foundKeywords.length > 0 && (
                  <div className='mt-3'>
                    <p className='text-xs text-gray-500 mb-2'>
                      Descriptive keywords found:
                    </p>
                    <div className='flex flex-wrap gap-2'>
                      {analysis.foundKeywords.map((kw) => (
                        <span
                          key={kw}
                          className='bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full'
                        >
                          ✓ {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}

        {/* Error */}
        {error && (
          <p className='text-red-500 text-sm mb-4 text-center'>{error}</p>
        )}

        {/* Submit Button */}
        <button
          type='submit'
          disabled={submitting || rating === 0}
          className='w-full bg-orange-500 text-white p-4 rounded-xl font-bold text-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {submitting ? '⏳ Submitting...' : '🎉 Submit Review & Earn Points'}
        </button>
      </form>
    </div>
  );
};

export default ReviewPage;