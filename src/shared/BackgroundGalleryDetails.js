import React, {useEffect, useState} from 'react';
import { useSwipeable } from 'react-swipeable';
import {Button} from "@mui/material";

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
        const interval = setInterval(() => {
            setIsFading(true); // Begin fade-out
            setTimeout(() => {
                setCurrentImageIndex(prevIndex => (prevIndex + 1) % images.length);
                setIsFading(false); // Begin fade-in
            }, 500); // Delay for fade-out, should match CSS transition time
        }, 100000);

        return () => clearInterval(interval);
    }, [images.length]);
    const goToNextImage = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    };

    const goToPreviousImage = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
    };


    return (
        <div {...handlers} style={{
            position: 'relative',
            overflow: 'hidden',
            width: '100%',
            height: '40vh',
            zIndex: 2,
            opacity: isFading ? 0 : 1,
            transition: 'opacity 0.5s ease-in-out'
        }}>
            {/* Blurred background pseudo-element */}
            <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
                backgroundImage: `url(${images[currentImageIndex]})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'blur(10px)',
                zIndex: -1,
            }}></div>

            {/* Foreground sharp image */}
            <img src={images[currentImageIndex]} alt="Foreground Content" style={{
                position: 'relative',
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
                maxWidth: '1500px',
                maxHeight: '600px',
                backgroundPosition: 'center',
                zIndex: 1,
            }} />
            <Button onClick={goToPreviousImage} style={{
                position: 'absolute',
                left: '10px',  // Adjust for better positioning
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 2 // Ensure it's above the background
            }}>
                {"<"}  {/* Replace with styled arrow */}
            </Button>
            <Button onClick={goToNextImage} style={{
                position: 'absolute',
                right: '10px',  // Adjust for better positioning
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 2 // Ensure it's above the background
            }}>
                {">"}  {/* Replace with styled arrow */}
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
export default BackgroundGallery