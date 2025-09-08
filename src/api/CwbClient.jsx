import { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const Auth = import.meta.env.VITE_CWB_API_KEY;

export function useCity12hr() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getWeather = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(
        `${BASE_URL}/F-C0032-001?Authorization=${Auth}`
      );
      setData(res.data.records.location);
    } catch (error) {
      console.error(error);
      setError("取得資料失敗");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getWeather();
  }, []);

  return { data, loading, error, reload: getWeather };
}
export default useCity12hr;
