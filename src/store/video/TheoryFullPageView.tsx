import { videoStyles } from "@/styles/video";
interface TheoryFullPageViewProps {
  isOpen: boolean;
  title: string;
  description: string;
  onClose: () => void;
}

export default function TheoryFullPageView({
  isOpen,
  title,
  description,
  onClose,
}: TheoryFullPageViewProps) {
  return (
    <div
      className={`fixed inset-0 z-50 bg-[radial-gradient(circle_at_12%_0%,rgba(34,21,82,0.34),rgba(3,6,16,0.97)_36%),linear-gradient(140deg,#02050f,#040814_48%,#02050f)] transition-all duration-300 ease-out ${isOpen ? "opacity-100 scale-100" : "pointer-events-none opacity-0 scale-95"}`}
      aria-hidden={!isOpen}
    >
      <button
        type="button"
        onClick={onClose}
        className={videoStyles.style_13bc221fb0ebbe}
      >
        X
      </button>

      <div className={videoStyles.style_bd43092952bc7}>
        <div className={videoStyles.style_cadc4f99d65c}>
          <h2 className={videoStyles.style_1cfe41c4a762dd}>{title}</h2>
          <p className={videoStyles.style_14d56f17af8ed1}>{description}</p>
        </div>
      </div>
    </div>
  );
}
