import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export const SearchLoadingOverlay = ({ visible }: { visible: boolean }) => {
  if (!visible) return null;

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/60 backdrop-blur-sm rounded-b-xl">
      <DotLottieReact
        src="/Flight.lottie"
        autoplay
        loop
        style={{ width: 160, height: 160 }}
      />
    </div>
  );
};
