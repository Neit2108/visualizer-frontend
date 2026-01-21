/**
 * Floating Action Button for Feedback
 * 
 * A circular FAB in the bottom-right corner that opens a feedback form
 * with slide-up and fade-in animations using motion's AnimatePresence.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquarePlus, X, Send, Star, Loader2, Bug, Sparkles, Lightbulb, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store';

// ============================================
// Types
// ============================================

type FeedbackCategory = 'bug' | 'feature' | 'improvement' | 'other';

interface FeedbackPayload {
  sessionId?: string;
  email: string;
  rating: number;
  category: FeedbackCategory;
  message: string;
}

interface FeedbackResponse {
  id: number;
  email: string;
  rating: number;
  category: string;
  message: string;
  createdAt: string;
}

// ============================================
// API Service
// ============================================

const API_BASE = import.meta.env.VITE_API_BASE_URL + '/api' || 'http://localhost:3000/api';

async function submitFeedback(feedback: FeedbackPayload): Promise<FeedbackResponse> {
  const response = await fetch(`${API_BASE}/feedback`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(feedback),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Không thể gửi phản hồi');
  }

  const data = await response.json();
  return data.data;
}

// ============================================
// Star Rating Component
// ============================================

interface StarRatingProps {
  value: number;
  onChange: (rating: number) => void;
}

function StarRating({ value, onChange }: StarRatingProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = hovered !== null ? star <= hovered : star <= value;
        return (
          <motion.button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(null)}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.95 }}
            className="p-0.5 focus:outline-none focus:ring-2 focus:ring-violet-500/50 rounded"
            aria-label={`Đánh giá ${star} sao`}
          >
            <Star
              className={cn(
                'w-7 h-7 transition-colors duration-150',
                isFilled
                  ? 'fill-amber-400 text-amber-400'
                  : 'fill-transparent text-zinc-600'
              )}
            />
          </motion.button>
        );
      })}
    </div>
  );
}

// ============================================
// Category Select Component
// ============================================

interface CategoryOption {
  value: FeedbackCategory;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const categories: CategoryOption[] = [
  { value: 'bug', label: 'Báo lỗi', icon: Bug },
  { value: 'feature', label: 'Tính năng mới', icon: Sparkles },
  { value: 'improvement', label: 'Cải thiện', icon: Lightbulb },
  { value: 'other', label: 'Khác', icon: MessageCircle },
];

interface CategorySelectProps {
  value: FeedbackCategory;
  onChange: (category: FeedbackCategory) => void;
}

function CategorySelect({ value, onChange }: CategorySelectProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {categories.map((cat) => {
        const Icon = cat.icon;
        return (
          <motion.button
            key={cat.value}
            type="button"
            onClick={() => onChange(cat.value)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all',
              'focus:outline-none focus:ring-2 focus:ring-violet-500/50',
              value === cat.value
                ? 'bg-violet-600/20 border-violet-500 text-violet-300'
                : 'bg-zinc-800/50 border-zinc-700/50 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300'
            )}
          >
            <Icon className="w-4 h-4" />
            <span>{cat.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}

// ============================================
// Feedback Form Component
// ============================================

interface FeedbackFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

function FeedbackForm({ onClose, onSuccess }: FeedbackFormProps) {
  const sessionId = useAppStore((state) => state.sessionId);
  const formRef = useRef<HTMLFormElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  
  const [email, setEmail] = useState('');
  const [rating, setRating] = useState(5);
  const [category, setCategory] = useState<FeedbackCategory>('feature');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Handle click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        overlayRef.current &&
        !formRef.current?.contains(event.target as Node)
      ) {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Handle escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await submitFeedback({
        sessionId: sessionId || undefined,
        email,
        rating,
        category,
        message,
      });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = email.includes('@') && message.length >= 10;

  return (
    <motion.div
      ref={overlayRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm"
    >
      <motion.form
        ref={formRef}
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 100, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 100, scale: 0.95 }}
        transition={{
          type: 'spring',
          damping: 25,
          stiffness: 300,
        }}
        className={cn(
          'w-full max-w-md bg-zinc-900 rounded-2xl border border-zinc-800',
          'shadow-2xl shadow-black/50 overflow-hidden'
        )}
      >
        {/* Header */}
        <div className="relative px-5 pt-5 pb-4 border-b border-zinc-800">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <MessageSquarePlus className="w-5 h-5 text-violet-400" />
                Gửi phản hồi
              </h2>
              <p className="text-sm text-zinc-400 mt-1">
                Ý kiến của bạn giúp chúng tôi cải thiện
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={onClose}
              className="text-zinc-400 hover:text-white -mr-2 -mt-1"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-5 max-h-[60vh] overflow-y-auto">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="feedback-email" className="text-zinc-300">
              Email <span className="text-red-400">*</span>
            </Label>
            <Input
              id="feedback-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="bg-zinc-800/50 border-zinc-700/50 text-white placeholder:text-zinc-500"
            />
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <Label className="text-zinc-300">
              Đánh giá <span className="text-red-400">*</span>
            </Label>
            <StarRating value={rating} onChange={setRating} />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label className="text-zinc-300">
              Loại phản hồi <span className="text-red-400">*</span>
            </Label>
            <CategorySelect value={category} onChange={setCategory} />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="feedback-message" className="text-zinc-300">
              Nội dung <span className="text-red-400">*</span>
            </Label>
            <Textarea
              id="feedback-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Chia sẻ ý kiến của bạn... (tối thiểu 10 ký tự)"
              required
              minLength={10}
              maxLength={5000}
              rows={4}
              className="bg-zinc-800/50 border-zinc-700/50 text-white placeholder:text-zinc-500 resize-none"
            />
            <p className="text-xs text-zinc-500 text-right">
              {message.length}/5000 ký tự
            </p>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-3 rounded-lg bg-red-900/30 border border-red-500/30 text-red-300 text-sm"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-zinc-800 bg-zinc-900/80 flex gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
          >
            Hủy
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !isValid}
            className={cn(
              'bg-linear-to-r from-violet-600 to-fuchsia-600',
              'hover:from-violet-500 hover:to-fuchsia-500',
              'text-white font-medium shadow-lg shadow-violet-500/25'
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang gửi...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Gửi phản hồi
              </>
            )}
          </Button>
        </div>
      </motion.form>
    </motion.div>
  );
}

