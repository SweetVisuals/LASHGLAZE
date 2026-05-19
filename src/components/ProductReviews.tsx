import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useApp } from '../context/AppContext';
import { ProductReview } from '../types';
import { Star, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ProductReviewsProps {
  productId: string;
}

export const ProductReviews: React.FC<ProductReviewsProps> = ({ productId }) => {
  const { user, isCustomerLoggedIn } = useApp();
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [userReview, setUserReview] = useState<ProductReview | null>(null);

  // Form State
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // View State
  const [showAllReviews, setShowAllReviews] = useState(false);

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) 
    : 0;

  useEffect(() => {
    fetchReviews();
    if (user) {
      checkPurchaseStatus();
    } else {
      setHasPurchased(false);
      setUserReview(null);
    }
  }, [productId, user]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('product_reviews')
        .select(`
          id, product_id, profile_id, rating, review_text, created_at,
          profiles(full_name, email)
        `)
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data as any);

      if (user) {
        const myReview = data.find((r: any) => r.profile_id === user.id);
        if (myReview) {
          setUserReview(myReview as any);
        }
      }
    } catch (err: any) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkPurchaseStatus = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          order_items!inner(product_id)
        `)
        .eq('profile_id', user.id)
        .eq('order_items.product_id', productId)
        .limit(1);

      if (error) throw error;
      
      setHasPurchased(data && data.length > 0);
    } catch (err: any) {
      console.error('Error checking purchase status:', err);
      setHasPurchased(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const payload = {
        product_id: productId,
        profile_id: user.id,
        rating,
        review_text: reviewText
      };

      let error;
      if (userReview) {
        const res = await supabase
          .from('product_reviews')
          .update(payload)
          .eq('id', userReview.id);
        error = res.error;
      } else {
        const res = await supabase
          .from('product_reviews')
          .insert([payload]);
        error = res.error;
      }

      if (error) {
        if (error.code === '23505') {
          throw new Error('You have already reviewed this product.');
        } else if (error.code === '42501' || error.message?.includes('violates row-level security')) {
           throw new Error('You can only review products you have purchased.');
        }
        throw error;
      }

      setSuccess(true);
      fetchReviews(); // Refetch to update the list and userReview state
    } catch (err: any) {
      console.error('Error submitting review:', err);
      setError(err.message || 'Failed to submit review. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col items-center mb-12 text-center">
        <h2 className="font-serif text-3xl md:text-4xl text-ink italic mb-4 tracking-tight">Product Reviews</h2>
        <p className="text-[10px] text-muted uppercase tracking-[0.5em] font-bold opacity-80">Verified Feedback</p>
      </div>

      <div className="max-w-4xl mx-auto space-y-12">
        {/* Write a Review Section */}
        <div className="bg-accent/5 p-8">
          <h3 className="text-xl font-bold mb-6 font-serif italic text-ink">
            {userReview ? 'Update Your Review' : 'Write a Review'}
          </h3>
          
          {!isCustomerLoggedIn ? (
            <div className="text-sm text-muted bg-accent/5 p-4 flex items-start gap-3">
              <AlertCircle size={16} className="mt-0.5 text-accent" />
              <p>You must be logged in to write a review. <button onClick={() => {}} className="underline font-bold text-ink">Log in</button> to continue.</p>
            </div>
          ) : !hasPurchased && !userReview ? (
            <div className="text-sm text-muted bg-accent/5 p-4 flex items-start gap-3">
              <AlertCircle size={16} className="mt-0.5 text-accent" />
              <p>You can only leave a review if you have purchased this product from our store.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-500/10 text-red-500 p-4 text-sm flex items-start gap-2">
                  <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}
              {success && (
                <div className="bg-green-500/10 text-green-500 p-4 text-sm flex items-start gap-2">
                  <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0" />
                  <p>Your review has been {userReview ? 'updated' : 'submitted'} successfully.</p>
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-muted">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star
                        size={28}
                        className={star <= rating ? 'fill-gold text-gold' : 'text-accent/20'}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="reviewText" className="text-[10px] uppercase font-bold tracking-[0.2em] text-muted">Review</label>
                <textarea
                  id="reviewText"
                  rows={4}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="w-full border-none bg-accent/5 p-4 text-sm text-ink placeholder:text-muted/50 focus:ring-1 focus:ring-ink transition-colors"
                  placeholder="Share your thoughts on this product..."
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto px-8 py-4 bg-ink text-paper text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-gold hover:text-ink transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : (userReview ? 'Update Review' : 'Submit Review')}
              </button>
            </form>
          )}
        </div>

        {/* Reviews List */}
        <div className="space-y-8">
          <div className="flex items-center justify-between pb-4">
            <h3 className="text-xl font-bold font-serif italic text-ink">
              Customer Reviews ({reviews.length})
            </h3>
            {reviews.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-ink">{averageRating}</span>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={i < Math.round(Number(averageRating)) ? 'fill-gold text-gold' : 'text-accent/20'}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {loading ? (
            <div className="animate-pulse space-y-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-accent/5 rounded-sm" />
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <p className="text-muted text-sm italic">No reviews yet. Be the first to share your thoughts!</p>
          ) : (
            <div className="space-y-6">
              {(showAllReviews ? reviews : reviews.slice(0, 3)).map((review) => (
                <div key={review.id} className="bg-accent/5 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={i < review.rating ? 'fill-gold text-gold' : 'text-accent/20'}
                          />
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-ink">
                          {review.profiles?.full_name || 'Anonymous User'}
                        </span>
                        <span className="text-[10px] text-muted flex items-center gap-1 uppercase tracking-wider font-bold">
                          <CheckCircle2 size={10} className="text-gold" />
                          Verified Buyer
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-muted">
                      {new Date(review.created_at).toLocaleDateString(undefined, { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-ink/80 leading-relaxed font-serif">
                    {review.review_text}
                  </p>
                </div>
              ))}
              
              {reviews.length > 3 && (
                <div className="pt-4 flex justify-center">
                  <button
                    onClick={() => setShowAllReviews(!showAllReviews)}
                    className="px-6 py-3 border border-ink/20 text-ink text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-ink hover:text-paper transition-colors"
                  >
                    {showAllReviews ? 'Show Less' : `Show ${reviews.length - 3} More Reviews`}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
