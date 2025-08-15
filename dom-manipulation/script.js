// Quotes array
let quotes = [
  { text: "The best way to predict the future is to create it.", category: "Motivation" },
  { text: "Keep calm and carry on.", category: "Inspiration" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" }
];

// Load quotes from local storage
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
  let filteredQuotes = quotes;
  if (selectedCategory !== "all") {
    filteredQuotes = quotes.filter(q => q.category === selectedCategory);
  }
  if (filteredQuotes.length === 0) {
    document.getElementById("quoteDisplay").textContent = "No quotes available.";
    return;
  }
  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  document.getElementById("quoteDisplay").textContent = filteredQuotes[randomIndex].text;
}

// Filter quotes
function filterQuotes() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  localStorage.setItem("selectedCategory", selectedCategory);
  showRandomQuote();
}

// Populate categories
function populateCategories() {
  const categorySelect = document.getElementById("categoryFilter");
  const categories = ["all", ...new Set(quotes.map(q => q.category))];
  categorySelect.innerHTML = categories.map(c => `<option value="${c}">${c}</option>`).join("");
}

// Create Add Quote Form dynamically
function createAddQuoteForm() {
  const container = document.getElementById("addQuoteContainer");
  container.innerHTML = `
    <input id="newQuoteText" type="text" placeholder="Enter a new quote" />
    <input id="newQuoteCategory" type="text" placeholder="Enter quote category" />
    <button id="addQuoteBtn">Add Quote</button>
  `;

  document.getElementById("addQuoteBtn").addEventListener("click", addQuote);
}

// Add new quote
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();
  if (text && category) {
    quotes.push({ text, category });
    saveQuotes();
    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";
    showRandomQuote();
  } else {
    alert("Please enter both quote and category.");
  }
}

// Load last selected category
document.addEventListener("DOMContentLoaded", () => {
  const savedCategory = localStorage.getItem("selectedCategory");
  if (savedCategory) document.getElementById("categoryFilter").value = savedCategory;
  populateCategories();
  showRandomQuote();
  createAddQuoteForm();
});

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

// Event listener for new quote button
document.getElementById("newQuote").addEventListener("click", showRandomQuote);
