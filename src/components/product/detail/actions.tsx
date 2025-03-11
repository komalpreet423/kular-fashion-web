import { Button } from '@/components/ui/button';
import { FiShoppingCart } from 'react-icons/fi';
import { CiHeart } from 'react-icons/ci';

interface ProductActionsProps {
    isDisabled: boolean;
    onAddToCart: () => void;
    onAddToWishlist: () => void;
}

const ProductActions = ({ isDisabled, onAddToCart, onAddToWishlist }: ProductActionsProps) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            <Button className="rounded-none uppercase" disabled={isDisabled} onClick={onAddToCart}>
                <FiShoppingCart />
                Add to Cart
            </Button>
            <Button variant="outline" className="rounded-none uppercase" onClick={onAddToWishlist}>
                <CiHeart />
                Add to Wishlist
            </Button>
        </div>
    );
};

export default ProductActions;