import { useState, useMemo, useEffect } from "react";
import { useCity12hr } from "../api/CwbClient.jsx";

const CITY_LIST = [
  "基隆市",
  "臺北市",
  "新北市",
  "桃園市",
  "新竹市",
  "新竹縣",
  "苗栗縣",
  "臺中市",
  "彰化縣",
  "南投縣",
  "雲林縣",
  "嘉義市",
  "嘉義縣",
  "臺南市",
  "高雄市",
  "屏東縣",
  "宜蘭縣",
  "花蓮縣",
  "臺東縣",
  "澎湖縣",
  "金門縣",
  "連江縣",
];

function WeatherCard() {
  const { data, loading, error, reload } = useCity12hr();
  const [city, setCity] = useState("臺北市");

  // 當資料回來後，如果目前 city 不在清單，改選第一筆
  const apiCityList = useMemo(
    () =>
      Array.isArray(data)
        ? data.map((l) => l?.locationName).filter(Boolean)
        : [],
    [data]
  );
  useEffect(() => {
    if (apiCityList.length && !apiCityList.includes(city)) {
      setCity(apiCityList[0]);
    }
  }, [apiCityList, city]);

  const normalize = (s) => (s || "").trim().replace("台", "臺");

  // 依選定城市取出 Wx/PoP/MinT/MaxT
  const current = useMemo(() => {
    if (!Array.isArray(data)) return null;
    const loc = data.find(
      (l) => normalize(l?.locationName) === normalize(city)
    );
    if (!loc) return null;

    const pickVal = (name) =>
      loc.weatherElement?.find((e) => e.elementName === name)?.time?.[0]
        ?.parameter?.parameterName ?? "";

    const pickObj = (name) => {
      const t = loc.weatherElement?.find((e) => e.elementName === name)
        ?.time?.[0];
      return t
        ? {
            value: t.parameter?.parameterName ?? "",
            startTime: t.startTime ?? "",
            endTime: t.endTime ?? "",
          }
        : { value: "", startTime: "", endTime: "" };
    };

    return {
      locationName: loc.locationName,
      wx: pickVal("Wx"),
      pop: pickVal("PoP"),
      minT: pickVal("MinT"),
      maxT: pickVal("MaxT"),
      ci: pickObj("CI"),
    };
  }, [data, city]);
  console.log(data);

  return (
    <>
      <div className="card shadow-sm">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="card-title m-0">台灣天氣（CWB）</h5>
            <small className="text-muted">資料源：F-C0032-001</small>
          </div>

          <div className="row g-2 align-items-center mb-3">
            <div className="col-auto">
              <label className="col-form-label">縣市</label>
            </div>
            <div className="col-auto">
              <select
                className="form-select"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              >
                {CITY_LIST.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-auto">
              <button
                className="btn btn-primary"
                onClick={reload}
                disabled={loading}
              >
                {loading ? "更新中…" : "查詢"}
              </button>
            </div>
          </div>

          {loading && <div className="text-muted">載入中…</div>}
          {error && <div className="alert alert-danger py-2">{error}</div>}

          {current && !error && (
            <div className="border rounded p-3">
              <div className="fw-semibold">{current.locationName}</div>
              <div className="text-muted">{current.wx || "—"}</div>
              <div>降雨機率：{current.pop || "—"}%</div>
              <div>
                溫度：{current.minT || "—"}°C ~ {current.maxT || "—"}°C
              </div>
              <div className="mt-2">
                舒適度：{current.ci?.value || "—"}
                <br />
                <small className="text-muted">
                  {current.ci?.startTime || "—"} ~ {current.ci?.endTime || "—"}
                </small>
              </div>
            </div>
          )}

          {!current && !loading && !error && (
            <div className="text-muted">
              找不到「{city}」的資料，請換個縣市或稍後再試。
            </div>
          )}
        </div>
      </div>
    </>
  );
}
export default WeatherCard;
