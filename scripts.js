function fillPage() {
  let data = getData();
  data.then(json => {
    console.log(json);
    json.forEach(element => {
      createCard(element);
    });
  });
}

function getData() {
  return fetch("https://restcountries.com/v3.1/all?fields=name,flags,population,region,capital")
    .then(res => res.json());
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