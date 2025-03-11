"use client";
import React, { useState, useRef, useEffect } from "react";
import Slider from "react-slick";
import Image from "next/image";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { FaChevronUp, FaChevronDown } from "react-icons/fa";
import { apiBaseRoot } from "@/config";
import { ProductImageProps } from "@/types/interfaces";

interface ProductSliderProps {
    images: ProductImageProps[];
    selectedColorId?: number;
    defaultImage?: string | null;
}

const ProductImages: React.FC<ProductSliderProps> = ({ images, selectedColorId, defaultImage }) => {
    const [filteredImages, setFilteredImages] = useState<ProductImageProps[]>([]);
    const [selectedIndex, setSelectedIndex] = useState<number>(0);
    const mainSliderRef = useRef<Slider | null>(null);
    const thumbnailSliderRef = useRef<Slider | null>(null);
    const [isMobile, setIsMobile] = useState<boolean>(false);
    const [isPrevDisabled, setIsPrevDisabled] = useState<boolean>(true);
    const [isNextDisabled, setIsNextDisabled] = useState<boolean>(false);

    // Filter images based on selectedColorId
    useEffect(() => {
        const tempImages = selectedColorId
            ? images.filter(image => image.product_color_id === selectedColorId)
            : images.filter(image => image.product_color_id === null);
        setFilteredImages(tempImages);
    }, [images, selectedColorId]);

    // Reset selectedIndex when filteredImages changes
    useEffect(() => {
        setSelectedIndex(0);
        updateArrows(0); // Update arrows when filteredImages changes
    }, [filteredImages]);

    // Detect screen size to determine mobile/desktop view
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Sync main slider with selectedIndex
    useEffect(() => {
        if (mainSliderRef.current) {
            mainSliderRef.current.slickGoTo(selectedIndex, true);
        }
    }, [selectedIndex]);

    // Function to update arrow button states
    const updateArrows = (currentIndex: number) => {
        setIsPrevDisabled(currentIndex === 0);
        setIsNextDisabled(currentIndex >= filteredImages.length - 3);
    };

    // Handle thumbnail click
    const handleThumbnailClick = (index: number) => {
        setSelectedIndex(index);
        if (mainSliderRef.current) {
            mainSliderRef.current.slickGoTo(index, true);
        }
        updateArrows(index);
    };

    // Update arrows when filteredImages changes
    useEffect(() => {
        updateArrows(selectedIndex);
    }, [filteredImages]);

    if (!filteredImages.length) {
        let thumbnail = `/images/default-product.png`;

        if (defaultImage) {
            thumbnail = apiBaseRoot + defaultImage;
        }

        return <><Image
            src={thumbnail}
            alt={'default_alt'}
            width={400}
            height={400}
            className="object-contain shadow-lg"
        /></>;
    }

    const settingsMain = {
        infinite: true,
        centerMode: true,
        centerPadding: "0",
        slidesToShow: 1,
        speed: 0,
        arrows: false,
        beforeChange: (_: number, next: number) => setSelectedIndex(next),
    };

    const settingsThumbnail = {
        infinite: false,
        slidesToShow: Math.min(Math.max(filteredImages.length, 1), 3),
        slidesToScroll: 1,
        speed: 500,
        arrows: false, // Using custom arrows
        focusOnSelect: true,
        vertical: !isMobile, // Vertical for desktop, horizontal for mobile
        verticalSwiping: !isMobile,
        afterChange: (current: number) => updateArrows(current), // Track scroll position
    };

    return (
        <div className="w-full max-w-4xl mx-auto flex flex-col md:flex-row-reverse items-center md:items-start">
            {/* Main Image Slider */}
            <div className="w-full md:w-5/6 md:mb-0">
                <Slider {...settingsMain} ref={mainSliderRef}>
                    {filteredImages.map((image, index) => (
                        <div key={index} className="relative w-[600px] h-[450px] rounded-lg overflow-hidden shadow-lg">
                            <Image
                                src={apiBaseRoot + image.path}
                                alt={image.alt || 'default_alt'}
                                width={600}
                                height={450}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    ))}
                </Slider>
            </div>

            {/* Thumbnail Slider (Desktop - Vertical) */}
            {!isMobile && (
                <div className="w-full md:w-1/6 md:mr-4 relative flex flex-col items-center">
                    {filteredImages.length > 3 &&
                        <button
                            className={`mb-2 focus:outline-none transition-opacity ${isPrevDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                                }`}
                            onClick={() => {
                                if (!isPrevDisabled) {
                                    thumbnailSliderRef.current?.slickPrev();
                                }
                            }}
                            disabled={isPrevDisabled}
                        >
                            <FaChevronUp className="text-gray-600 hover:text-blue-500 text-xl" />
                        </button>}

                    {/* Thumbnail Slider */}
                    <div className="w-full h-auto md:max-h-[330px] overflow-hidden">
                        <Slider {...settingsThumbnail} ref={thumbnailSliderRef}>
                            {filteredImages.map((image, index) => (
                                <div
                                    key={index}
                                    className="relative p-1 cursor-pointer h-[100px]"
                                    onClick={() => handleThumbnailClick(index)}
                                >
                                    <Image
                                        src={apiBaseRoot + image.path}
                                        alt={image.alt || 'default_alt'}
                                        width={100}
                                        height={100}
                                        className={`rounded-md border-2 w-full h-full object-cover ${selectedIndex === index ? "border-primary" : "border-transparent"
                                            } transition-all`}
                                    />
                                </div>
                            ))}
                        </Slider>
                    </div>

                    {filteredImages.length > 3 &&
                        <button
                            className={`mt-2 focus:outline-none transition-opacity ${isNextDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                                }`}
                            onClick={() => {
                                if (!isNextDisabled) {
                                    thumbnailSliderRef.current?.slickNext();
                                }
                            }}
                            disabled={isNextDisabled}
                        >
                            <FaChevronDown className="text-gray-600 hover:text-blue-500 text-xl" />
                        </button>
                    }
                </div>
            )}

            {/* Thumbnail Slider (Mobile - Horizontal) */}
            {isMobile && (
                <div className="w-full mt-1 relative">
                    {/* Thumbnail Slider */}
                    <Slider {...settingsThumbnail} ref={thumbnailSliderRef}>
                        {filteredImages.map((image, index) => (
                            <div
                                key={index}
                                className="relative p-1 cursor-pointer h-[100px]"
                                onClick={() => handleThumbnailClick(index)}
                            >
                                <Image
                                    src={apiBaseRoot + image.path}
                                    alt={image.alt || 'default_alt'}
                                    width={100}
                                    height={100}
                                    className={`rounded-md border-2 w-full h-full object-cover ${selectedIndex === index ? "border-primary" : "border-transparent"
                                        } transition-all`}
                                />
                            </div>
                        ))}
                    </Slider>
                </div>
            )}
        </div>
    );
};

export default ProductImages;