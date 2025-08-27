"use client";

import { useEffect, useState } from "react";
import { apiBaseUrl } from "@/config";
import BrandCard from "@/components/brand/card";
import { Skeleton } from "@/components/ui/skeleton";
import axios from "axios";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";

interface Brand {
  id: number;
  name: string;
  image: string;
}

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [perPage] = useState<number>(42);
  const [totalPages, setTotalPages] = useState<number>(1);

  useEffect(() => {
    const fetchBrands = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${apiBaseUrl}brands`, {
          params: {
            page: currentPage,
            per_page: perPage,
          },
        });

        const data = res.data;
        setBrands(data.data || []);
        setTotalPages(data.pagination?.last_page || 1);
        setError(null);
      } catch (error) {
        setError(
          axios.isAxiosError(error)
            ? error.response?.data?.message || "Request failed"
            : "An unexpected error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, [currentPage, perPage]);
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">All Brands</h1>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          {Array.from({ length: perPage }).map((_, i) => (
            <div key={i} className="flex flex-col space-y-3">
              <Skeleton className="h-[200px] w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4 mx-auto" />
            </div>
          ))}
        </div>
      ) : brands.length === 0 ? (
        <p className="text-center text-gray-500">No brands found.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 grid-cols-6 gap-6">
            {brands.map((brand) => (
              <BrandCard key={brand.id} brand={brand} />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <Pagination>
                <PaginationContent>
                  {/* Previous Button */}
                  <PaginationItem>
                    <button
                      className="px-3 py-1 rounded-md disabled:opacity-50"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((prev) => prev - 1)}
                    >
                      Previous
                    </button>
                  </PaginationItem>

                  {/* First Page */}
                  {currentPage > 3 && (
                    <PaginationItem>
                      <button
                        className={`px-3 py-1 rounded-md ${
                          currentPage === 1
                            ? "bg-gray-900 text-white"
                            : "bg-gray-200"
                        }`}
                        onClick={() => setCurrentPage(1)}
                      >
                        1
                      </button>
                    </PaginationItem>
                  )}

                  {/* Ellipsis before current page if needed */}
                  {currentPage > 4 && (
                    <PaginationItem>
                      <span className="px-3 py-1">...</span>
                    </PaginationItem>
                  )}

                  {/* Pages around current page */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    if (pageNum < 1 || pageNum > totalPages) return null;

                    return (
                      <PaginationItem key={pageNum}>
                        <button
                          className={`px-3 py-1 rounded-md ${
                            currentPage === pageNum
                              ? "bg-gray-900 text-white"
                              : "bg-gray-200"
                          }`}
                          onClick={() => setCurrentPage(pageNum)}
                        >
                          {pageNum}
                        </button>
                      </PaginationItem>
                    );
                  })}

                  {/* Ellipsis after current page if needed */}
                  {currentPage < totalPages - 3 && (
                    <PaginationItem>
                      <span className="px-3 py-1">...</span>
                    </PaginationItem>
                  )}

                  {/* Last Page */}
                  {currentPage < totalPages - 2 && (
                    <PaginationItem>
                      <button
                        className={`px-3 py-1 rounded-md ${
                          currentPage === totalPages
                            ? "bg-gray-900 text-white"
                            : "bg-gray-200"
                        }`}
                        onClick={() => setCurrentPage(totalPages)}
                      >
                        {totalPages}
                      </button>
                    </PaginationItem>
                  )}

                  {/* Next Button */}
                  <PaginationItem>
                    <button
                      className="px-3 py-1 rounded-md disabled:opacity-50"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((prev) => prev + 1)}
                    >
                      Next
                    </button>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}
    </div>
  );
  
}

