// Manuel olarak eklenen müşteri yorumları
// Trendyol mağazamızdan alıntıdır

export const productReviews = {
  // Örnek ürün ID'leri için yorumlar
  // Format: productId: [{ username, rating, comment, date }]

  // Örnek yorumlar - gerçek ürün ID'lerinize göre düzenleyin
  "27": [
    {
      username: "Merve İ.",
      rating: 5,
      comment: "Ürün dün elime ulaştı ve inanılmaz şekilde çok memnun kaldım , içime sinerek kullanacağım ve hediye ettiğim kişiler de çok memnun kaldı elinize emeğinize sağlık ☺️ teşekkür ederim",
      date: "2025-09-30",
      source: "Trendyol mağazamızdan alıntıdır"
    },
    {
      username: "Zeynep Y.",
      rating: 5,
      comment: "Hızlı kargo ve özenli paketleme. Ürün çok şık, herkese tavsiye ederim.",
      date: "2025-08-20",
      source: "Etsy mağazamızdan alıntıdır"
    },
    {
      username: "Merve D.",
      rating: 5,
      comment: "Kalitesi çok iyi, fiyatına göre muhteşem. Teşekkürler!",
      date: "2025-07-10",
      source: "Trendyol mağazamızdan alıntıdır"
    }
  ],

  "69": [
    {
      username: "Rana D.",
      rating: 5,
      comment: "çok guzelll hiç yorum yok diye tereddüt etmiştim ama çok tatlı paketlemeside guzeldi kendi kinamda kına çıkışında kullanmak için aldım",
      date: "2025-09-25",
      source: "Trendyol mağazamızdan alıntıdır"
    },
    {
      username: "Elif T.",
      rating: 5,
      comment: "Kalitesi çok iyi, fiyatına göre muhteşem. Teşekkürler!",
      date: "2024-08-15",
      source: "Trendyol mağazamızdan alıntıdır"
    }
  ],
  "17": [
    {
      username: "Gulbahar K.",
      rating: 5,
      comment: "Amazing quality, came even before the date I was expecting it to. Amazing customer service as well!! I would totally recommend ordering your henna night decorations from here!",
      date: "2025-08-21",
      source: "Etsy mağazamızdan alıntıdır"
    },
  ],
    "36": [
    {
      username: "Tugce K.",
      rating: 4,
      comment: "Really Beautiful , but it’s too much Expensive and when arrived Canada they charge me duties,taxes and FedEx fees",
      date: "2025-08-21",
      source: "Etsy mağazamızdan alıntıdır"
    },
    {
      username: "Aysha A.",
      rating: 5,
      comment: "amazing!! great quality and fast shipping!",
      date: "2025-06-30",
      source: "Instagram mağazamızdan alıntıdır"
    },
  ]

  // Yeni ürünler için buraya yorum ekleyebilirsiniz
  // "ürünID": [{ username: "İsim", rating: 5, comment: "Yorum", date: "YYYY-MM-DD", source: "Trendyol mağazamızdan alıntıdır" }]
};

// Ürün için ortalama puan hesaplama
export const getAverageRating = (productId) => {
  const reviews = productReviews[String(productId)];
  if (!reviews || reviews.length === 0) return 0;

  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  return (sum / reviews.length);
};

// Ürün için toplam yorum sayısı
export const getReviewCount = (productId) => {
  const reviews = productReviews[String(productId)];
  return reviews ? reviews.length : 0;
};

// Ürün yorumlarını getir
export const getProductReviews = (productId) => {
  return productReviews[String(productId)] || [];
};
