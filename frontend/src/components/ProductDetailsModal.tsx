import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState, memo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import QuoteModal from "./QuoteModal";
import { ProductImage } from "@/lib/api";

interface ProductDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  productDescription?: string;
  productCategories?: string[];
  productMedia: ProductImage[];
}

const ProductDetailsModal = memo(({
  isOpen,
  onClose,
  productName,
  productDescription,
  productCategories = [],
  productMedia,
}: ProductDetailsModalProps) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const trackRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setSelectedImageIndex(0);
    if (trackRef.current) {
      trackRef.current.scrollTo({ left: 0, behavior: "auto" });
    }
  }, [isOpen, productName, productMedia.length]);

  const scrollToImage = (index: number) => {
    const track = trackRef.current;
    if (!track) return;

    const slideWidth = track.clientWidth;
    track.scrollTo({
      left: slideWidth * index,
      behavior: "smooth",
    });
    setSelectedImageIndex(index);
  };

  const handleScroll = () => {
    const track = trackRef.current;
    if (!track || productMedia.length === 0) return;

    const slideWidth = track.clientWidth || 1;
    const nextIndex = Math.round(track.scrollLeft / slideWidth);
    const clampedIndex = Math.max(
      0,
      Math.min(nextIndex, productMedia.length - 1),
    );

    if (clampedIndex !== selectedImageIndex) {
      setSelectedImageIndex(clampedIndex);
    }
  };

  const handleRequestQuote = () => {
    setIsQuoteModalOpen(true);
  };

  const goToPreviousImage = () => {
    if (productMedia.length === 0) return;
    const nextIndex =
      (selectedImageIndex - 1 + productMedia.length) % productMedia.length;
    scrollToImage(nextIndex);
  };

  const goToNextImage = () => {
    if (productMedia.length === 0) return;
    const nextIndex = (selectedImageIndex + 1) % productMedia.length;
    scrollToImage(nextIndex);
  };

  const activeMedia = productMedia[selectedImageIndex] || productMedia[0];

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-heading">
              {productName}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Swipeable Product Image Gallery */}
            <div className="space-y-2">
              <div className="relative">
                <div
                  ref={trackRef}
                  onScroll={handleScroll}
                  className="flex w-full overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide"
                  style={{ WebkitOverflowScrolling: "touch", height: "60vh" }}
                >
                  {productMedia.map((mediaItem, index) => (
                    <div
                      key={index}
                      className="relative flex-shrink-0 snap-center bg-gray-50"
                      style={{ minWidth: "100%", width: "100%", height: "100%" }}
                    >
                      <img
                        src={mediaItem.imageUrl}
                        alt={`${productName} - View ${index + 1}`}
                        loading="lazy"
                        decoding="async"
                        style={{
                          position: "absolute",
                          inset: 0,
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                        }}
                      />
                    </div>
                  ))}
                </div>

                {productMedia.length > 1 ? (
                  <>
                    <button
                      type="button"
                      onClick={goToPreviousImage}
                      aria-label="Previous image"
                      className="absolute left-3 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white/90 p-2 text-foreground shadow-sm transition-all hover:bg-white md:flex"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={goToNextImage}
                      aria-label="Next image"
                      className="absolute right-3 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white/90 p-2 text-foreground shadow-sm transition-all hover:bg-white md:flex"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </>
                ) : null}
              </div>

              {productMedia.length > 1 ? (
                <div className="flex items-center justify-center gap-1.5">
                  {productMedia.map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => scrollToImage(index)}
                      aria-label={`View image ${index + 1}`}
                      className={`h-2 w-2 rounded-full transition-all ${selectedImageIndex === index
                          ? "bg-muted-foreground/70"
                          : "bg-muted-foreground/25 hover:bg-muted-foreground/45"
                        }`}
                    />
                  ))}
                </div>
              ) : null}
            </div>

            {/* Product Description */}
            <div className="space-y-3">
              <h3 className="text-lg font-heading font-semibold">
                Product Details
              </h3>
              {productDescription ? (
                <p className="text-muted-foreground leading-relaxed">
                  {productDescription}
                </p>
              ) : null}
              {activeMedia?.description ? (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {activeMedia.description}
                </p>
              ) : null}
              {productCategories.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {productCategories
                    .filter((cat) => !cat.includes("Accessories"))
                    .map((category, index) => (
                      <span
                        key={index}
                        className="bg-card border border-border px-3 py-1 rounded-full text-xs font-body"
                      >
                        {category}
                      </span>
                    ))}
                </div>
              )}
            </div>

            {/* Action Button */}
            <div className="flex gap-3 pt-4 border-t">
              <Button onClick={handleRequestQuote} size="lg" className="flex-1">
                Request Quote
              </Button>
              <Button onClick={onClose} size="lg" variant="outline">
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Nested Quote Modal */}
      <QuoteModal
        isOpen={isQuoteModalOpen}
        onClose={() => {
          setIsQuoteModalOpen(false);
          onClose();
        }}
        productName={productName}
      />
    </>
  );
});

export default ProductDetailsModal;
