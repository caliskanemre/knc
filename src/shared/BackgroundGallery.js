import React, { useEffect, useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import { Button } from "@mui/material";

const BackgroundGallery = ({ images }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isFading, setIsFading] = useState(false);

    const handlers = useSwipeable({
        onSwipedLeft: () => {
            setTimeout(() => {
                setCurrentImageIndex(prevIndex => (prevIndex + 1) % images.length);
            }); // Match this delay with the CSS transition time
        },
        onSwipedRight: () => {
            setTimeout(() => {
                setCurrentImageIndex(prevIndex => (prevIndex - 1 + images.length) % images.length);
            }); // Match this delay with the CSS transition time
        },
        preventDefaultTouchmoveEvent: true,
        trackMouse: true
    });

    useEffect(() => {
        if (images && Array.isArray(images)) {
            const interval = setInterval(() => {
                setIsFading(true); // Begin fade-out
                setTimeout(() => {
                    setCurrentImageIndex(prevIndex => (prevIndex + 1) % images.length);
                    setIsFading(false); // Begin fade-in
                }, 500); // Delay for fade-out, should match CSS transition time
            }, 100000);

            return () => clearInterval(interval);
        }
    }, [images]);


    // Render nothing if images is undefined, not an array, or empty
    if (!images || !Array.isArray(images) || images.length === 0) {
        return null;
    }

    const goToNextImage = () => {
        setCurrentImageIndex(prevIndex => (prevIndex + 1) % images.length);
    };

    const goToPreviousImage = () => {
        setCurrentImageIndex(prevIndex => (prevIndex - 1 + images.length) % images.length);
    };

    return (
        <div {...handlers} style={{
            position: 'relative',
            overflow: 'hidden',
            backgroundImage: `url(${images[currentImageIndex]})`,
            backgroundPosition: 'center center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '%100 100%',
            width: '100vw', // Full viewport width
            height: '45vh',
            zIndex: 2,
            opacity: isFading ? 0 : 1, // Control opacity for fade-in/out
            transition: 'opacity 0.5s ease-in-out', // Smooth transition for fade effect
        }}>
            <Button onClick={goToPreviousImage} style={{
                position: 'absolute',
                left: '10px',  // Adjust for better positioning
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 2 // Ensure it's above the background
            }}>
                {"<"} {/* Replace with styled arrow */}
            </Button>
            <Button onClick={goToNextImage} style={{
                position: 'absolute',
                right: '10px',  // Adjust for better positioning
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 2 // Ensure it's above the background
            }}>
                {">"} {/* Replace with styled arrow */}
            </Button>
            <div style={{
                position: 'absolute',
                bottom: '10px',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                zIndex: 2 // Ensure it's above the background
            }}>
                {images.map((image, index) => (
                    <div
                        key={index}
                        style={{
                            height: '10px',
                            width: '10px',
                            borderRadius: '50%',
                            backgroundColor: currentImageIndex === index ? 'white' : 'gray',
                            margin: '0 5px',
                            cursor: 'pointer'
                        }}
                        onClick={() => setCurrentImageIndex(index)}
                    />
                ))}
            </div>
        </div>
    );
};

export default BackgroundGallery;
