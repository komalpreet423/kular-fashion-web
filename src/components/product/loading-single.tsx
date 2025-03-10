import { Skeleton } from '@/components/ui/skeleton';

const LoadingProduct = () => {
    return (
        <div className="container mx-auto py-8 px-4">
            <div className="grid md:grid-cols-2 gap-8">
                {/* Product Image */}
                <div className="flex justify-center">
                    <div className='w-full'>
                        <Skeleton className="h-[325px] w-full rounded-xl bg-gray-200" />

                        <div className="flex mt-2 gap-4">
                            <Skeleton className="h-24 w-full mb-4 bg-gray-200" />
                            <Skeleton className="h-24 w-full mb-4 bg-gray-200" />
                            <Skeleton className="h-24 w-full mb-4 bg-gray-200" />
                            <Skeleton className="h-24 w-full mb-4 bg-gray-200" />
                        </div>
                    </div>
                </div>

                {/* Product Details */}
                <div className="flex flex-col">
                    <div className='px-0'>
                        <Skeleton className="h-8 w-full mb-2" />
                        <Skeleton className="h-6 w-[250px] mb-4" />
                        <Skeleton className="h-6 w-[100px] mb-3" />
                        <div className="flex gap-3 mb-3">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <Skeleton className="h-10 w-10 rounded-full" />
                        </div>

                        <Skeleton className="h-6 w-[100px] mb-2" />
                        <div className="flex gap-3">
                            <Skeleton className="h-9 w-[85px] rounded-none" />
                            <Skeleton className="h-9 w-[85px] rounded-none" />
                            <Skeleton className="h-9 w-[85px] rounded-none" />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                            <Skeleton className="h-12 w-full mb-4 bg-gray-200" />
                            <Skeleton className="h-12 w-full mb-4 bg-gray-200" />
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoadingProduct;