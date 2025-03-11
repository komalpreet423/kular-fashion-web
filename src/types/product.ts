import { Brand } from "./brand";
import { ColorDetail } from "./color";
import { Department } from "./department";
import { SizeDetail } from "./size";

export interface ProductType {
    id: number;
    name: string;
    slug: string;
    short_name: string;
    image: string | null;
    small_image: string | null;
    medium_image: string | null;
    large_image: string | null;
}

export interface WebInfo {
    id: number;
    product_id: number;
    summary: string;
    description: string;
    is_splitted_with_colors: boolean;
    heading: string;
    meta_title: string;
    meta_keywords: string;
    meta_description: string;
    status: number;
}

export interface ProductSize {
    id: number;
    product_id: number;
    size_id: number;
    price: number;
    sale_price: number;
    detail: SizeDetail;
}

export interface ProductColor {
    id: number;
    product_id: number;
    color_id: number;
    supplier_color_code: string;
    supplier_color_name: string;
    swatch_image_path: string | null;
    detail: ColorDetail;
}

export interface ProductVariant{
    id: number,
    product_color_id: number,
    product_size_id: number,
    sku: string,
    quantity: number
}

export interface ProductImageProps {
    path: string;
    alt: string;
    product_color_id: number;
    is_default: boolean;
}

export interface ProductBase {
    id: number;
    slug: string;
    name: string;
    price: number;
    sale_price: number | null;
    default_image: string;
    brand: Brand;
    article_code: string;
    images: ProductImageProps[];
}

export interface Product extends ProductBase {
    manufacture_code: string;
    default_image: string;
    brand_id: number;
    department_id: number;
    product_type_id: number;
    price: number;
    sale_price: number | null;
    sale_start: string | null;
    sale_end: string | null;
    season: string | null;
    department: Department;
    productType: ProductType;
    webInfo: WebInfo;
    specifications: any[];
    sizes: ProductSize[];
    colors: ProductColor[];
    variants: ProductVariant[];
    relatedProducts: ProductBase[];
}