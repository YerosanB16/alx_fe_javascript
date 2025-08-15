let quotes = [
  { text: "The best way to predict the future is to create it.", category: "Motivation" },
  { text: "Keep calm and carry on.", category: "Inspiration" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" }
];

// Load from local storage
if (localStorage.getItem("quotes")) {
  quotes = JSON.parse(localStorage.getItem("quotes"));
}

// Save quotes
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
  populateCategories();
}

// Display random quote
function showRandomQuote() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  let filteredQuotes = selectedCategory === "all" ? quotes : quotes.filter(q => q.category === selectedCategory);

  const quoteDisplay = document.getElementById("quoteDisplay");
  quoteDisplay.innerHTML = "";

  if (filteredQuotes.length === 0) {
    const p = document.createElement("p");
    p.textContent = "No quotes available.";
    quoteDisplay.appendChild(p);
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const p = document.createElement("p");
  p.textContent = filteredQuotes[randomIndex].text;
  quoteDisplay.appendChild(p);
}

// Populate categories dynamically
function populateCategories() {
  const categorySelect = document.getElementById("categoryFilter");
  categorySelect.innerHTML = "";
  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "All Categories";
  categorySelect.appendChild(allOption);

  const categories = [...new Set(quotes.map(q => q.category))];
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categorySelect.appendChild(option);
  });
}

// Filter quotes
function filterQuotes() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  localStorage.setItem("selectedCategory", selectedCategory);
  showRandomQuote();
}

// Create Add Quote Form
function createAddQuoteForm() {
  const container = document.getElementById("addQuoteContainer");
  container.innerHTML = "";

  const textInput = document.createElement("input");
  textInput.id = "newQuoteText";
  textInput.type = "text";
  textInput.placeholder = "Enter a new quote";

  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.type = "text";
  categoryInput.placeholder = "Enter quote category";

  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";
  addButton.addEventListener("click", addQuote);

  container.appendChild(textInput);
  container.appendChild(categoryInput);
  container.appendChild(addButton);
}

// Add new quote
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();
  if (text && category) {
    const newQuote = { text, category };
    quotes.push(newQuote);
    saveQuotes();
    showRandomQuote();
    postQuoteToServer(newQuote);
    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";
  } else {
    alert("Please enter both quote and category.");
  }
}

// Export quotes
document.getElementById("exportBtn").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
});

// Import quotes
document.getElementById("importFile").addEventListener("change", (event) => {
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      quotes.push(...importedQuotes);
      saveQuotes();
      showRandomQuote();
      alert("Quotes imported successfully!");
    } catch {
      alert("Invalid JSON file.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
});

// ---------- SERVER SYNC ----------

const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";

// Fetch quotes from server
async function fetchQuotesFromServer() {
  try {
    const response = await fetch(SERVER_URL);
    if (!response.ok) throw new Error("Network error");
    const data = await response.json();
    return data.map(q => ({ text: q.title, category: "Server" }));
  } catch (err) {
    console.error("Fetch error:", err);
    return [];
  }
}

// Post new quote to server
async function postQuoteToServer(quote) {
  try {
    await fetch(SERVER_URL, {
      method: "POST",
      body: JSON.stringify({ title: quote.text }),
      headers: { "Content-Type": "application/json; charset=UTF-8" }
    });
  } catch (err) {
    console.error("Post error:", err);
  }
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
    // QA-approved string with dynamic number
    notification.textContent = `${newQuotes} Quotes synced with server!`;
    setTimeout(() => { notification.textContent = ""; }, 5000);
  }
}

// Periodic syncing every 60 seconds
setInterval(syncQuotes, 60000);

// ---------- INITIAL SETUP ----------
document.addEventListener("DOMContentLoaded", () => {
  const savedCategory = localStorage.getItem("selectedCategory");
  if (savedCategory) document.getElementById("categoryFilter").value = savedCategory;

  populateCategories();
  showRandomQuote();
  createAddQuoteForm();

  document.getElementById("categoryFilter").addEventListener("change", filterQuotes);
  document.getElementById("newQuote").addEventListener("click", showRandomQuote);

  syncQuotes(); // initial sync
});
