<div class="landing-container">
  <h1>Bitcoin Address Explorer</h1>

  <input
    id="addressInput"
    type="text"
    placeholder="Enter Bitcoin address"
    class="address-input"
  />

  <div class="date-range">
    <div class="date-field">
      <label for="startDate">Start date</label>
      <input id="startDate" type="date" class="date-input" />
    </div>
    <div class="date-field">
      <label for="endDate">End date</label>
      <input id="endDate" type="date" class="date-input" />
    </div>
  </div>

  <div class="interval-buttons">
    <button class="interval-btn active" data-interval="1d">Daily</button>
    <button class="interval-btn" data-interval="1w">Weekly</button>
    <button class="interval-btn" data-interval="1m">Monthly</button>
    <button class="interval-btn" data-interval="1y">Yearly</button>
  </div>

  <button id="searchBtn" class="search-btn">Search</button>
</div>

<style>
  .landing-container {
    max-width: 500px;
    margin: 120px auto;
    padding: 40px;
    text-align: center;
    border-radius: 12px;
    background: #ffffff;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  }

  .landing-container h1 {
    margin-bottom: 30px;
    font-size: 28px;
  }

  .address-input {
    width: 100%;
    padding: 14px;
    font-size: 16px;
    border-radius: 8px;
    border: 1px solid #ccc;
    margin-bottom: 25px;
  }

  .date-range {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 25px;
    text-align: left;
  }

  .date-field label {
    display: block;
    font-size: 13px;
    margin-bottom: 6px;
    color: #444;
  }

  .date-input {
    width: 100%;
    padding: 10px;
    border-radius: 8px;
    border: 1px solid #ccc;
    font-size: 14px;
    box-sizing: border-box;
  }

  .interval-buttons {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 30px;
  }

  .interval-btn {
    flex: 1;
    padding: 10px 0;
    border-radius: 8px;
    border: 1px solid #ccc;
    background: #f5f5f5;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s ease;
  }

  .interval-btn:hover {
    background: #eaeaea;
  }

  .interval-btn.active {
    background: #111;
    color: #fff;
    border-color: #111;
  }

  .search-btn {
    width: 100%;
    padding: 14px;
    font-size: 16px;
    border-radius: 8px;
    border: none;
    background: #111;
    color: white;
    cursor: pointer;
    transition: background 0.2s ease;
  }

  .search-btn:hover {
    background: #333;
  }
</style>

<script>
  let selectedInterval = "1d";

  const intervalButtons = document.querySelectorAll(".interval-btn");

  intervalButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      intervalButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      selectedInterval = btn.dataset.interval;
    });
  });

  document.getElementById("searchBtn").addEventListener("click", () => {
    const address = document.getElementById("addressInput").value.trim();

    if (!address) {
      alert("Please enter a Bitcoin address.");
      return;
    }

    // Redirect to another Observable page
    // Example target: /results.md
    const params = new URLSearchParams({
      address,
      interval: selectedInterval
    });

    window.location.href = `/results?${params.toString()}`;
  });
</script>
