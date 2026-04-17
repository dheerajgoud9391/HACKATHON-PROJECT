import { useState, useEffect } from "react";
import "./index.css";

function App() {
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]);
  const [openSection, setOpenSection] = useState("overview");
  const [theme, setTheme] = useState("dark");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);

  const [animatedScore, setAnimatedScore] = useState(0);

  const handleScan = () => {
    if (!domain) {
      setError("⚠️ Please enter a domain or IP");
      return;
    }

    setError("");
    setLoading(true);
    setData(null);
    setAnimatedScore(0);

    setTimeout(() => {
      const score = 78;

      const result = {
        score,
        risk: score > 60 ? "High" : score > 30 ? "Medium" : "Low",
        ports: [22, 80, 3306],
        services: ["SSH", "HTTP", "MySQL"],
        abuse: 75,
        ip: "93.184.216.34",
        location: "USA",
        isp: "Edgecast Inc.",
        malicious: 3,
        suspicious: 1
      };

      setData(result);
      setHistory([{ domain, score }, ...history.slice(0, 4)]);
      setLoading(false);
    }, 1200);
  };

  /* 🔥 SCORE ANIMATION */
  useEffect(() => {
    if (data) {
      let start = 0;
      const end = data.score;

      const interval = setInterval(() => {
        start += Math.ceil((end - start) / 8);
        setAnimatedScore(start);

        if (start >= end) {
          setAnimatedScore(end);
          clearInterval(interval);
        }
      }, 30);

      return () => clearInterval(interval);
    }
  }, [data]);
  useEffect(() => {
  document.body.className = theme;
}, [theme]);

  return (
    <div className={`body ${theme}`}>

      {/* HEADER */}
      <div className="topbar">
        <div className="brand">ExposureGuard</div>

        <div className="scan-wrap">
          <input
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="Enter domain or IP..."
          />
          <button className="btn" onClick={handleScan}>
            Scan
          </button>
        </div>
      </div>

      {/* ERROR */}
      {error && <div className="card red">{error}</div>}

      {/* SCANNING */}
      {loading && (
        <div className="card scanning">
          🔍 Scanning <strong>{domain}</strong>... checking ports, SSL, threats...
        </div>
      )}
      <button
  className="btn"
  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
>
  {theme === "dark" ? "☀️" : "🌙"}
</button>

      {/* RESULTS */}
      {data && !loading && (
        <>
          {/* TOP SUMMARY */}
          <div className="summary-row">

            {/* GAUGE */}
            <div className="card center">
              <div className="gauge">
                <div
                  className="gauge-fill"
                  style={{ width: `${animatedScore}%` }}
                />
              </div>
              <div className="score">{animatedScore}</div>
            </div>

            {/* RISK LEVEL */}
            <div className="card center">
              <div>Risk Level</div>
              <div className={data.risk === "High" ? "red" : data.risk === "Medium" ? "yellow" : "green"}>
                {data.risk}
              </div>
            </div>

            {/* STATUS BADGES */}
            <div className="card">
              <div>🔴 Ports Open</div>
              <div className="red">{data.ports.length}</div>

              <div>🟡 Suspicious</div>
              <div className="yellow">{data.suspicious}</div>

              <div>🔴 High Abuse</div>
              <div className="red">{data.abuse}%</div>
            </div>

          </div>

          {/* AI EXPLANATION */}
          <div className="ai-box">
            🤖 This system is at <b>{data.risk.toUpperCase()} RISK</b> due to open ports,
            high abuse score, and detected malicious activity.
          </div>

          {/* TABS */}
          <div className="tabs">
            {["overview", "technical", "threats"].map((tab) => (
              <button
                key={tab}
                className={`tab ${openSection === tab ? "active" : ""}`}
                onClick={() => setOpenSection(tab)}
              >
                {tab.toUpperCase()}
              </button>
            ))}
          </div>

          {/* OVERVIEW */}
          {openSection === "overview" && (
            <div className="card fade">
              <h3>IP Information</h3>
              <div className="row"><span>IP</span><span>{data.ip}</span></div>
              <div className="row"><span>Location</span><span>{data.location}</span></div>
              <div className="row"><span>ISP</span><span>{data.isp}</span></div>
            </div>
          )}

          {/* TECHNICAL */}
          {openSection === "technical" && (
            <div className="card fade">
              <h3>Open Ports & Services</h3>
              {data.ports.map((p, i) => (
                <div key={i} className="row">
                  <span>Port {p} ({data.services[i]})</span>
                  <span className="red">Open</span>
                </div>
              ))}
            </div>
          )}

          {/* THREATS */}
          {openSection === "threats" && (
            <div className="card fade">
              <h3>Threat Intelligence</h3>
              <div className="row">Malicious: <span className="red">{data.malicious}</span></div>
              <div className="row">Suspicious: <span className="yellow">{data.suspicious}</span></div>
            </div>
          )}

          {/* BREAKDOWN */}
          <div className="card">
            <div
              className="dropdown-header"
              onClick={() => setShowBreakdown(!showBreakdown)}
            >
              <h3>Risk Breakdown</h3>
              <span>{showBreakdown ? "▲" : "▼"}</span>
            </div>

            {showBreakdown && (
              <div className="dropdown-content fade">
                <div className="row">+40 → Open Ports</div>
                <div className="row">+30 → No HTTPS</div>
                <div className="row">+20 → Data Leak</div>
                <div className="row">+10 → Outdated Services</div>
              </div>
            )}
          </div>

          {/* SUGGESTIONS */}
          <div className="card">
            <div
              className="dropdown-header"
              onClick={() => setShowSuggestions(!showSuggestions)}
            >
              <h3>Suggestions</h3>
              <span>{showSuggestions ? "▲" : "▼"}</span>
            </div>

            {showSuggestions && (
              <div className="suggest-grid fade">
                <div className="sug-card">🔒 Close unused ports</div>
                <div className="sug-card">🔐 Enable HTTPS</div>
                <div className="sug-card">🛡 Restrict SSH access</div>
                <div className="sug-card">🚫 Block suspicious IPs</div>
              </div>
            )}
          </div>

          {/* HISTORY */}
          <div className="card">
            <h3>Scan History</h3>
            {history.map((h, i) => (
              <div key={i} className="row">
                {h.domain} → {h.score}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default App;