import React, { useEffect, useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import { Button } from "@mui/material";

const BackgroundGalleryDetails = ({ images }) => {
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
                setIsFading(true);
                setTimeout(() => {
                    setCurrentImageIndex(prevIndex => (prevIndex + 1) % images.length);
                    setIsFading(false);
                }, 5000);
            }, 5000);

            return () => clearInterval(interval);
        }
    }, [images]);


    // Render nothing if images is undefined, not an array, or empty
    if (!images || !Array.isArray(images) || images.length === 0) {
        return null;
    }

    return (
        <div {...handlers} style={{
            position: 'relative',
            overflow: 'hidden',
            width: '100%',
            height: '250px', // Adjust height for better layout in cards
            zIndex: 2,
        }}>
            <div
                style={{
                    backgroundImage: `url(${images[currentImageIndex]})`,
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: 'cover', // Ensure the image covers the card space
                    width: '100%',
                    height: '100%',
                    opacity: isFading ? 0 : 1,
                    transition: 'opacity 0.5s ease-in-out',
                }}
            />
            <Button onClick={() => setCurrentImageIndex(prevIndex => (prevIndex - 1 + images.length) % images.length)} style={{
                position: 'absolute',
                left: '10px',  // Adjust for better positioning
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 2 // Ensure it's above the background
            }}>
                {"<"} {/* Replace with styled arrow */}
            </Button>
            <Button onClick={() => setCurrentImageIndex(prevIndex => (prevIndex + 1) % images.length)} style={{
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
                {images.map((_, index) => (
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

export default BackgroundGalleryDetails;
