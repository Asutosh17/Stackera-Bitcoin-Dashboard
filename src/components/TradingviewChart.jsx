import { useEffect, useRef } from "react";

const TradingViewChart = ({ symbol = "BTCUSDT", theme = "dark" }) => {
  const container = useRef(null)

  useEffect(() => {
    if (!container.current) return;
    container.current.innerHTML = ""

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: `BYBIT:${symbol}`,
      interval: "15",
      timezone: "Etc/UTC",
      theme: theme,
      style: "1",
      locale: "en",
      enable_publishing: false,
      hide_top_toolbar: false,
      allow_symbol_change: false,
      withdateranges: true,
      studies: ["RSI@tv-basicstudies", "MACD@tv-basicstudies"],
    });

    container.current.appendChild(script)
  }, [symbol, theme])

  const bg =
    theme === "dark" ? "bg-gray-900 border-gray-700" : "bg-white border-gray-300";

  return (
    <div
      className={`rounded-2xl overflow-hidden shadow-md border ${bg} transition-colors duration-500`}
      style={{ height: "500px" }}
    >
      <div
        className="tradingview-widget-container"
        ref={container}
        style={{ height: "100%", width: "100%" }}
      />
    </div>
  );
};

export default TradingViewChart;