// ============================================
// Success State Component
// ============================================

interface SuccessStateProps {
  onClose: () => void;
}

function SuccessState({ onClose }: SuccessStateProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 2500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="bg-zinc-900 rounded-2xl border border-zinc-800 p-8 text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', damping: 15 }}
          className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center"
        >
          <motion.svg
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="w-8 h-8 text-emerald-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <motion.path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </motion.svg>
        </motion.div>
        <h3 className="text-lg font-semibold text-white mb-2">
          Cảm ơn bạn!
        </h3>
        <p className="text-zinc-400 text-sm">
          Phản hồi của bạn đã được ghi nhận.
        </p>
      </motion.div>
    </motion.div>
  );
}

// ============================================
// Tooltip Storage Key
// ============================================

const TOOLTIP_DISMISSED_KEY = 'feedback-fab-tooltip-dismissed';

// ============================================
// Main FAB Component
// ============================================

export function FeedbackFAB() {
  const [isOpen, setIsOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipDismissed, setTooltipDismissed] = useState(() => {
    // Check localStorage on initial render
    return localStorage.getItem(TOOLTIP_DISMISSED_KEY) === 'true';
  });

  // Recurring tooltip logic
  useEffect(() => {
    // Don't show tooltip if dismissed or form is open
    if (tooltipDismissed || isOpen || showSuccess) {
      setShowTooltip(false);
      return;
    }

    let showTimer: ReturnType<typeof setTimeout>;
    let hideTimer: ReturnType<typeof setTimeout>;

    const startTooltipCycle = () => {
      // Wait 3-5 seconds (random for natural feel)
      const delay = 3000 + Math.random() * 2000;
      
      showTimer = setTimeout(() => {
        setShowTooltip(true);
        
        // Hide after 2-3 seconds
        const displayTime = 2000 + Math.random() * 1000;
        hideTimer = setTimeout(() => {
          setShowTooltip(false);
          // Restart the cycle
          startTooltipCycle();
        }, displayTime);
      }, delay);
    };

    startTooltipCycle();

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [tooltipDismissed, isOpen, showSuccess]);

  const handleFABClick = useCallback(() => {
    // Permanently dismiss the tooltip
    setTooltipDismissed(true);
    localStorage.setItem(TOOLTIP_DISMISSED_KEY, 'true');
    setShowTooltip(false);
    setIsOpen(true);
  }, []);

  const handleSuccess = () => {
    setIsOpen(false);
    setShowSuccess(true);
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
  };

  return (
    <>
      {/* FAB Container with Tooltip */}
      <div className="fixed z-40 bottom-6 right-6">
        {/* Tooltip */}
        <AnimatePresence>
          {showTooltip && !isOpen && (
            <motion.div
              initial={{ opacity: 0, x: 10, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 10, scale: 0.9 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className={cn(
                'absolute right-16 bottom-2',
                'px-4 py-2.5 rounded-xl',
                'bg-zinc-800/95 backdrop-blur-sm',
                'border border-zinc-700/50',
                'shadow-xl shadow-black/30',
                'whitespace-nowrap'
              )}
            >
              {/* Arrow pointing to FAB */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full">
                <div className="w-0 h-0 border-y-[6px] border-y-transparent border-l-8 border-l-zinc-700/50" />
                <div className="absolute top-0 left-0 w-0 h-0 border-y-[5px] border-y-transparent border-l-[7px] border-l-zinc-800 -translate-x-px -translate-y-[5px]" />
              </div>
              
              <p className="text-sm font-medium text-zinc-200">
                Góp ý để cải thiện trang web!
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* FAB Button */}
        <motion.button
          onClick={handleFABClick}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 15 }}
          whileHover={{
            scale: 1.1,
            y: -4,
            boxShadow: '0 20px 40px -12px rgba(139, 92, 246, 0.5)',
          }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            'w-14 h-14 rounded-full',
            'bg-linear-to-br from-violet-600 to-fuchsia-600',
            'flex items-center justify-center',
            'shadow-lg shadow-violet-500/30',
            'focus:outline-none focus:ring-4 focus:ring-violet-500/30',
            'transition-shadow duration-200 cursor-pointer'
          )}
          aria-label="Gửi phản hồi"
          title="Gửi phản hồi"
        >
          <MessageSquarePlus className="w-6 h-6 text-white" />
        </motion.button>
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {isOpen && (
          <FeedbackForm
            onClose={() => setIsOpen(false)}
            onSuccess={handleSuccess}
          />
        )}
      </AnimatePresence>

      {/* Success State */}
      <AnimatePresence>
        {showSuccess && <SuccessState onClose={handleCloseSuccess} />}
      </AnimatePresence>
    </>
  );
}
