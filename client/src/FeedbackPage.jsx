import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Send, CheckCircle, AlertTriangle } from 'lucide-react';

export default function FeedbackPage({ shortCode }) {
  const [stand, setStand] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const API_HOST = 'http://localhost:5000';

  useEffect(() => {
    // Fetch public stand details
    fetch(`${API_HOST}/api/public/stands/${shortCode}`)
      .then((res) => {
        if (!res.ok) throw new Error('Invalid stand code');
        return res.json();
      })
      .then((data) => {
        setStand(data.stand);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('We couldn\'t load this page. Please try scanning the QR code again.');
        setLoading(false);
      });
  }, [shortCode]);

  const handleStarClick = (selectedRating) => {
    setRating(selectedRating);
    
    // If 4 or 5 stars, redirect directly to the review URL after a small delay
    if (selectedRating >= 4) {
      setSubmitting(true);
      // Log rating in background
      fetch(`${API_HOST}/api/public/stands/${shortCode}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: selectedRating, feedbackText: 'Redirected to review platform.' })
      }).finally(() => {
        setTimeout(() => {
          let target = stand.target_url;
          if (!/^https?:\/\//i.test(target)) {
            target = `https://${target}`;
          }
          window.location.href = target;
        }, 1500);
      });
    }
  };

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) return;
    
    setSubmitting(true);
    fetch(`${API_HOST}/api/public/stands/${shortCode}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating, feedbackText })
    })
      .then((res) => {
        if (!res.ok) throw new Error('Submission failed');
        setSubmitted(true);
      })
      .catch((err) => console.error(err))
      .finally(() => setSubmitting(false));
  };

  if (loading) {
    return (
      <div className="feedback-layout">
        <div className="feedback-card glass-panel loading-shimmer">
          <div className="shimmer-line header"></div>
          <div className="shimmer-line text"></div>
          <div className="shimmer-line stars"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="feedback-layout">
        <div className="feedback-card glass-panel error-card">
          <AlertTriangle size={48} color="#ef4444" />
          <h2>Oops!</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="feedback-layout">
      <div className="feedback-card glass-panel">
        <div className="header-logo">
          {/* Brand/Client Name */}
          <h3>{stand.name}</h3>
        </div>

        {!submitted && rating < 4 ? (
          <>
            <h1 className="title-gradient">How was your experience?</h1>
            <p className="subtitle">Your feedback helps us serve you better every day.</p>
            
            <div className="stars-container">
              {[1, 2, 3, 4, 5].map((starValue) => (
                <button
                  key={starValue}
                  type="button"
                  className="star-btn"
                  onClick={() => handleStarClick(starValue)}
                  onMouseEnter={() => setHoverRating(starValue)}
                  onMouseLeave={() => setHoverRating(0)}
                >
                  <Star
                    size={42}
                    className={`star-icon ${
                      (hoverRating || rating) >= starValue ? 'filled' : ''
                    }`}
                  />
                </button>
              ))}
            </div>

            {rating > 0 && rating < 4 && (
              <form onSubmit={handleFeedbackSubmit} className="feedback-form">
                <div className="form-group">
                  <label htmlFor="feedback">Tell us how we can improve:</label>
                  <textarea
                    id="feedback"
                    className="glass-input"
                    rows={4}
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Describe your experience..."
                    required
                  ></textarea>
                </div>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Submitting...' : (
                    <>
                      Submit Feedback <Send size={16} />
                    </>
                  )}
                </button>
              </form>
            )}
          </>
        ) : rating >= 4 ? (
          <div className="success-state">
            <div className="animated-ring">
              <CheckCircle size={64} color="#10b981" />
            </div>
            <h2 className="title-gradient">Amazing!</h2>
            <p>Redirecting you to our review page to share your experience with others...</p>
            <div className="loader-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        ) : (
          <div className="success-state">
            <CheckCircle size={64} color="#10b981" />
            <h2 className="title-gradient">Thank you!</h2>
            <p>Your feedback has been submitted privately to our management team. We appreciate your valuable input.</p>
          </div>
        )}
      </div>

      <style>{`
        .feedback-layout {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 1.5rem;
        }
        .feedback-card {
          width: 100%;
          max-width: 460px;
          padding: 2.5rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
        }
        .header-logo h3 {
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
          font-size: 0.85rem;
          color: var(--text-muted);
          border-bottom: 1px solid rgba(255,255,255,0.05);
          padding-bottom: 0.5rem;
          margin-bottom: 0.5rem;
        }
        .subtitle {
          color: var(--text-secondary);
          font-size: 0.95rem;
        }
        .stars-container {
          display: flex;
          gap: 0.5rem;
          margin: 1rem 0;
        }
        .star-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.25rem;
          outline: none;
          transition: transform 0.15s ease;
        }
        .star-btn:hover {
          transform: scale(1.15);
        }
        .star-icon {
          color: rgba(255,255,255,0.15);
          transition: color 0.15s ease, fill 0.15s ease;
        }
        .star-icon.filled {
          color: #fbbf24;
          fill: #fbbf24;
          filter: drop-shadow(0 0 8px rgba(251, 191, 36, 0.4));
        }
        .feedback-form {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
          text-align: left;
          animation: fadeIn 0.3s ease-in-out;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .form-group label {
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--text-secondary);
        }
        .success-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          animation: scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .loader-dots {
          display: flex;
          gap: 0.3rem;
          margin-top: 1rem;
        }
        .loader-dots span {
          width: 8px;
          height: 8px;
          background: var(--primary);
          border-radius: 50%;
          animation: bounce 1.2s infinite ease-in-out;
        }
        .loader-dots span:nth-child(2) { animation-delay: 0.2s; }
        .loader-dots span:nth-child(3) { animation-delay: 0.4s; }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleUp {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }

        /* Loading Shimmer styles */
        .loading-shimmer {
          height: 300px;
          justify-content: space-around;
        }
        .shimmer-line {
          background: linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 4px;
        }
        .shimmer-line.header { width: 50%; height: 24px; }
        .shimmer-line.text { width: 80%; height: 16px; }
        .shimmer-line.stars { width: 70%; height: 40px; }

        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
}
