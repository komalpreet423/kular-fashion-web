export interface Filter {
    product_types: { id: string; name: string }[];
    sizes: { id: string; name: string }[];
    colors: { id: string; color_code: string }[];
    brands: { id: string; name: string }[];
    price: { min: number; max: number };
}

export interface PaginationProps {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
}