import localFont from "next/font/local";
import { Inter } from "next/font/google";

export const DynaPuff= localFont({
  src: "./fonts/DynaPuff-Regular.ttf",
  variable: "--font-DynaPuff",
});

export const inter = Inter({
  subsets: ["latin"],    
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});
