let chapters = [];

// Fetch the list of surahs (chapters) from the new API
function fetchChapters() {
  fetch("https://api.quran.com/api/v4/chapters?language=en")
    .then(response => response.json())
    .then(data => {
      chapters = data.chapters; // store the chapters array
      displayChapters(chapters);
      console.log("chapters:", data)
      // Once chapters are fetched, also fetch a random ayah.
      fetchRandomAyah();
    })
    .catch(error => console.error("Error fetching chapters:", error));
}

// Display chapters on the homepage
function displayChapters(chaptersArray) {
  const surahList = document.getElementById("surahList");
  surahList.innerHTML = ""; // Clear any existing items
  chaptersArray.forEach(chapter => {
    const li = document.createElement("li");
    li.textContent = `Surah ${chapter.id}: ${chapter.name_simple} - ${chapter.translated_name.name} - Revelation Order: ${chapter.revelation_order}`;
    li.onclick = () => loadChapterDetail(chapter.id, chapter.verses_count);
    surahList.appendChild(li);
  });
}

function fetchRandomAyah() {
  fetch("https://api.quran.com/api/v4/verses/random?fields=text_uthmani&words=true")
    .then(response => response.json())
    .then(data => {
      // Log the complete response to inspect its structure
      console.log("Random ayah API response:", data);
      
      // Adjust the property names based on what the API returns.
      // The expected structure is data.verse, but it may differ.
      const ayah = data.verse;
      if (!ayah) {
        document.getElementById("randomAyah").innerHTML = "<p>No ayah data available.</p>";
        return;
      }
      const ayahText = ayah.text_uthmani || "Arabic text not available";
      const fullTranslation = getFullTranslation(ayah)
      document.getElementById("randomAyah").innerHTML = `
        <p>${ayahText}</p>
        <p><em>${fullTranslation}</em></p>
        <p>The verse is from: ${ayah.verse_key}</p>
        <p>Juz: ${ayah.juz_number}
        
      `;
    })
    .catch(error => console.error("Error fetching random ayah:", error));
}

function getFullTranslation(ayah) {
  if (ayah.words && ayah.words.length > 0) {
    // Sort the words by their position if not already sorted.
    const sortedWords = ayah.words.sort((a, b) => a.position - b.position);
    // Join each word's translation text
    const fullTranslation = sortedWords
      .map(word => (word.translation && word.translation.text) ? word.translation.text : "")
      .join(" ")
      .trim();
    return fullTranslation || "Translation not available";
  }
  return "Translation not available";
}

function loadChapterDetail(chapterId) {
  currentChapterId = chapterId;
  // Hide homepage and show chapter detail section
  document.getElementById("homepage").style.display = "none";
  document.getElementById("chapterDetails").style.display = "block";

  // Fetch chapter info (detailed information)
  fetch(`https://api.quran.com/api/v4/chapters/${chapterId}?language=en`)
    .then(response => response.json())
    .then(data => {
      console.log("Info", data);
      displayChapterInfo(data.chapter);
      // After showing chapter info, fetch verses with audio
      fetchExtraInfo(chapterId)
    })
    .catch(error => console.error("Error fetching chapter info:", error));
}

// Display chapter information
function displayChapterInfo(chapter) {
  const chapterInfo = document.getElementById("chapterInfo");
  chapterInfo.innerHTML = `
    <h2>Surah ${chapter.id}: ${chapter.name_simple}</h2>
    <p>${chapter.translated_name.name}</p>
    <p>${chapter.name_arabic}
    <p>Revelation: ${chapter.revelation_place}</p>
    <p>Verses: ${chapter.verses_count}</p>

  `;
}



//fetch extra info from the api
function fetchExtraInfo(chaptersinfo){
  fetch(`https://api.quran.com/api/v4/chapters/${chaptersinfo}/info`)
  .then(response => response.json())
  .then(data => {
    displayExtraInfo(data.chapter_info);
  })
  .catch(error => console.error("Error fetching verses with audio:", error));
}

//display the extra info from the api
function displayExtraInfo(chapter_info){
  const extrainfo = document.getElementById("ExtraInfo");
  extrainfo.innerHTML = `
  <h3>Detail:</h3>
  <p>${chapter_info.text}</p>
  <h4>Source From:</h4>
  <p>${chapter_info.source}</p>
  `;
  
}

