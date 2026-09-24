import { memo } from "react";
import { FaWhatsapp } from "@/components/SocialIcons";

const WhatsAppButton = memo(() => {
  const whatsappNumber = "918595555488";
  const message = "Hi! I'm interested in your hospitality products.";

  const handleClick = () => {
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 w-[52px] h-[52px] sm:w-[56px] sm:h-[56px] rounded-full bg-[#25D366] hover:bg-[#20BA5A] text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center"
      aria-label="Chat on WhatsApp"
      title="Chat on WhatsApp"
    >
      <FaWhatsapp className="text-[28px] sm:text-[30px] flex-shrink-0" />
    </button>
  );
});

export default WhatsAppButton;
