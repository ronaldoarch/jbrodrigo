import { useState, useEffect } from 'react';
import './Carousel.css';

const Carousel = ({ banners }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [banners.length]);

  if (!banners || banners.length === 0) {
    return null;
  }

  return (
    <div className="carousel">
      <div
        className="carousel-track"
        style={{
          transform: `translateX(-${currentIndex * 100}%)`,
        }}
      >
        {banners.map((banner, index) => (
          <div key={banner.id} className="carousel-slide">
            {banner.link_url ? (
              <a href={banner.link_url} target="_blank" rel="noopener noreferrer">
                <img src={banner.image_url} alt={banner.title} />
              </a>
            ) : (
              <img src={banner.image_url} alt={banner.title} />
            )}
          </div>
        ))}
      </div>

      {banners.length > 1 && (
        <>
          <div className="carousel-dots">
            {banners.map((_, index) => (
              <button
                key={index}
                className={`carousel-dot ${index === currentIndex ? 'active' : ''}`}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
          <button
            className="carousel-nav carousel-prev"
            onClick={() =>
              setCurrentIndex(
                currentIndex === 0 ? banners.length - 1 : currentIndex - 1
              )
            }
          >
            ‹
          </button>
          <button
            className="carousel-nav carousel-next"
            onClick={() =>
              setCurrentIndex((currentIndex + 1) % banners.length)
            }
          >
            ›
          </button>
        </>
      )}
    </div>
  );
};

export default Carousel;

