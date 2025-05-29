import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface QuantityBoxProps {
    value: number;
    onChange: (newQuantity: number) => void;
    max?: number;
}

export default function QuantityBox({ value, onChange, max = Infinity }: QuantityBoxProps) {
    return (
        <div className="flex items-center border rounded-md h-8">
            {/* Decrease Button */}
            <Button
                variant="primary"
                size="sm"
                className="px-2 h-full rounded-none border-r"
                onClick={() => onChange(Math.max(1, value - 1))}
                disabled={value === 1}
            >
                -
            </Button>

            {/* Input Field */}
            <Input
                type="number"
                value={value}
                onChange={(e) => onChange(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-10 text-center border-none outline-none h-full text-sm [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />

            {/* Increase Button */}
            <Button
                variant="primary"
                size="sm"
                className="px-2 h-full rounded-none border-l"
                onClick={() => onChange(value + 1)}
                disabled={value >= max}
            >
                +
            </Button>
        </div>
    );
}
