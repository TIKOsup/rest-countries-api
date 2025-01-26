/* Global Variables */
const API_URL = "https://restcountries.com/v3.1/";
const FIELDS_MAIN = "name,flags,population,region,capital";
const FIELDS_DETAILS = FIELDS_MAIN + ",subregion,tld,currencies,languages,borders";
const MAX_CARDS = 3; /* Max number of cards when creating */
let allData; /* Array that holds current data */
let filteredData;

/* Runs when the Main page loads */
function fillPage() {
  let data = getAllData();
  data.then(json => {
    window.addEventListener("scroll", scrollHandler);
    allData = json;
    console.log(allData);
    setFilter();
    createNextCards();
  });
}

function getAllData() {
  return fetch(`${API_URL}all?fields=${FIELDS_MAIN}`)
    .then(res => res.json());
}

/* Dynamically creates filter items and adds event listeners to filter */
function setFilter() {
  const dropdownBtn = document.getElementById("filter-by-region");
  const dropdownBtnText = document.querySelector("#filter-by-region p");
  const dropdownMenu = document.getElementById("filter-menu");
  const regions = new Set();

  dropdownBtn.addEventListener("click", function() {
    toggleDropdownView();
  });

  for (let obj of allData) {
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

  fetch(`${API_URL}region/${region}?fields=${FIELDS_MAIN}`)
    .then(res => res.json())
    .then(json => {
      allData = json;
      console.log(allData);
      main.innerHTML = "";
      createNextCards();
    });
}

function createNextCards(type) {
  let data = allData;
  if (type === "filtered") {
    data = filteredData;
  }
  console.log(data)

  for (let i = 0; i < MAX_CARDS; i++) {
    let cardNum = getCardNum();
    if (cardNum >= data.length) {
      console.log("DATA ended");
    } else {
      createCard(data[cardNum]);
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


/* Details
   Runs when the Details page loads */
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
  return fetch(`${API_URL}name/${hash}?fields=${FIELDS_DETAILS}`)
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
  return fetch(`${API_URL}alpha/${code.toLowerCase()}?fields=name`)
    .then(res => res.json());
}

function getUrl() {
  const url = window.location.href;
  let index = url.indexOf("#");
  return url.substring(0, index);
}


/* Search */
function searchByName() {
  const searchText = document.getElementById("search").value.toLowerCase();

  const filteredDataArr = allData.filter(item => 
    item.name.common.toLowerCase().includes(searchText)
  );

  filteredData = filteredDataArr;
  const main = document.getElementsByTagName("main")[0];
  main.innerHTML = "";
  createNextCards("filtered");
}