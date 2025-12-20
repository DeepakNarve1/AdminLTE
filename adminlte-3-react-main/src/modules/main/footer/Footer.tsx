import { useTranslation } from "react-i18next";
import { DateTime } from "luxon";
import packageJSON from "../../../../package.json";

const Footer = ({
  style = {},
  containered,
}: {
  style?: any;
  containered?: boolean;
}) => {
  const [t] = useTranslation();

  return (
    <footer
      className="bg-white border-t border-gray-200 py-4 px-6 text-sm text-gray-600 w-full relative z-1034 transition-[margin-left] duration-300 ease-in-out"
      style={{ ...style }}
    >
      <div
        className={`w-full flex justify-between items-center ${
          containered ? "container mx-auto" : ""
        }`}
      >
        <strong>
          <span>Copyright © {DateTime.now().toFormat("y")} </span>
          <a
            href="https://erdkse.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800"
          >
            erdkse.com
          </a>
          <span>.</span>
        </strong>
        <div className="hidden sm:inline-block">
          <b>{t("footer.version")}</b>
          <span>&nbsp;{packageJSON.version}</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
