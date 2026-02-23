import LYGLogo from "../../src/assets/LYLogo_White 1.png";

const Header = () => {
  return (
    <div className="bg-white flex-shrink-0 md:mb-5">
      <div className="w-full mx-auto px-8 py-3 flex items-center justify-between">
        <div className="flex items-stretch gap-3">
          <div className="flex items-center text-2xl md:text-4xl font-extrabold text-[#1e64ee]">
            LYG
          </div>

          <div className="flex flex-col justify-between">
            <div className="text-xl font-semibold">外籍主管休假行事曆</div>
            <div className="text-sm text-gray-500">
              Expat Manager Leave Calendar
            </div>
          </div>
        </div>

        <img src={LYGLogo} alt="LYG" className="h-12 w-auto" />
      </div>
    </div>
  );
};

export default Header;
