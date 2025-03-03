import Header from '@/components/global/header';
import Image from 'next/image'
import { Card, CardHeader, CardTitle, CardFooter, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import ProductImages from '@/components/product/images';

// Define types for the product
interface Product {
    id: string
    name: string
    description: string
    price: number
    imageUrl: string
}

// Fetch product data in the Server Component
const fetchProduct = async (id: string): Promise<Product | null> => {
    const products = [
        { id: '1', name: 'Product 1', imageUrl: '/product1.jpg', description: 'A great product!', price: 29.99 },
        { id: '2', name: 'Product 2', imageUrl: '/product2.jpg', description: 'Another great product!', price: 49.99 },
    ]
    return products.find((product) => product.id === id) || null
}

const ProductDetail = async ({ params }: { params: { slug: string } }) => {
    console.log('params', await params)
    const product = await fetchProduct(params.slug)

    if (!product) {
        return <div>Product not found</div> // or a 404 page
    }

    const productImages = [
        { src: "/images/temp/product1.jpg", alt: "Product 1" },
        { src: "/images/temp/product2.jpg", alt: "Product 2" },
        { src: "/images/temp/product3.jpg", alt: "Product 3" },
        { src: "/images/temp/product4.jpg", alt: "Product 4" },
    ];

    return (<>
        <Header />
        <div className="container mx-auto py-8 px-4">
            <div className="grid md:grid-cols-2 gap-8">
                {/* Product Image */}
                <div className="flex justify-center">
                    <ProductImages images={productImages} />
                </div>

                {/* Product Details */}
                <div className="flex flex-col">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl font-semibold">{product.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-lg">{product.description}</p>
                            <div className="mt-4 text-xl font-semibold">${product.price}</div>
                        </CardContent>
                        <CardFooter>
                            <Button variant="primary">
                                Add to Cart
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    </>)
}

export default ProductDetail
