import React, { useEffect, useState, useRef } from 'react';
import { useSwipeable } from 'react-swipeable';
import { Button } from "@mui/material";

const BackgroundGalleryDetails = ({ images }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isFading, setIsFading] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const containerRef = useRef(null);

    const handlers = useSwipeable({
        onSwipedLeft: () => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
        },
        onSwipedRight: () => {
            setCurrentImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
        },
        preventDefaultTouchmoveEvent: true,
        trackMouse: true,
    });

    // Lazy Loading: Check if the component is visible
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.1 }
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => {
            if (containerRef.current) {
                observer.unobserve(containerRef.current);
            }
        };
    }, []);

    // Auto-Slide Images
    useEffect(() => {
        if (isVisible && images && Array.isArray(images)) {
            const interval = setInterval(() => {
                setIsFading(true);
                setTimeout(() => {
                    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
                    setIsFading(false);
                }, 500);
            }, 500000);

            return () => clearInterval(interval);
        }
    }, [images, isVisible]);

    if (!images || !Array.isArray(images) || images.length === 0) {
        return null;
    }

    return (
        <div
            {...handlers}
            ref={containerRef}
            style={{
                position: 'relative',
                overflow: 'hidden',
                width: '100%',
                height: '250px',
                zIndex: 2,
            }}
        >
            {isVisible && (
                <div
                    style={{
                        backgroundImage: `url(${images[currentImageIndex]})`,
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: 'cover',
                        width: '100%',
                        height: '100%',
                        opacity: isFading ? 0 : 1,
                        transition: 'opacity 0.5s ease-in-out',
                    }}
                />
            )}
            <Button
                onClick={() =>
                    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length)
                }
                style={{
                    position: 'absolute',
                    left: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 2,
                }}
            >
                {"<"}
            </Button>
            <Button
                onClick={() =>
                    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length)
                }
                style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 2,
                }}
            >
                {">"}
            </Button>
            <div
                style={{
                    position: 'absolute',
                    bottom: '10px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    zIndex: 2,
                }}
            >
                {images.map((_, index) => (
                    <div
                        key={index}
                        style={{
                            height: '10px',
                            width: '10px',
                            borderRadius: '50%',
                            backgroundColor: currentImageIndex === index ? 'white' : 'gray',
                            margin: '0 5px',
                            cursor: 'pointer',
                        }}
                        onClick={() => setCurrentImageIndex(index)}
                    />
                ))}
            </div>
        </div>
    );
};

export default BackgroundGalleryDetails;
