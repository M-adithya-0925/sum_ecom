function googleTranslateElementInit() {
    new google.translate.TranslateElement({ pageLanguage: 'en' }, 'google_translate_element');
  }
  
  function changeLanguage() {
    var language = document.getElementById("languageSelector").value;
    var wikipediaURL = `https://${language}.wikipedia.org/w/api.php?action=query&format=json&titles=Ayurveda&prop=extracts&exintro=true`;
  
    fetch (wikipediaURL)
      .then(response => response.json())
      .then(data => {
        var pageId = Object.keys(data.query.pages)[0];
        var content = data.query.pages[pageId].extract;
        displayWikipediaContent(content);
      })
      .catch(error => console.error('Error fetching Wikipedia content:', error));
  }
  
  function displayWikipediaContent(content) {
    var contentSection = document.getElementById("content");
    contentSection.innerHTML = "";
    var wikipediaContent = document.createElement("div");
    wikipediaContent.innerHTML = content;
    contentSection.appendChild(wikipediaContent);
  }
  
  // Initial content load
  changeLanguage();
// Theme switcher functionality
// Theme switcher functionality