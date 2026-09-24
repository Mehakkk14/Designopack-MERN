import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  BedDouble,
  Bath,
  Gift,
  ShoppingBag,
  UtensilsCrossed,
  Award,
  CheckCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import banner1 from "@/assets/banner1.webp";
import banner2 from "@/assets/banner2.webp";
import banner3 from "@/assets/banner3.webp";
import banner4 from "@/assets/banner4.webp";
import ctaBackground from "@/assets/cta-background.png";
import { getActiveBanners, Banner } from "@/lib/api";
import { logger } from "@/lib/logger";
import { LazySection } from "@/components/LazySection";
import { FaInstagram, FaFacebookF } from "@/components/SocialIcons";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

// Client logos
import tajChandigarh from "@/assets/clients/taj-chandigarh.png";
import theParkDelhi from "@/assets/clients/the-park-delhi.png";
import tajLakefront from "@/assets/clients/taj-lakefront-bhopal.png";
import ajitBhawan from "@/assets/clients/ajit-bhawan.png";
import sarovarMahagun from "@/assets/clients/sarovar-portico-mahagun.png";
import prideHotels from "@/assets/clients/pride-hotels.png";
import sarovarGaurs from "@/assets/clients/sarovar-portico-gaurs.png";
import sahanaCorbett from "@/assets/clients/sahana-corbett.png";
import pilibhitHouse from "@/assets/clients/pilibhit-house.png";
import tajCorbett from "@/assets/clients/taj-corbett.png";
import tajRishikesh from "@/assets/clients/taj-rishikesh.png";
import jaypeePalace from "@/assets/clients/jaypee-palace.png";
import hyattRegency from "@/assets/clients/hyatt-regency.png";
import parkPlaza from "@/assets/clients/park-plaza.png";
import rawlaNarlai from "@/assets/clients/rawla-narlai.png";
import radisson from "@/assets/clients/radisson.png";
import mastiffHotel from "@/assets/clients/mastiff-hotel.png";
import tajAmerJaipur from "@/assets/clients/taj-amer-jaipur.png";
import tajRishikeshFull from "@/assets/clients/taj-rishikesh-full.png";
import crownePlaza from "@/assets/clients/crowne-plaza.png";
import sarovarAgra from "@/assets/clients/sarovar-premiere-agra.png";
import grandMercure from "@/assets/clients/grand-mercure.png";
import holidayInn from "@/assets/clients/holiday-inn.png";
import parkInn from "@/assets/clients/park-inn.png";
import citrusClassic from "@/assets/clients/citrus-classic.png";

// Static arrays moved outside component scope to prevent re-allocation thrashing
const staticBanners = [banner1, banner2, banner3, banner4];

const categories = [
  {
    icon: UtensilsCrossed,
    title: "Restaurant and Bar Menu",
    description:
      "Elegant menu presentation and tabletop solutions for dining spaces",
    routeCategory: "Restaurant and Bar Menu",
    image: "/restaurant.webp",
  },
  {
    icon: BedDouble,
    title: "Room Amenities",
    description:
      "Premium menu folders, trays, tissue boxes, and more in elegant Leatherette",
    routeCategory: "Room Amenities",
    image:
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80",
  },
  {
    icon: Bath,
    title: "Bathroom Amenities",
    description:
      "Luxury amenities and accessories in Resin and Leatherette finishes",
    routeCategory: "Bathroom Amenities",
    image: "/bathroom-equipment.webp",
  },
  {
    icon: ShoppingBag,
    title: "Food Packaging",
    description:
      "Premium boxes and carry bags in SBS, Kraft, and Kappa Board",
    routeCategory: "Food Packaging",
    image: "/food-packaging.webp",
  },
  {
    icon: Gift,
    title: "Gifting",
    description:
      "Customized hampers, photo frames, greeting cards, and corporate gifts",
    routeCategory: "Gifting",
    image: "/gifting-solutions.webp",
  },
];

const clientLogos = [
  { name: "Taj Chandigarh", logo: tajChandigarh },
  { name: "The Park New Delhi", logo: theParkDelhi },
  { name: "Taj Lakefront Bhopal", logo: tajLakefront },
  { name: "The Ajit Bhawan", logo: ajitBhawan },
  { name: "Sarovar Portico Mahagun", logo: sarovarMahagun },
  { name: "The Pride Hotels & Resorts", logo: prideHotels },
  { name: "Sarovar Portico The Gaurs", logo: sarovarGaurs },
  { name: "Sahana The Corbett Wilderness", logo: sahanaCorbett },
  { name: "Pilibhit House IHCL", logo: pilibhitHouse },
  { name: "Taj Corbett Resort & Spa", logo: tajCorbett },
  { name: "Taj Rishikesh Resort & Spa", logo: tajRishikesh },
  { name: "Jaypee Palace Hotel", logo: jaypeePalace },
  { name: "Hyatt Regency Delhi", logo: hyattRegency },
  { name: "Park Plaza Faridabad", logo: parkPlaza },
  { name: "Rawla Narlai Heritage Resort", logo: rawlaNarlai },
  { name: "Radisson", logo: radisson },
  { name: "Mastiff Hotel", logo: mastiffHotel },
  { name: "Taj Amer Jaipur", logo: tajAmerJaipur },
  { name: "Taj Rishikesh Resort & Spa Uttarakhand", logo: tajRishikeshFull },
  { name: "Crowne Plaza", logo: crownePlaza },
  { name: "Crystal Sarovar Premiere Agra", logo: sarovarAgra },
  { name: "Grand Mercure Agra", logo: grandMercure },
  { name: "Holiday Inn IHG", logo: holidayInn },
  { name: "Park Inn by Radisson", logo: parkInn },
  { name: "Citrus Classic", logo: citrusClassic },
];

