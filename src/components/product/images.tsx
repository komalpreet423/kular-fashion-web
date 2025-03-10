"use client";
import React, { useState, useRef, useEffect } from "react";
import Slider from "react-slick";
import Image from "next/image";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { FaChevronUp, FaChevronDown } from 'react-icons/fa';

// Define type for the image prop
interface ImageProps {
    src: string;
    alt: string;
}

interface ProductSliderProps {
    images: ImageProps[];
}

// Custom Previous Arrow Component
const CustomPrevArrow = (props: any) => {
    const { onClick } = props;
    return (
        <div
            className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full cursor-pointer"
            onClick={onClick}
        >
            <FaChevronUp className="text-gray-600 hover:text-blue-500" />
        </div>
    );
};

// Custom Next Arrow Component
const CustomNextArrow = (props: any) => {
    const { onClick } = props;
    return (
        <div
            className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full cursor-pointer"
            onClick={onClick}
        >
            <FaChevronDown className="text-gray-600 hover:text-blue-500" />
        </div>
    );
};

const ProductImages: React.FC<ProductSliderProps> = ({ images }) => {
    const [selectedIndex, setSelectedIndex] = useState<number>(0);
    const mainSliderRef = useRef<Slider | null>(null);

    // Sync the main slider with the selected index on mount
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
        speed: 0, // Set speed to 0 for an immediate transition
        arrows: false,
        beforeChange: (current: number, next: number) => setSelectedIndex(next),
    };

    const settingsThumbnail = {
        infinite: false,
        slidesToShow: 3, // Set default number of thumbnails to 2
        slidesToScroll: 1,
        vertical: true,
        speed: 500,
        arrows: true, // Enable arrows
        prevArrow: <CustomPrevArrow />, // Custom previous arrow
        nextArrow: <CustomNextArrow />, // Custom next arrow
        responsive: [
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 3, // On medium screens, show 3 thumbnails
                },
            },
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 5, // On large screens, show 5 thumbnails
                },
            },
        ],
    };

    const handleThumbnailClick = (e: React.MouseEvent, index: number) => {
        e.preventDefault(); // Prevent default behavior to avoid scrolling
        setSelectedIndex(index); // Set the active thumbnail image

        // Immediately change the main slider to the selected image without animation
        if (mainSliderRef.current) {
            mainSliderRef.current.slickGoTo(index, true); // The second parameter (`true`) ensures it changes immediately without sliding
        }
    };

    return (
        <div className="w-full hidden max-w-4xl mx-auto flex">
            {/* Thumbnail Image Slider */}
            <div className="thumbnail-slider w-1/6 mr-4 relative">
                <Slider {...settingsThumbnail}>
                    {images.map((image, index) => (
                        <div
                            key={index}
                            className={`relative p-1 cursor-pointer focus:outline-none`}
                            onClick={(e) => handleThumbnailClick(e, index)} // Handle click to change main image
                            tabIndex={-1} // Prevent focus on click
                        >
                            <Image
                                src={image.src}
                                alt={image.alt}
                                width={100}
                                height={100}
                                className={`rounded-md border-2 ${selectedIndex === index
                                    ? "border-blue-500"
                                    : "border-transparent"
                                    } transition-all`}
                            />
                        </div>
                    ))}
                </Slider>
            </div>

            {/* Main Image Slider */}
            <div className="main-slider w-5/6">
                <Slider {...settingsMain} ref={mainSliderRef}>
                    {images.map((image, index) => (
                        <div key={index} className="relative w-full">
                            <Image
                                src={image.src}
                                alt={image.alt}
                                width={600}
                                height={600}
                                className="object-cover w-full h-full rounded-lg shadow-lg"
                            />
                        </div>
                    ))}
                </Slider>
            </div>
        </div>
    );
};

export default ProductImages;