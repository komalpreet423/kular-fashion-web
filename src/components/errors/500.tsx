import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ImSpinner2 } from "react-icons/im";
import { FiRefreshCcw } from "react-icons/fi";

interface Error500Props {
    error?: string;
    tryAgain?: () => Promise<void>;
}

const Error500: React.FC<Error500Props> = ({ error, tryAgain }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleTryAgain = async () => {
        if (tryAgain) {
            setIsLoading(true);
            await tryAgain();
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full py-6 flex flex-col items-center justify-center">
            <Image src={'/images/error-500.svg'} alt='500 Error' width={400} height={300}></Image>
            <div className="flex flex-col items-center justify-center">
                <p className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-wider text-gray-600 mt-8">
                    500
                </p>
                <p className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-600 mt-2">
                    Server Error
                </p>
                <p className="md:text-lg xl:text-xl text-gray-500 mt-4">
                    {error || `Whoops, something went wrong on our servers.`}
                </p>
                {tryAgain &&
                    <Button
                        variant={'primary'}
                        onClick={handleTryAgain}
                        className="mt-4 px-12"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <div className="flex items-center">
                                <ImSpinner2 className="animate-spin mr-3" />
                                Trying again...
                            </div>
                        ) : (
                            <div className="flex items-center">
                                <FiRefreshCcw className="mr-3" />
                                Try again
                            </div>
                        )}
                    </Button>
                }
            </div>
        </div>
    );
};

export default Error500;