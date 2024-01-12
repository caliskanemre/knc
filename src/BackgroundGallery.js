import React, {useEffect, useState} from 'react';
import { useSwipeable } from 'react-swipeable';
import {Button} from "@mui/material";

const BackgroundGallery = ({ images }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const handlers = useSwipeable({
        onSwipedLeft: () => setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length),
        onSwipedRight: () => setCurrentImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length),
        preventDefaultTouchmoveEvent: true,
        trackMouse: true
    });

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex(prevIndex => (prevIndex + 1) % images.length);
        }, 5000);

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
            position: 'relative',  // Ensure this container is positioned relatively
            backgroundImage: `url(${images[currentImageIndex]})`,
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            width: '100%',
            height: '40vh' // Adjust size as needed

        }}>
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