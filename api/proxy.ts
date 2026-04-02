import axios, { AxiosInstance, isAxiosError } from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';

type FetchResult =
  | { result: string; err: null }
  | { result: null; err: string };

class Proxy {
  proxyAgent: HttpsProxyAgent<string>;
  api: AxiosInstance;

  constructor() {
    this.proxyAgent = new HttpsProxyAgent(process.env.BRIGHT_DATA_PROXY!, {
      rejectUnauthorized: false,
    });
    this.api = axios.create({
      httpsAgent: this.proxyAgent,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Accept-Language': 'en-US,en;q=0.9',
        'Sec-Ch-Ua': '"Not(A:Brand";v="8", "Chromium";v="144"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"macOS"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
      },
    });
  }

  async fetch(url: string): Promise<FetchResult> {
    const available = this.available(url);

    if (available === 'no') {
      return { result: null, err: 'Proxy is blocked & we know it' };
    }

    if (available === 'never_seen') {
      return { result: null, err: 'This is an unknown domain' };
    }

    const domain = new URL(url).hostname;
    try {
      const response = await this.api.get(url);
      return { result: response.data, err: null };
    } catch (e) {
      if (isAxiosError(e)) {
        if (e.message === 'stream has been aborted') {
          console.error(
            `${domain} has detected our proxy and won't allow us to connect due to their security measures.`,
          );
          return { result: null, err: e.message };
        }
      }
      const err = e as Error;
      return { result: null, err: err.message };
    }
  }

  available(url: string): 'yes' | 'no' | 'never_seen' {
    const { hostname } = new URL(url);
    const domain = hostname.replace('www.', '').split('.')[0];
    switch (SITE_AVAILABILITY[domain]) {
      case true:
        return 'yes';
      case false:
        return 'no';
      default:
        return 'never_seen';
    }
  }
}

export const proxy = new Proxy();

const SITE_AVAILABILITY: Record<string, boolean> = {
  allrecipes: true,
  foodnetwork: true,
  simplyrecipes: true,
  tasteofhome: true,
  epicurious: true,
  delish: false,
  kingarthurbaking: true,
  tasty: true, // tasty.co → hostname split gives 'tasty', not 'tastyco'
  cookpad: true,
};
