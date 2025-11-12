import { useEffect, useRef, useState } from "react"

import { Info } from "../Info";
import TradingViewChart from "./TradingviewChart";

const Dashboard = () => {
  const [theme, setTheme] = useState(
    window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  );

  const [ticker, setTicker] = useState({
    lastPrice: null,
    markPrice: null,
    high24h: null,
    low24h: null,
    turnover24h: null,
    price24hPcnt: null,
  });

  const [status, setStatus] = useState("Connecting...")
  const wsRef = useRef(null)
  const prevRef = useRef({ lastPrice: null })
  const [priceDirection, setPriceDirection] = useState(null)
  const flashTimer = useRef(null)

  useEffect(() => {
    const ws = new WebSocket("wss://stream.bybit.com/v5/public/linear")
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus("🟢 Connected")
      ws.send(JSON.stringify({ op: "subscribe", args: ["tickers.BTCUSDT"] }))
    };

    ws.onmessage = (evt) => {
      try {
        const payload = JSON.parse(evt.data);
        if (payload.topic === "tickers.BTCUSDT" && payload.data) {
            // console.log("Incoming Bybit Data:", payload.data);
          const data = payload.data
          setTicker((prev) => {
            const newLast = data.lastPrice ? Number(data.lastPrice) : prev.lastPrice
            const newMark = data.markPrice ? Number(data.markPrice) : prev.markPrice
            const newHigh = data.highPrice24h ? Number(data.highPrice24h) : prev.high24h
            const newLow = data.lowPrice24h ? Number(data.lowPrice24h) : prev.low24h
            const newTurnover = data.turnover24h ? Number(data.turnover24h) : prev.turnover24h
            const newPcnt = data.price24hPcnt
              ? Number(data.price24hPcnt) * 100
              : prev.price24hPcnt;

            const prevLast = prevRef.current.lastPrice;
            if (prevLast && newLast) {
              if (newLast > prevLast) triggerFlash("up");
              else if (newLast < prevLast) triggerFlash("down");
            }
            prevRef.current.lastPrice = newLast;

            return {
              lastPrice: newLast,
              markPrice: newMark,
              high24h: newHigh,
              low24h: newLow,
              turnover24h: newTurnover,
              price24hPcnt: newPcnt,
            };
          });
        }
      } catch (err) {
        console.error("WS parse error:", err)
      }
    };

    ws.onerror = () => setStatus("Error")
    ws.onclose = () => setStatus("❌ Disconnected")
    return () => {
      ws.close();
      clearTimeout(flashTimer.current);
    };
  }, []);

  function triggerFlash(direction) {
    setPriceDirection(direction);
    clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setPriceDirection(null), 600);
  }

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  const fmt = (v, d = 2) =>
    v == null ? "--" : Number(v).toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d });

  const pctColor =
    ticker.price24hPcnt == null
      ? ""
      : ticker.price24hPcnt >= 0
      ? "text-green-500"
      : "text-red-500";

  const bg = theme === "dark" ? "bg-gray-950 text-white" : "bg-gray-100 text-gray-900";
  const card = theme === "dark" ? "bg-gray-900 border-gray-700" : "bg-white border-gray-300";

  return (
    <div className={`min-h-screen ${bg} transition-colors duration-500`}>
      <div className="max-w-4xl mx-auto py-10 px-6">
        {/* header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Bitcoin Dashboard</h1>
          </div>

          <div className="flex items-center gap-3 mt-4 sm:mt-0">
            <span className="text-sm opacity-70">{status}</span>
            <button
              onClick={toggleTheme}
              className={`px-3 py-1.5 rounded-lg border transition-colors duration-300 ${
                theme === "dark"
                  ? "border-gray-700 bg-gray-800 hover:bg-gray-700"
                  : "border-gray-300 bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
          </div>
        </div>

        {/* card */}
        <div
          className={`rounded-2xl border p-6 shadow-md mb-10 transition-colors duration-300 ${card}`}
        >
          <div className="flex flex-col sm:flex-row justify-between gap-4 items-center">
            <div className="flex flex-col items-center sm:items-start">
              <div
                className={`text-4xl font-semibold ${
                  priceDirection === "up"
                    ? "text-green-400"
                    : priceDirection === "down"
                    ? "text-red-500"
                    : theme === "dark"
                    ? "text-yellow-300"
                    : "text-yellow-600"
                } transition-all duration-300`}
              >
                {ticker.lastPrice ? `$${fmt(ticker.lastPrice, 2)}` : "--"}
              </div>
              <span className="text-sm opacity-70 mt-1">Last Traded Price</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full sm:w-auto">
              <Info label="Mark Price" value={fmt(ticker.markPrice)} prefix="$" theme={theme} />
              <Info label="24h High" value={fmt(ticker.high24h)} prefix="$" theme={theme} />
              <Info label="24h Low" value={fmt(ticker.low24h)} prefix="$" theme={theme} />
              <Info label="24h Turnover" value={fmt(ticker.turnover24h)} theme={theme} />
              <Info
                label="24h % Change"
                value={`${fmt(ticker.price24hPcnt)}%`}
                className={pctColor}
                theme={theme}
              />
            </div>
          </div>
        </div>

        {/*chart */}
        <TradingViewChart symbol="BTCUSDT" theme={theme} />
      </div>
    </div>
  );
};


export default Dashboard;
