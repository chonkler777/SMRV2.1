import { Roboto, Montserrat, Alexandria} from 'next/font/google';

export const roboto = Roboto({
  weight: ['400', '500', '600', '700', '800'],
  subsets: ['latin'],
  variable: '--font-roboto',  
});

export const montserrat = Montserrat({
  weight: ['400', '500', '600', '700', '800'],
  subsets: ['latin'],
  variable: '--font-montserrat',  
});

export const alexandria = Alexandria({
  weight: ['400', '500', '600', '700', '800'],
  subsets: ['latin'],
  variable: '--font-alexandria',
});