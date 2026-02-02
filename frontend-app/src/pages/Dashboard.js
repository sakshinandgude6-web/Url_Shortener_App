import { useState, useEffect } from "react";

export default function Dashboard() {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [originalUrl, setOriginalUrl] = useState("");
  const [creating, setCreating] = useState(false);
  const [selectedStats, setSelectedStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  const fetchUrls = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/url/my`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to load URLs");
        setLoading(false);
        return;
      }

      setUrls(data);
      setLoading(false);
    } catch (err) {
      setError("Server error");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUrls();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this URL?",
    );
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/url/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        const data = await response.json();
        setError(data.message || "Failed to delete URL");
        return;
      }

      // remove from UI (no refetch needed)
      setUrls((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      setError("Server error");
    }
  };

  const handleViewStats = async (id) => {
    setStatsLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/url/${id}/stats`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to load stats");
        setStatsLoading(false);
        return;
      }

      setSelectedStats(data);
      setStatsLoading(false);
    } catch (err) {
      setError("Server error");
      setStatsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  useEffect(() => {
    const onFocus = () => {
      fetchUrls();
    };

    window.addEventListener("focus", onFocus);

    return () => window.removeEventListener("focus", onFocus);
  }, []);

  const handleShorten = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/url/shorten`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            originalUrl,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to shorten URL");
        setCreating(false);
        return;
      }

      setOriginalUrl("");

      // refresh dashboard list
      fetchUrls();

      setCreating(false);
    } catch (err) {
      setError("Server error");
      setCreating(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="container">
      <div className="top-bar">
        <h2>Dashboard</h2>
        <button onClick={handleLogout}>Logout</button>
      </div>

      <form className="shorten-form" onSubmit={handleShorten}>
        <input
          type="url"
          placeholder="Enter long URL"
          value={originalUrl}
          onChange={(e) => setOriginalUrl(e.target.value)}
          required
          style={{ width: "400px" }}
        />

        <button type="submit" disabled={creating}>
          {creating ? "Creating..." : "Shorten"}
        </button>
      </form>

      <hr />
      <h2>My URLs</h2>

      {urls.length === 0 && <p>No URLs found</p>}

      {urls.length > 0 && (
        <table border="1" cellPadding="5">
          <thead>
            <tr>
              <th>Original URL</th>
              <th>Short Code</th>
              <th>Clicks</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {urls.map((u) => (
              <tr key={u._id}>
                <td>{u.originalUrl}</td>
                <td>
                  <a
                    href={`${process.env.REACT_APP_API_BASE_URL}/${u.shortCode}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {u.shortCode}
                  </a>
                </td>
                <td>{u.clicks}</td>
                <td className="actions">
                  <button
                    className="stats-btn"
                    onClick={() => handleViewStats(u._id)}
                  >
                    Stats
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(u._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {statsLoading && <p>Loading stats...</p>}

      {selectedStats && (
        <div className="stats-box">
          <h3>URL Statistics</h3>

          <p>
            <strong>Original URL:</strong> {selectedStats.originalUrl}
          </p>

          <p>
            <strong>Short Code:</strong> {selectedStats.shortCode}
          </p>

          <p>
            <strong>Access Count:</strong> {selectedStats.accessCount}
          </p>

          <p>
            <strong>Created At:</strong>{" "}
            {new Date(selectedStats.createdAt).toLocaleString()}
          </p>

          <button onClick={() => setSelectedStats(null)}>Close</button>
        </div>
      )}
    </div>
  );
}
