import { Notify } from 'notiflix';
import debounce from 'lodash.debounce';
import '../css/styles.css';
import { fetchCountryAPI } from './countriesAPI.js';

const DEBOUNCE_DELAY = 300;

const refs = {
  searchCountry: document.querySelector('#search-box'),
  countryList: document.querySelector('.country-list'),
  countryInfo: document.querySelector('.country-info'),
};

const onSearchCountryInput = event => {
  const searchedQuery = event.target.value.trim();
  if (!searchedQuery) {
    Notify.warning('Please enter the country');
    removeCountryInfo();
    clearCountryList();
    return;
  }
  fetchCountryAPI(searchedQuery)
    .then(data => {
      if (data.length > 10) {
        removeCountryInfo();
        clearCountryList();
        Notify.info(
          'Too many matches found. Please enter a more specific name.'
        );
      }
      if (data.length >= 2 && data.length <= 10) {
        removeCountryInfo();
        renderCountryList(data);
      }
      if (data.length === 1) {
        clearCountryList();
        renderCountryCard(data);
      }
    })
    .catch(err => {
      if (err.message === '404') {
        Notify.failure('"Oops, there is no country with that name"');
        removeCountryInfo();
        clearCountryList();
      }
      console.log(err);
    });
};

refs.searchCountry.addEventListener(
  'input',
  debounce(onSearchCountryInput, DEBOUNCE_DELAY)
);

// RENDER COUNTRY LIST (in future add link)
function renderCountryList(data) {
  const markup = data.map(({ name: { common }, flags: { svg, alt } }) => {
    return `
    <li class="country-item">
      <a class="country-item-link" href="https://www.google.com/search?q=${common}"> 
        <img class="img-flag" src="${svg}" alt="${alt}">
        <span>${common}</span>
      </a>
    </li>
      `;
  });

  refs.countryList.innerHTML = markup.join('');
  refs.countryList.classList.add('country-list-js');
}
// END RENDER COUNTRY LIST

// RENDER COUNTRY CARD (INFO)
function renderCountryCard(data) {
  const markup = data
    .map(
      ({
        name: { common },
        flags: { svg, alt },
        capital,
        population,
        languages,
      }) => {
        return `<li class="country-info-item">
        <div>
          <img class="img-flag" src="${svg}" alt="${alt}">
          <h2 style="display: inline">${common}</h2>
        </div>
        <p><b>Capital:</b> ${capital}</p>
        <p><b>Population:</b> ${population}</p>
        <p><b>Languages:</b> ${Object.values(languages).join(', ')}</p>
      </li>`;
      }
    )
    .join('');
  refs.countryInfo.insertAdjacentHTML('afterbegin', markup);
  refs.countryInfo.classList.add('country-info-js');
}
// END RENDER COUNTRY CARD (INFO)

function clearCountryList() {
  refs.countryList.innerHTML = '';
  refs.countryList.classList.remove('country-list-js');
}

function removeCountryInfo() {
  refs.countryInfo.classList.remove('country-info-js');
}
