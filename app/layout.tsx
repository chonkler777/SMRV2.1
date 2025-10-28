
import { roboto, montserrat, alexandria } from "@/lib/font";
import "./globals.css";
import Navbar from "./global-components/Navbar";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { AuthProvider } from "@/AuthContext/AuthProvider";
import { WalletProvider } from "@/AuthContext/WalletProvider";
import { QueryProvider } from "@/AuthContext/QueryProvider";
import { PriceProvider } from "@/context/ChonkPrice";
import BottomBar from "@/components/BottomBar";
import NextTopLoader from 'nextjs-toploader'; 
import ConditionalTopLoader from "@/components/ConditionalTopLoader";


export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal?: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${roboto.variable} ${montserrat.variable} ${alexandria.variable}`}>
      <body className="">
        {/* <ConditionalTopLoader/> */}
        
        <QueryProvider>
          <WalletProvider>
            <AuthProvider>
              <Navbar/>
              <PriceProvider>
                {children}
                {modal}
                <BottomBar/>
              </PriceProvider>
              <ToastProvider/>
            </AuthProvider>
          </WalletProvider>
        </QueryProvider>
      </body>
    </html>
  );
}








