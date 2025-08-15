// =======================
// QUOTE DATA MANAGEMENT
// =======================

// Load quotes from localStorage or default
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Don’t let yesterday take up too much of today.", category: "Wisdom" },
  { text: "It’s not whether you get knocked down, it’s whether you get up.", category: "Perseverance" }
];

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// =======================
// DOM FUNCTIONS
// =======================

// Show random quote
function showRandomQuote() {
  const category = document.getElementById("categoryFilter").value;
  let filteredQuotes = category === "all" ? quotes : quotes.filter(q => q.category === category);

  if (filteredQuotes.length === 0) {
    document.getElementById("quoteDisplay").innerText = "No quotes available in this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];
  document.getElementById("quoteDisplay").innerText = `"${quote.text}" — ${quote.category}`;

  // Save last viewed quote in sessionStorage
  sessionStorage.setItem("lastQuote", JSON.stringify(quote));
}

// Add new quote
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (text && category) {
    quotes.push({ text, category });
    saveQuotes();
    populateCategories();
    alert("Quote added!");
    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";
  } else {
    alert("Please enter both quote and category.");
  }
}

// Populate categories dynamically
function populateCategories() {
  const categoryFilter = document.getElementById("categoryFilter");
  const uniqueCategories = [...new Set(quotes.map(q => q.category))];
  
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  uniqueCategories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  // Restore last selected filter
  const lastFilter = localStorage.getItem("lastFilter");
  if (lastFilter) categoryFilter.value = lastFilter;
}

// Filter quotes
function filterQuotes() {
  const category = document.getElementById("categoryFilter").value;
  localStorage.setItem("lastFilter", category);
  showRandomQuote();
}

// =======================
// JSON IMPORT / EXPORT
// =======================

function exportToJson() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      quotes.push(...importedQuotes);
      saveQuotes();
      populateCategories();
      alert("Quotes imported successfully!");
    } catch {
      alert("Invalid JSON file!");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// =======================
// SERVER SYNC SIMULATION
// =======================

// Fake server URL (JSONPlaceholder doesn’t support PUT for custom endpoints, so we simulate fetch)
const SERVER_URL = "https://jsonplaceholder.typicode.com/posts"; 

async function syncWithServer() {
  document.getElementById("syncStatus").innerText = "Syncing with server...";

  try {
    // Simulate fetching server data
    const response = await fetch(SERVER_URL);
    const serverData = await response.json();

    // We'll fake that server has some quotes
    const serverQuotes = [
      { text: "Success is not final; failure is not fatal.", category: "Motivation" },
      { text: "Knowledge is power.", category: "Wisdom" }
    ];

    // Conflict resolution: server takes precedence
    quotes = [...quotes, ...serverQuotes];
    const unique = [];
    quotes.forEach(q => {
      if (!unique.find(u => u.text === q.text)) unique.push(q);
    });
    quotes = unique;

    saveQuotes();
    populateCategories();
    document.getElementById("syncStatus").innerText = "Sync completed. Server data merged.";
  } catch (error) {
    document.getElementById("syncStatus").innerText = "Sync failed. Try again later.";
  }
}

// =======================
// INITIALIZE APP
// =======================

document.getElementById("newQuote").addEventListener("click", showRandomQuote);
populateCategories();
if (sessionStorage.getItem("lastQuote")) {
  const lastQuote = JSON.parse(sessionStorage.getItem("lastQuote"));
  document.getElementById("quoteDisplay").innerText = `"${lastQuote.text}" — ${lastQuote.category}`;
} else {
  showRandomQuote();
}
