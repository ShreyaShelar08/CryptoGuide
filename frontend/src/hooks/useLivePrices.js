import { useState, useEffect, useRef } from 'react';

// CoinGecko IDs mapped to our internal asset IDs
const COINGECKO_IDS = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  SOL: 'solana',
  BNB: 'binancecoin',
  MATIC: 'matic-network',
  LINK: 'chainlink',
};

const FALLBACK_PRICES = {
  BTC: { price: 67000, change: 2.4, marketCap: 1320000000000, volume: 28000000000 },
  ETH: { price: 3500,  change: -1.2, marketCap: 420000000000, volume: 15000000000 },
  SOL: { price: 180,   change: 5.1, marketCap: 80000000000,  volume: 3500000000 },
  BNB: { price: 590,   change: 0.8, marketCap: 87000000000,  volume: 2200000000 },
  MATIC: { price: 0.9, change: -3.2, marketCap: 8500000000,  volume: 600000000 },
  LINK: { price: 18,   change: 1.9, marketCap: 10500000000,  volume: 700000000 },
};

export function useLivePrices() {
  const [prices, setPrices] = useState(FALLBACK_PRICES);
  const [sparklines, setSparklines] = useState({});
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  const fetchPrices = async () => {
    setLoading(true);
    setError(null);
    try {
      const ids = Object.values(COINGECKO_IDS).join(',');
      const res = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=10&page=1&sparkline=true&price_change_percentage=24h`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      const newPrices = {};
      const newSparklines = {};
      data.forEach(coin => {
        const id = Object.keys(COINGECKO_IDS).find(k => COINGECKO_IDS[k] === coin.id);
        if (!id) return;
        newPrices[id] = {
          price: coin.current_price,
          change: parseFloat((coin.price_change_percentage_24h || 0).toFixed(2)),
          marketCap: coin.market_cap,
          volume: coin.total_volume,
          high24h: coin.high_24h,
          low24h: coin.low_24h,
          supply: coin.circulating_supply,
        };
        if (coin.sparkline_in_7d?.price) {
          newSparklines[id] = coin.sparkline_in_7d.price;
        }
      });

      setPrices(prev => ({ ...prev, ...newPrices }));
      setSparklines(prev => ({ ...prev, ...newSparklines }));
      setLastUpdated(new Date());
    } catch (err) {
      console.warn('Price fetch failed, using fallback:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
    intervalRef.current = setInterval(fetchPrices, 30000); // refresh every 30s
    return () => clearInterval(intervalRef.current);
  }, []);

  return { prices, sparklines, lastUpdated, loading, error, refetch: fetchPrices };
}
