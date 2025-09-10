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

// 顯示單一時間區塊（日期 + 起迄時間）
const Time = ({ time }) => {
  const start = time?.startTime ? new Date(time.startTime) : null;
  const end = time?.endTime ? new Date(time.endTime) : null;

  return (
    <>
      <div className="h5 my-2">
        {start
          ? start.toLocaleDateString(undefined, {
              month: "long",
              day: "numeric",
            })
          : "—"}
      </div>
      <p className="mb-1">
        {start
          ? start.toLocaleTimeString(undefined, {
              hour: "numeric",
              minute: "numeric",
            })
          : "—"}
        <span>~</span>
        {end
          ? end.toLocaleTimeString(undefined, {
              hour: "numeric",
              minute: "numeric",
            })
          : "—"}
      </p>
    </>
  );
};

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

  // 將某元素的 time[] 併入以時間為 key 的 bucket
  function mergeTimesIntoBucket(map, elementName, times = []) {
    times.forEach((t) => {
      const start = t?.startTime ?? "";
      const end = t?.endTime ?? "";
      const key = `${start}__${end}`;
      if (!map.has(key)) {
        map.set(key, { startTime: start, endTime: end });
      }
      const bucket = map.get(key);
      bucket[elementName] = t?.parameter?.parameterName ?? "";
    });
  }

  // 依選定城市 → 以時間區間為群組合併各元素
  const current = useMemo(() => {
    if (!Array.isArray(data)) return null;

    const loc = data.find(
      (l) => normalize(l?.locationName) === normalize(city)
    );
    if (!loc) return null;

    const getTimes = (name) =>
      loc.weatherElement?.find((e) => e.elementName === name)?.time ?? [];

    const wxTimes = getTimes("Wx");
    const popTimes = getTimes("PoP");
    const minTTimes = getTimes("MinT");
    const maxTTimes = getTimes("MaxT");
    const ciTimes = getTimes("CI");

    const buckets = new Map();
    mergeTimesIntoBucket(buckets, "wx", wxTimes);
    mergeTimesIntoBucket(buckets, "pop", popTimes);
    mergeTimesIntoBucket(buckets, "minT", minTTimes);
    mergeTimesIntoBucket(buckets, "maxT", maxTTimes);
    mergeTimesIntoBucket(buckets, "ci", ciTimes);

    const byTime = Array.from(buckets.values()).sort(
      (a, b) => new Date(a.startTime) - new Date(b.startTime)
    );

    return { locationName: loc.locationName, byTime };
  }, [data, city]);

  return (
    <>
      <div className="card shadow-sm">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="card-title m-0">台灣天氣（CWB）</h5>
            <div className="d-flex align-items-center gap-2">
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={reload}
                disabled={loading}
              >
                {loading ? "更新中…" : "重新整理"}
              </button>
              <small className="text-muted">資料源：F-C0032-001</small>
            </div>
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
          </div>

          {loading && <div className="text-muted">載入中…</div>}
          {error && <div className="alert alert-danger py-2">{error}</div>}

          {current && !error && (
            <>
              <div className="fw-semibold mb-2">{current.locationName}</div>
              <div className="row">
                {current.byTime.map((slot) => (
                  <div
                    key={`${slot.startTime}__${slot.endTime}`}
                    className="col-md-4 mb-3"
                  >
                    <div className="border rounded p-3 h-100">
                      {/* 左上：時間區塊 */}
                      <Time time={slot} />
                      {/* 右/下：狀態 */}
                      <div>
                        <div>天氣現象：{slot.wx ?? "—"}</div>
                        <div>降雨機率：{slot.pop ? `${slot.pop}%` : "—"}</div>
                        <div>最低溫：{slot.minT ? `${slot.minT}°C` : "—"}</div>
                        <div>最高溫：{slot.maxT ? `${slot.maxT}°C` : "—"}</div>
                        <div>舒適度：{slot.ci ?? "—"}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {!current.byTime.length && <div className="text-muted">—</div>}
            </>
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
