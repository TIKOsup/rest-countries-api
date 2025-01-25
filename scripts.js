const maxLoad = 3;
let dataArr;

/* Runs when the Main page loads */
function fillPage() {
  let data = getAllData();
  data.then(json => {
    window.addEventListener("scroll", scrollHandler);
    dataArr = json;
    console.log(dataArr);
    setFilter();
    createNextCards();
  });
}

function getAllData() {
  return fetch("https://restcountries.com/v3.1/all?fields=name,flags,population,region,capital")
    .then(res => res.json());
}

function setFilter() {
  const dropdownBtn = document.getElementById("filter-by-region");
  const dropdownBtnText = document.querySelector("#filter-by-region p");
  const dropdownMenu = document.getElementById("filter-menu");
  const regions = new Set();

  dropdownBtn.addEventListener("click", function() {
    toggleDropdownView();
  });

  for (let obj of dataArr) {
    regions.add(obj.region);
  }

  for (let region of regions) {
    dropdownMenu.innerHTML += `<li>${region}</li>`;
  }

  const dropdownItems = document.querySelectorAll("#filter-menu li");
  for (let item of dropdownItems) {
    item.addEventListener("click", function() {
      filterPageByRegion(item.innerHTML);
      dropdownBtnText.innerHTML = item.innerHTML;
      toggleDropdownView();
    });
  }
}

function toggleDropdownView() {
  const dropdownMenu = document.getElementById("filter-menu");
  if (dropdownMenu.classList.contains("hidden")) {
    dropdownMenu.classList.add("visible");
    dropdownMenu.classList.remove("hidden");
  } else {
    dropdownMenu.classList.add("hidden");
    dropdownMenu.classList.remove("visible");
  }
}

function filterPageByRegion(region) {
  let main = document.getElementsByTagName("main")[0];

  fetch(`https://restcountries.com/v3.1/region/${region}?fields=name,flags,population,region,capital`)
    .then(res => res.json())
    .then(json => {
      dataArr = json;
      console.log(dataArr);
      main.innerHTML = "";
      createNextCards();
    });
}

function createNextCards() {
  for (let i = 0; i < maxLoad; i++) {
    let cardNum = getCardNum();
    if (cardNum >= dataArr.length) {
      console.log("DATA ended");
    } else {
      createCard(dataArr[cardNum]);
    }
  }
}

function createCard(country) {
  let main = document.getElementsByTagName("main")[0];
  let card = document.createElement("div");
  card.classList.add("card");
  card.innerHTML = `
    <a href="./country#${country.name.common}">
    <img src="${country.flags.svg}" alt="${country.flags.alt}">
    <div class="card-body">
      <h2 class="country-name">${country.name.common}</h2>
      <p class="country-population"><strong>Population:</strong> ${country.population}</p>
      <p class="country-region"><strong>Region:</strong> ${country.region}</p>
      <p class="country-capital"><strong>Capital:</strong> ${country.capital}</p>
    </div>
    </a>
  `;
  main.appendChild(card);
}

function getCardNum() {
  let main = document.getElementsByTagName("main")[0];
  let cardNum = main.getElementsByClassName("card").length;
  return cardNum;
}

function scrollHandler() {
  const endOfPage = (window.innerHeight + window.pageYOffset) + 10 >= document.body.offsetHeight;

  if (endOfPage) {
    createNextCards();
  }
}

/* Details */
function fillDetailsPage() {
  window.addEventListener("hashchange", function() {
    this.window.location.reload(true);
  })

  let currentHash = window.location.hash;
  let data = getCountryData(currentHash);
  data.then(json => {
    console.log(json);
    document.getElementById("flag").src = json[0].flags.svg;
    document.getElementById("flag").alt = json[0].flags.alt;
    document.getElementById("name").innerHTML = json[0].name.common;
    document.getElementById("native-name").innerHTML += getNativeName(json[0].name.nativeName);
    document.getElementById("population").innerHTML += formatPopulation(json[0].population);
    document.getElementById("region").innerHTML += json[0].region;
    document.getElementById("sub-region").innerHTML += json[0].subregion;
    document.getElementById("capital").innerHTML += json[0].capital;
    document.getElementById("top-level-domain").innerHTML += json[0].tld[0];
    document.getElementById("currencies").innerHTML += getCurrencies(json[0].currencies);
    document.getElementById("languages").innerHTML += getLanguages(json[0].languages);
    fillBorders(json[0].borders);
  });
}

function getCountryData(hash) {
  hash = hash.substring(1).toLowerCase();
  return fetch(`https://restcountries.com/v3.1/name/${hash}?fields=name,flags,population,region,subregion,capital,tld,currencies,languages,borders`)
    .then(res => res.json());
}

function getNativeName(json) {
  return json[Object.keys(json)[0]].common;
}

function formatPopulation(population) {
  const formatter = new Intl.NumberFormat("en-US");
  return formatter.format(population);
}

function getCurrencies(json) {
  let res = [];
  for (const key in json) {
    res.push(json[key].name);
  }
  return res.join(", ");
}

function getLanguages(json) {
  let res = [];
  for (const key in json) {
    res.push(json[key]);
  }
  return res.join(", ");
}

function fillBorders(json) {
  const section = document.getElementsByClassName("border-country-links")[0];
  for (const key in json) {
    const obj = getNameByCode(json[key]);
    obj.then(nameObj => {
      const borderCountry = document.createElement("a");
      borderCountry.classList.add("border-link");
      borderCountry.innerHTML = nameObj.name.common;
      borderCountry.type = "button";
      borderCountry.href = getUrl() + "#" + nameObj.name.common;
      section.appendChild(borderCountry);
    })
  }
}

function getNameByCode(code) {
  return fetch(`https://restcountries.com/v3.1/alpha/${code.toLowerCase()}?fields=name`)
    .then(res => res.json());
}

function getUrl() {
  const url = window.location.href;
  let index = url.indexOf("#");
  return url.substring(0, index);
}