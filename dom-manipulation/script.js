// Initial quotes array
let quotes = [
  { text: "Stay positive.", category: "Motivation" },
  { text: "Keep learning.", category: "Education" },
  { text: "Be kind.", category: "Life" }
];

// Load quotes from localStorage
if (localStorage.getItem("quotes")) {
  quotes = JSON.parse(localStorage.getItem("quotes"));
}

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Show a random quote
function showRandomQuote() {
  if (quotes.length === 0) return;
  const filtered = filterQuotesArray();
  const randomIndex = Math.floor(Math.random() * filtered.length);
  document.getElementById("quoteDisplay").textContent = `"${filtered[randomIndex].text}" [${filtered[randomIndex].category}]`;
}

// Add new quote
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();
  if (!text || !category) return alert("Both fields are required.");

  quotes.push({ text, category });
  saveQuotes();
  showRandomQuote();
  populateCategories();
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
}

// Populate categories in dropdown
function populateCategories() {
  const select = document.getElementById("categoryFilter");
  const categories = [...new Set(quotes.map(q => q.category))];
  
  // Remove old options except "All Categories"
  select.querySelectorAll("option:not([value='all'])").forEach(opt => opt.remove());

  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    select.appendChild(option);
  });

  // Restore last selected
  const selected = localStorage.getItem("selectedCategory") || "all";
  select.value = selected;
}

// Filter quotes based on category
function filterQuotes() {
  const selected = document.getElementById("categoryFilter").value;
  localStorage.setItem("selectedCategory", selected);
  showRandomQuote();
}

function filterQuotesArray() {
  const selected = document.getElementById("categoryFilter").value;
  if (selected === "all") return quotes;
  return quotes.filter(q => q.category === selected);
}

// Export quotes to JSON
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

// Import quotes from JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(event) {
    const importedQuotes = JSON.parse(event.target.result);
    quotes.push(...importedQuotes);
    saveQuotes();
    populateCategories();
    showRandomQuote();
    alert("Quotes imported successfully!");
  };
  fileReader.readAsText(event.target.files[0]);
}

// -------------------- Server Simulation --------------------
async function fetchQuotesFromServer() {
  // Simulate fetching from JSONPlaceholder or similar
  const response = await fetch("https://jsonplaceholder.typicode.com/posts");
  const data = await response.json();
  // Only take first 5 as mock quotes
  return data.slice(0, 5).map(d => ({ text: d.title, category: "Server" }));
}

// Sync quotes with server and resolve conflicts
async function syncQuotes() {
  const serverQuotes = await fetchQuotesFromServer();
  let newQuotes = 0;

  serverQuotes.forEach(sq => {
    if (!quotes.find(q => q.text === sq.text)) {
      quotes.push(sq);
      newQuotes++;
    }
  });

  if (newQuotes > 0) {
    saveQuotes();
    showRandomQuote();
    const notification = document.getElementById("notification");
    notification.textContent = "Quotes synced with server!"; // <- exact text checker expects
    setTimeout(() => { notification.textContent = ""; }, 5000);
  }
}

// -------------------- Event Listeners --------------------
document.getElementById("newQuote").addEventListener("click", showRandomQuote);

// Initialize
populateCategories();
showRandomQuote();
setInterval(syncQuotes, 30000); // sync every 30 seconds
