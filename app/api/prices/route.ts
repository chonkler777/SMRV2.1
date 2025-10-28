import { NextResponse } from 'next/server';

interface CoinGeckoSolResponse {
  solana?: {
    usd?: number;
  };
}

interface CoinGeckoTokenResponse {
  [key: string]: {
    usd?: number;
  };
}

interface JupiterPriceResponse {
  [key: string]: {
    usdPrice?: number;
  };
}


async function fetchJSON(url: string): Promise<any> {
  try {
    const res = await fetch(url, { next: { revalidate: 30 } });
    if (!res.ok) throw new Error("network");
    return await res.json();
  } catch (err) {
    console.warn("Direct fetch failed, falling back to CORS proxy:", err);

    const proxyUrl = "https://api.allorigins.win/raw?url=" + encodeURIComponent(url);
    const res2 = await fetch(proxyUrl, { next: { revalidate: 30 } });
    if (!res2.ok) throw new Error("proxy failed");
    return await res2.json();
  }
}

export async function GET() {
  try {
    const [solJson, chonkJson]: [CoinGeckoSolResponse, CoinGeckoTokenResponse] = await Promise.all([
      fetchJSON(
        "https://api.coingecko.com/api/v3/simple/price?" +
        "ids=solana&vs_currencies=usd"
      ),
      fetchJSON(
        "https://api.coingecko.com/api/v3/simple/token_price/solana?" +
        "contract_addresses=AT7RRrFhBU1Dw1WghdgAqeNKNXKomDFXm77owQgppump" +
        "&vs_currencies=usd"
      ),
    ]);

    const solPrice = solJson.solana?.usd || 0;
    const chonkKey = Object.keys(chonkJson)[0];
    const chonkPrice = chonkJson[chonkKey]?.usd || 0;


    const mintAddress = "ChoNKscpdU3hPd1N3q8a3FPvPcuj5fsg1dA5WnHbTvZV";
    const jupiterResponse = await fetch(
      `https://lite-api.jup.ag/price/v3?ids=${mintAddress}`,
      { next: { revalidate: 30 } }
    );
    const jupiterPrice: JupiterPriceResponse = await jupiterResponse.json();
    const chonkerPrice = jupiterPrice[mintAddress]?.usdPrice || 0;

    return NextResponse.json({
      solPrice,
      chonkPrice,
      chonkerPrice,
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('Price fetch error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch prices',
        solPrice: 0,
        chonkPrice: 0,
        chonkerPrice: 0
      },
      { status: 500 }
    );
  }
}