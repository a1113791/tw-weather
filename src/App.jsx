import WeatherCard from "./components/WeatherCard";

function App() {
  return (
    <>
      <div className="bg-light min-vh-100">
        <div className="container py-4">
          <header className="d-flex justify-content-between align-items-center mb-3">
            <h1 className="h4 m-0">TW Weather</h1>
            <div className="text-muted small">免費 API：氣象局 CWB</div>
          </header>

          <div className="row g-3">
            <div className="col-12 col-md-8 col-lg-6">
              <WeatherCard />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
