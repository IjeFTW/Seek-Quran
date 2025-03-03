// Get the chapter number from the URL query string
const urlParams = new URLSearchParams(window.location.search);
const chapterNumber = urlParams.get('chapter');
console.log("Chapter Number from URL:", chapterNumber);

if (!chapterNumber) {
  document.getElementById("chapterInfo").innerHTML = "<p>No chapter specified.</p>";
} else {
  fetchFullSurah(chapterNumber);
  fetchChapterRecitations(chapterNumber);
  fetchReciters()
}


// Fetch the full surah text using the verses/by_chapter endpoint
function fetchFullSurah(chapterNum) {
  const url = `https://api.quran.com/api/v4/verses/by_chapter/${chapterNum}?fields=text_uthmani&words=true&per_page=500`;
  console.log("Fetching from URL:", url);
  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error("Network response was not ok: " + response.statusText);
      }
      return response.json();
    })
    .then(data => {
      console.log("Full surah data:", data);
      if (data.verses && Array.isArray(data.verses) && data.verses.length > 0) {
        displayAyahs(data.verses);
        getFullTranslation(data.verses);
      } else {
        document.getElementById("ayahList").innerHTML = "<p>No verses available.</p>";
      }
    })
    .catch(error => {
      console.error("Error fetching full surah:", error);
      document.getElementById("ayahList").innerHTML = "<p>Error loading full surah.</p>";
    });
}

function getFullTranslation(ayah) {
    if (ayah.translations && ayah.translations.length > 0 && ayah.translations[0].text) {
      return ayah.translations[0].text;
    }
    if (ayah.words && ayah.words.length > 0) {
      console.log("Ayah words:", ayah.words);
      const fullTranslation = ayah.words
        .map(word => {
          if (word.translation && word.translation.text) {
            return word.translation.text;
          }
          return "";
        })
        .join(" ")
        .trim();
      return fullTranslation || "Translation not available";
    }
    return "Translation not available";
  }
// Display the ayahs on the page
function displayAyahs(ayahs) {
    const ayahList = document.getElementById("ayahList");
    ayahList.innerHTML = ""; // Clear any previous content
    ayahs.forEach(ayah => {
      // Check if translations exist and pick the first one
      const translationText = getFullTranslation(ayah);
      const ayahDiv = document.createElement("div");
      ayahDiv.className = "ayah";
      ayahDiv.innerHTML = `
        <p class="arabic">${ayah.text_uthmani || "Arabic text not available"}</p>
        <p class="translation">${translationText}</p>
      `;
      ayahList.appendChild(ayahDiv);
    });
  }


function fetchChapterRecitations(chapterId) {
    // This endpoint returns audio recitations for all chapters.
    // We then filter for the recitations for the selected chapter.
    const recitationsUrl = `https://api.quran.com/api/v4/chapter_recitations/${chapterId}`;
    console.log("Fetching recitations from:", recitationsUrl);
    fetch(recitationsUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error("Recitations fetch error: " + response.statusText);
        }
        return response.json();
      })
      .then(data => {
        console.log("Recitations data:", data);
        if (data.audio_files && Array.isArray(data.audio_files)) {
          const filteredAudio = data.audio_files.filter(audio => audio.chapter_id == chapterId);
          displayChapterAudio(filteredAudio);
        } else {
          document.getElementById("chapterAudio").innerHTML = "<p>No audio available.</p>";
        }
      })
      .catch(error => {
        console.error("Error fetching recitations:", error);
        document.getElementById("chapterAudio").innerHTML = "<p>Error loading audio recitations.</p>";
      });
}

function displayChapterAudio(audio_files) {
    const chapterAudio = document.getElementById("chapterAudio");
    chapterAudio.innerHTML = "<h3>Audio Recitations</h3>";
    
    // Loop through each audio file and create an audio player
    audio_files.forEach(audioFile => {
      const audioUrl = audioFile.audio_url || "Audio is not available";
      if (audioUrl) {
        const audioElement = document.createElement("div");
        audioElement.innerHTML = `
          <p>Audio ID: ${audioFile.id}</p>
          <audio controls>
            <source src="${audioUrl}" type="audio/mpeg">
            Your browser does not support the audio element.
          </audio>
        `;
        chapterAudio.appendChild(audioElement);
      }
    });
}

//fetching reciters from the resources url
function fetchReciters(){
    fetch(`https://api.quran.com/api/v4/resources/chapter_reciters`)
      .then(response => response.json())
      .then(data => {
        displayReciter(data.reciters);
        console.log("Reciters :", data)
      })
      .catch(error => console.error("Error fetching reciters:", error));
}
  
function displayReciter(reciters) {
    const reciter = document.getElementById("Reciters");
    if (Array.isArray(reciters) && reciters.length > 0) {
      // For example, display the first reciter's name:
      reciter.innerHTML = `Recite by: ${reciters[0].name}`;
      
      // Alternatively, you could list all reciters:
      // reciterEl.innerHTML = "Reciters: " + reciters.map(r => r.name).join(", ");
    } else {
      reciter.innerHTML = "No reciters available.";
    }
}
  
  
// Back button: returns to the previous page
document.getElementById("backButton").addEventListener("click", () => {
  window.history.back();
});
