import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { FiShoppingCart } from 'react-icons/fi';
import { AiFillHeart, AiOutlineHeart } from 'react-icons/ai'; // Filled and outline hearts

interface ProductActionsProps {
    isDisabled: boolean;
    onAddToCart: () => void;
    onAddToWishlist: () => void;
    productId: number;
}

const ProductActions = ({ isDisabled, onAddToCart, onAddToWishlist, productId }: ProductActionsProps) => {
    const [isInWishlist, setIsInWishlist] = useState(false);

    useEffect(() => {
        const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        const exists = wishlist.some((item: any) => item.id === productId);
        setIsInWishlist(exists);
    }, [productId]);

    const handleWishlistClick = () => {
        onAddToWishlist();
        setIsInWishlist((prev) => !prev);
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            <Button className="rounded-none uppercase" disabled={isDisabled} onClick={onAddToCart}>
                <FiShoppingCart className="mr-2" />
                Add to Cart
            </Button>
            <Button
                variant="outline"
                className="rounded-none uppercase flex items-center gap-1"
                onClick={handleWishlistClick}
            >
                {isInWishlist ? (
                    <AiFillHeart className="text-red-500 text-xl" />
                ) : (
                    <AiOutlineHeart className="text-gray-600 text-xl" />
                )}
                {isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
            </Button>
        </div>
    );
};

export default ProductActions;
