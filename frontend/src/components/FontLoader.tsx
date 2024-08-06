import { useEffect } from "react";

const loadFonts = () => {
  const styleElement = document.createElement("style");
  document.head.appendChild(styleElement);
  const fontStyles = `
      @font-face {
        font-family: 'Gilroy-Thin';
        src: url('../gilroy/Gilroy-Thin.ttf') format('truetype');
        font-weight: 100;
      }
      @font-face {
        font-family: 'Gilroy-Light';
        src: url('../gilroy/Gilroy-Light.ttf') format('truetype');
        font-weight: 300;
      }
      @font-face {
        font-family: 'Gilroy-Regular';
        src: url('../gilroy/Gilroy-Regular.ttf') format('truetype');
        font-weight: 400;
      }
      @font-face {
        font-family: 'Gilroy-SemiBold';
        src: url('../gilroy/Gilroy-SemiBold.ttf') format('truetype');
        font-weight: 600;
      }
      @font-face {
        font-family: 'Gilroy-Heavy';
        src: url('../gilroy/Gilroy-Heavy.ttf') format('truetype');
        font-weight: 800;
      }
    `;
  styleElement.appendChild(document.createTextNode(fontStyles));
};

export default loadFonts;
