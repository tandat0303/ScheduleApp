import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const AppLoading = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#EAF7FD] transition-opacity duration-500">
      <DotLottieReact
        src="/Flight.lottie"
        autoplay
        loop
        style={{ width: 220, height: 220 }}
      />
    </div>
  );
};

export default AppLoading;
