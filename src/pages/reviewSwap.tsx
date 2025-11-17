import ReviewSwapComponent from '@/components/ReviewSwap/ReviewSwap';
import withAuth from '@/hoc/withAuth';

const ReviewSwap = () => {
  return <ReviewSwapComponent />;
};

export default withAuth(ReviewSwap);
