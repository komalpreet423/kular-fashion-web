import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";

interface CartButtonsProps {
  productsLength: number;
  onPlaceOrder: () => void;
}
  
  const CartButtons = ({ productsLength, onPlaceOrder }: CartButtonsProps) => {
    return (
      <motion.div whileHover={{ scale: 1.05 }}>
        <Button className="mt-4 w-full rounded-none uppercase" disabled={productsLength === 0} onClick={onPlaceOrder}>Place Order</Button>
      </motion.div>

    );
  };
  
  export default CartButtons;
  