const maxLoad = 3;
let dataArr;

function fillPage() {
  let data = getData();
  data.then(json => {
    window.addEventListener("scroll", scrollHandler);
    dataArr = json;
    console.log(dataArr);
    createNextCards();
  });
}

function getData() {
  // return fetch("https://restcountries.com/v3.1/all?fields=name,flags,population,region,capital")
  return fetch("https://restcountries.com/v3.1/region/europe?fields=name,flags,population,region,capital")
    .then(res => res.json());
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
    <img src="${country.flags.svg}" alt="${country.flags.alt}">
    <div class="card-body">
      <h2 class="country-name">${country.name.common}</h2>
      <p class="country-population"><strong>Population:</strong> ${country.population}</p>
      <p class="country-region"><strong>Region:</strong> ${country.region}</p>
      <p class="country-capital"><strong>Capital:</strong> ${country.capital}</p>
    </div>
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