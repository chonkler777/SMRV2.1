
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
      <NextTopLoader
        color="#86EFAC"
        height={3}
        showSpinner={false}
        shadow="0 0 10px #86EFAC,0 0 5px #86EFAC"
      />
        
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