// User Notes: Load user notes from localStorage for the given chapter id
function loadUserNotes(chapterId) {
  let savedData = localStorage.getItem("surahNotes");
  savedData = savedData ? JSON.parse(savedData) : {};
  if (savedData[chapterId]) {
    document.getElementById("ayahCompletedInput").value = savedData[chapterId].completed;
    document.getElementById("notesInput").value = savedData[chapterId].notes;
    document.getElementById("savedNotesDisplay").innerHTML = `
      <p><strong>Saved Notes:</strong> Completed: ${savedData[chapterId].completed} | Notes: ${savedData[chapterId].notes}</p>
    `;
  } else {
    document.getElementById("savedNotesDisplay").innerHTML = "<p>No notes saved yet.</p>";
  }
}

// User Notes: Save user notes to localStorage for the given chapter id
function saveUserNotes(chapterId) {
  let completed = document.getElementById("ayahCompletedInput").value;
  let notes = document.getElementById("notesInput").value;
  let savedData = localStorage.getItem("surahNotes");
  savedData = savedData ? JSON.parse(savedData) : {};
  savedData[chapterId] = { completed, notes };
  localStorage.setItem("surahNotes", JSON.stringify(savedData));
  loadUserNotes(chapterId); // Update display after saving
}

// User Notes: Delete user notes for the given chapter id
function deleteUserNotes(chapterId) {
  let savedData = localStorage.getItem("surahNotes");
  savedData = savedData ? JSON.parse(savedData) : {};
  if (savedData[chapterId]) {
    delete savedData[chapterId];
    localStorage.setItem("surahNotes", JSON.stringify(savedData));
  }
  loadUserNotes(chapterId); // Update display after deletion
}

// Event listeners for the Save and Delete buttons
document.getElementById("saveNotesButton").addEventListener("click", () => {
  if (currentChapterId) {
    saveUserNotes(currentChapterId);
  }
});
document.getElementById("deleteNotesButton").addEventListener("click", () => {
  if (currentChapterId) {
    deleteUserNotes(currentChapterId);
  }
});

function loadSpiritualNotes(chapterId) {
  let savedData = localStorage.getItem("Spiritual");
  savedData = savedData ? JSON.parse(savedData) : {};
  if (savedData[chapterId]) {
    document.getElementById("discovery").value = savedData[chapterId].discovery;
    document.getElementById("savedSpiritualDisplay").innerHTML = `
      <p>Your Spiritual Discovery About The Surah: ${savedData[chapterId].discovery}</p>
    `;
  } else {
    document.getElementById("savedSpiritualDisplay").innerHTML = "<p>No notes saved yet.</p>";
  }
}

function saveSpiritualNotes(chapterId) {
  let discovery = document.getElementById("discovery").value;
  let savedData = localStorage.getItem("Spiritual");
  savedData = savedData ? JSON.parse(savedData) : {};
  savedData[chapterId] = { discovery };
  localStorage.setItem("Spiritual", JSON.stringify(savedData));
  loadSpiritualNotes(chapterId); // Update display after saving
}

// User Notes: Delete user notes for the given chapter id
function deleteSpiritualNotes(chapterId) {
  let savedData = localStorage.getItem("Spiritual");
  savedData = savedData ? JSON.parse(savedData) : {};
  if (savedData[chapterId]) {
    delete savedData[chapterId];
    localStorage.setItem("Spiritual", JSON.stringify(savedData));
  }
  loadSpiritualNotes(chapterId); // Update display after deletion
}

// Event listeners for the Save and Delete buttons
document.getElementById("saveSpiritualButton").addEventListener("click", () => {
  if (currentChapterId) {
    saveSpiritualNotes(currentChapterId);
  }
});
document.getElementById("deleteSpiritualButton").addEventListener("click", () => {
  if (currentChapterId) {
    deleteSpiritualNotes(currentChapterId);
  }
});

document.getElementById("searchInput").addEventListener("input", function (event) {
  const query = event.target.value.toLowerCase();
  // Filter chapters by matching against the simple name or the translated name
  const filteredChapters = chapters.filter(chap =>
    chap.name_simple.toLowerCase().includes(query) ||
    chap.translated_name.name.toLowerCase().includes(query)
  );
  displayChapters(filteredChapters);
});

document.getElementById("backButton").addEventListener("click", () => {
  document.getElementById("chapterDetails").style.display = "none";
  document.getElementById("homepage").style.display = "block";
});

document.getElementById("fullSurahButton").addEventListener("click", () => {
  console.log("Navigating with chapter id:", currentChapterId, typeof currentChapterId);
  // Using window.location.href to navigate and pass the chapter id.
  window.location.href = `fullSurah.html?chapter=${encodeURIComponent(currentChapterId)}`;
});

window.onload = fetchChapters;