const features = [
  "15+ Years of Excellence",
  "Premium Quality Materials",
  "Customization Available",
  "Trusted by 100+ Hotels",
];

const Home = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSliderActive, setIsSliderActive] = useState(false);
  const [, setBanners] = useState<Banner[]>([]);
  const [bannerImages, setBannerImages] = useState<string[]>([]);
  // Track indices of slides that have been loaded to prevent initial multi-image downloads
  const [loadedSlideIndices, setLoadedSlideIndices] = useState<Set<number>>(
    () => new Set([0])
  );

  useEffect(() => {
    const initAndLoad = async () => {
      logger.emoji.loading("🔄 Home: Loading active banners...");
      const result = await getActiveBanners();

      if (result.success && result.banners.length > 0) {
        logger.emoji.loading("✅ Home: Active banners loaded:", result.banners);
        setBanners(result.banners);
        const images = result.banners.map((banner) => banner.imageUrl);
        setBannerImages(images);
      } else {
        logger.emoji.loading("⚠️ Home: No active banners found. Using static defaults.");
        setBannerImages(staticBanners);
      }
    };

    initAndLoad();
  }, []);

  useEffect(() => {
    // Start slider timer after initial paint
    const timer = setTimeout(() => {
      setIsSliderActive(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const activeBanners = bannerImages.length > 0 ? bannerImages : staticBanners;

  useEffect(() => {
    if (!isSliderActive || activeBanners.length === 0) return;

    // Change image every 3.5 seconds
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % activeBanners.length;
        // Mark next slide as loaded before transitioning
        setLoadedSlideIndices((prev) => {
          if (!prev.has(nextIndex)) {
            const updated = new Set(prev);
            updated.add(nextIndex);
            return updated;
          }
          return prev;
        });
        return nextIndex;
      });
    }, 3500);

    return () => clearInterval(interval);
  }, [isSliderActive, activeBanners.length]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#4a1f1f] via-[#2d1515] to-[#1a0a0a]">
        {/* Background Slider */}
        <div className="absolute inset-0">
          {activeBanners.map((image, index) => {
            const isLoaded = loadedSlideIndices.has(index);
            const isCurrent = index === currentImageIndex;

            return (
              <div
                key={index}
                className="absolute inset-0 transition-opacity duration-[1500ms] ease-in-out will-change-opacity"
                style={{
                  opacity: isCurrent ? 0.5 : 0,
                  zIndex: isCurrent ? 1 : 0,
                }}
              >
                {/* SAFEGUARD: Only render <img> tag if slide has been activated */}
                {isLoaded && (
                  <img
                    src={image}
                    alt={`Banner ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading={index === 0 ? "eager" : "lazy"}
                    fetchPriority={index === 0 ? "high" : "low"}
                    decoding="async"
                    width={1920}
                    height={1080}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/20 z-[2]" />
        <div className="container mx-auto px-4 relative z-[3] text-center">
          <div className="max-w-4xl mx-auto animate-fade-in">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-heading font-bold text-white mb-10 leading-tight">
              End-to-End Packaging Partner for
              <br />
              <span className="text-primary">Premium Hospitality Brands</span>
            </h1>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="text-lg">
                <Link to="/products">Explore Products</Link>
              </Button>
              <Button size="lg" variant="secondary" asChild className="text-lg">
                <Link to="/contact">Request a Quote</Link>
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent"></div>
      </section>

      {/* Features Strip */}
      <section className="py-12 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center justify-center gap-3 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CheckCircle className="text-primary flex-shrink-0" size={24} />
                <span className="font-body font-medium text-foreground text-sm md:text-base">
                  {feature}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section — Lazy Loaded with ZERO CLS */}
      <LazySection minHeight="480px">
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-16 animate-slide-up">
              <h2 className="text-3xl md:text-5xl font-heading font-bold text-foreground mb-4">
                Our Product Categories
              </h2>
              <p className="text-muted-foreground font-body text-lg max-w-2xl mx-auto">
                Discover our comprehensive range of premium hospitality and
                packaging solutions
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 xl:gap-5">
              {categories.map((category, index) => {
                const Icon = category.icon;
                return (
                  <Link
                    key={index}
                    to={`/products/${encodeURIComponent(category.routeCategory)}`}
                    className="group animate-scale-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <Card className="h-full overflow-hidden hover-lift border-2 hover:border-primary transition-all duration-300">
                      <div className="relative h-36 overflow-hidden">
                        <img
                          src={category.image}
                          alt={category.title}
                          loading="lazy"
                          decoding="async"
                          width={400}
                          height={225}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                        <div className="absolute bottom-3 left-3 right-3">
                          <Icon className="text-primary mb-2" size={28} />
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-heading font-semibold text-base xl:text-lg mb-2 group-hover:text-primary transition-colors leading-snug">
                          {category.title}
                        </h3>
                        <p className="text-muted-foreground font-body text-xs xl:text-sm leading-relaxed line-clamp-3">
                          {category.description}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      </LazySection>

      {/* Clients Section — Lazy Loaded with ZERO CLS */}
      <LazySection minHeight="280px">
        <section className="py-16 bg-card">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Award className="text-primary mx-auto mb-4" size={48} />
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
                Trusted by India's Leading Hotels
              </h2>
              <p className="text-muted-foreground font-body">
                Proud partners of premium hospitality brands
              </p>
            </div>

            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              plugins={[
                Autoplay({
                  delay: 3000,
                }),
              ]}
              className="w-full max-w-6xl mx-auto"
            >
              <CarouselContent className="-ml-4">
                {clientLogos.map((client, index) => (
                  <CarouselItem
                    key={index}
                    className="pl-4 basis-1/2 md:basis-1/4"
                  >
                    <div className="group p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:scale-105 h-32 flex items-center justify-center">
                      <img
                        src={client.logo}
                        alt={client.name}
                        loading="lazy"
                        decoding="async"
                        width={200}
                        height={100}
                        className="max-w-full max-h-full w-auto h-auto object-contain transition-all duration-300"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
        </section>
      </LazySection>

      {/* CTA Section — Lazy Loaded with ZERO CLS & Deferred Background Image */}
      <LazySection minHeight="320px">
        <section className="relative py-20 px-4 text-white overflow-hidden">
          {/* Background Image - Lazy loaded inside section */}
          <div className="absolute inset-0">
            <img
              src={ctaBackground}
              alt=""
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover object-center"
            />
          </div>
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-black/60" />

          <div className="container mx-auto text-center relative z-10">
            <h2 className="text-3xl md:text-5xl font-heading font-bold mb-6 text-white">
              Ready to Elevate Your Brand?
            </h2>
            <p className="text-lg text-gray-200 font-body mb-8 max-w-2xl mx-auto">
              Let's create premium packaging solutions that perfectly represent
              your luxury brand
            </p>
            <Button
              size="lg"
              asChild
              className="text-lg bg-maroon hover:bg-red-900 text-white border-none"
            >
              <Link to="/contact">Get in Touch</Link>
            </Button>

            {/* Subtle Divider */}
            <div className="flex items-center justify-center my-8 max-w-xs sm:max-w-md mx-auto">
              <div className="flex-grow border-t border-white/20"></div>
              <span className="px-4 text-xs font-body font-medium uppercase tracking-widest text-gray-300">
                OR
              </span>
              <div className="flex-grow border-t border-white/20"></div>
            </div>

            {/* Follow Our Work Section */}
            <div className="text-center max-w-xl mx-auto">
              <h3 className="text-xl md:text-2xl font-heading font-bold text-white mb-2">
                Follow Our Journey
              </h3>
              <p className="text-sm md:text-base text-gray-200 font-body mb-6 leading-relaxed">
                Discover our latest hospitality packaging projects, premium product collections and company updates.
              </p>

              {/* Social Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="https://www.instagram.com/designopack.india?igsh=MWNscXhiMndvYnQ2cQ%3D%3D&utm_source=qr"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow DesignOPack on Instagram"
                  title="Follow DesignOPack on Instagram"
                  className="w-full sm:w-auto min-w-[180px] inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-lg bg-white/10 hover:bg-white/20 border border-white/25 text-white font-medium text-sm transition-all duration-300 hover-lift shadow-md hover:shadow-lg backdrop-blur-sm"
                >
                  <FaInstagram className="text-[#E4405F] text-xl flex-shrink-0" />
                  <span>Instagram</span>
                </a>

                <a
                  href="https://www.facebook.com/Designopackindia/?rdid=wgD0jKXtlQhboEJG"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow DesignOPack on Facebook"
                  title="Follow DesignOPack on Facebook"
                  className="w-full sm:w-auto min-w-[180px] inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-lg bg-white/10 hover:bg-white/20 border border-white/25 text-white font-medium text-sm transition-all duration-300 hover-lift shadow-md hover:shadow-lg backdrop-blur-sm"
                >
                  <FaFacebookF className="text-[#1877F2] text-xl flex-shrink-0" />
                  <span>Facebook</span>
                </a>
              </div>
            </div>
          </div>
        </section>
      </LazySection>
    </div>
  );
};

export default Home;

