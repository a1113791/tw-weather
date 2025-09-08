import { useState, useMemo } from "react";
import { useCity12hr } from "../api/CwbClient.jsx";

function WeatherCard() {
  const { data, loading, error, reload } = useCity12hr();
  const [city, setCity] = useState("臺北市");

  // 下拉選單：所有縣市名稱
  const cityOptions = useMemo(() => {
    return Array.isArray(data)
      ? data.map((loc) => loc.locationName).filter(Boolean)
      : [];
  }, [data]);

  // 選中城市的預報
  const current = useMemo(() => {
    const loc = data.find((l) => l.loctionName === city);
    if (!loc) return null;
    const pick = (name) =>
      loc.weatherElement.find((e) => e.elementName === name)?.time?.[0]
        ?.parameter?.parameterName ?? "";
    return {
      loctionName: loc.loctionName,
      wx: pick("Wx"),
      pop: pick("PoP"),
      minT: pick("MinT"),
      maxT: pick("MaxT"),
    };
  }, [data, city]);

  return (
    <>
      <div className="card shadow-sm">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="card-title m-0">台灣 12 小時天氣</h5>
            <button
              className="btn btn-sm btn-outline-primary"
              onClick={reload}
              disabled={loading}
            >
              {loading ? "更新中…" : "重新整理"}
            </button>
          </div>

          <div className="mb-3">
            <select
              className="form-select w-auto"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            >
              {cityOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {error && <div className="alert alert-danger py-2">{error}</div>}
          {loading && <div className="text-muted">載入中…</div>}

          {current && !loading && !error && (
            <div className="border rounded p-3">
              <div className="fw-semibold">{current.locationName}</div>
              <div>{current.wx}</div>
              <div>降雨機率：{current.pop}%</div>
              <div>
                溫度：{current.minT}°C ~ {current.maxT}°C
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
export default WeatherCard;
