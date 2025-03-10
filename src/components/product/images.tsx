"use client";
import React, { useState, useRef, useEffect } from "react";
import Slider from "react-slick";
import Image from "next/image";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { FaChevronUp, FaChevronDown } from "react-icons/fa";

// Define type for the image prop
interface ImageProps {
    src: string;
    alt: string;
}

interface ProductSliderProps {
    images: ImageProps[];
}

const ProductImages: React.FC<ProductSliderProps> = ({ images }) => {
    const [selectedIndex, setSelectedIndex] = useState<number>(0);
    const mainSliderRef = useRef<Slider | null>(null);
    const thumbnailSliderRef = useRef<Slider | null>(null);
    const [isMobile, setIsMobile] = useState<boolean>(false);
    const [isPrevDisabled, setIsPrevDisabled] = useState<boolean>(true);
    const [isNextDisabled, setIsNextDisabled] = useState<boolean>(false);

    // Detect screen size to determine mobile/desktop view
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        if (mainSliderRef.current) {
            mainSliderRef.current.slickGoTo(selectedIndex, true);
        }
    }, [selectedIndex]);

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
        slidesToShow: 3, // Show 3 thumbnails at a time
        slidesToScroll: 1,
        speed: 500,
        arrows: false, // Using custom arrows
        focusOnSelect: true,
        vertical: !isMobile, // Vertical for desktop, horizontal for mobile
        verticalSwiping: !isMobile,
        afterChange: (current: number) => updateArrows(current), // Track scroll position
    };

    // Handle thumbnail click
    const handleThumbnailClick = (index: number) => {
        setSelectedIndex(index);
        if (mainSliderRef.current) {
            mainSliderRef.current.slickGoTo(index, true);
        }
        updateArrows(index);
    };

    // Function to update arrow button states
    const updateArrows = (currentIndex: number) => {
        setIsPrevDisabled(currentIndex === 0);
        setIsNextDisabled(currentIndex >= images.length - 3); // Check if last item is visible
    };

    return (
        <div className="w-full max-w-4xl mx-auto flex flex-col md:flex-row-reverse items-center md:items-start">
            {/* Main Image Slider */}
            <div className="w-full md:w-5/6 mb-4 md:mb-0">
                <Slider {...settingsMain} ref={mainSliderRef}>
                    {images.map((image, index) => (
                        <div key={index} className="relative w-full">
                            <Image
                                src={image.src}
                                alt={image.alt}
                                width={600}
                                height={600}
                                className="object-contain w-full h-auto rounded-lg shadow-lg"
                            />
                        </div>
                    ))}
                </Slider>
            </div>

            {/* Thumbnail Slider (Desktop - Vertical) */}
            {!isMobile && (
                <div className="w-full md:w-1/6 md:mr-4 relative flex flex-col items-center">
                    {/* Desktop Arrows */}
                    <button
                        className={`mb-2 focus:outline-none transition-opacity ${
                            isPrevDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                        }`}
                        onClick={() => {
                            if (!isPrevDisabled) {
                                thumbnailSliderRef.current?.slickPrev();
                            }
                        }}
                        disabled={isPrevDisabled}
                    >
                        <FaChevronUp className="text-gray-600 hover:text-blue-500 text-xl" />
                    </button>

                    {/* Thumbnail Slider */}
                    <div className="w-full h-auto md:max-h-[330px] overflow-hidden">
                        <Slider {...settingsThumbnail} ref={thumbnailSliderRef}>
                            {images.map((image, index) => (
                                <div
                                    key={index}
                                    className="relative p-1 cursor-pointer h-[100px]"
                                    onClick={() => handleThumbnailClick(index)}
                                >
                                    <Image
                                        src={image.src}
                                        alt={image.alt}
                                        width={100}
                                        height={100}
                                        className={`rounded-md border-2 w-full h-full object-cover ${
                                            selectedIndex === index ? "border-blue-500" : "border-transparent"
                                        } transition-all`}
                                    />
                                </div>
                            ))}
                        </Slider>
                    </div>

                    {/* Desktop Arrows */}
                    <button
                        className={`mt-2 focus:outline-none transition-opacity ${
                            isNextDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
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
                </div>
            )}

            {/* Thumbnail Slider (Mobile - Horizontal) */}
            {isMobile && (
                <div className="w-full mt-4 relative">
                    {/* Thumbnail Slider */}
                    <Slider {...settingsThumbnail} ref={thumbnailSliderRef}>
                        {images.map((image, index) => (
                            <div
                                key={index}
                                className="relative p-1 cursor-pointer h-[100px]"
                                onClick={() => handleThumbnailClick(index)}
                            >
                                <Image
                                    src={image.src}
                                    alt={image.alt}
                                    width={100}
                                    height={100}
                                    className={`rounded-md border-2 w-full h-full object-cover ${
                                        selectedIndex === index ? "border-blue-500" : "border-transparent"
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
