const formSearch = document.querySelector(".form-search"),
  inputCitiesFrom = formSearch.querySelector(".input__cities-from"),
  dropdownCitiesFrom = formSearch.querySelector(".dropdown__cities-from"),
  inputCitiesTo = formSearch.querySelector(".input__cities-to"),
  dropdownCitiesTo = formSearch.querySelector(".dropdown__cities-to"),
  inputDateDepart = formSearch.querySelector(".input__date-depart");

const CITIES_API = "data/cities.json",
  PROXY = "https://cors-anywhere.herokuapp.com/",
  API_KEY = "d338cf84b810caf336989e6923014c2a",
  CALENDAR = "http://min-prices.aviasales.ru/calendar_preload";

let city = [];

const showCity = (input, list) => {
  list.textContent = "";

  if (input.value !== "") {
    const filterCity = city.filter(item => {
      const fixItem = item.name_translations.en.toLowerCase();
      return fixItem.includes(input.value.toLowerCase());
    });

    filterCity.forEach(item => {
      const li = document.createElement("li");
      li.classList.add("dropdown__city");
      li.textContent = item.name_translations.en;
      list.append(li);
    });
  }
};

const getData = (url, callback) => {
  const request = new XMLHttpRequest();

  request.open("GET", url);

  request.addEventListener("readystatechange", () => {
    if (request.readyState !== 4) return;

    if (request.status === 200) {
      callback(request.response);
    } else {
      console.error(request.status);
    }
  });

  request.send();
};

const selectCity = (event, input, list) => {
  const target = event.target;
  if (target.tagName.toLowerCase() === "li") {
    input.value = target.textContent;
    list.textContent = "";
  }
};

const renderCheapDay = (cheapTicket) => {
  // console.log(cheapTicket);
};

const renderCheapYear = (cheapTickets) => {
  // console.log(cheapTickets);
};

const renderCheap = (data, date) => {
  const cheapTicketYear = JSON.parse(data).best_prices;
  console.log(cheapTicketYear);

  const cheapTicketDay = cheapTicketYear.filter((item) => {
    return item.depart_date === date;
  })
  console.log(cheapTicketDay);

  renderCheapDay(cheapTicketDay)

  renderCheapYear(cheapTicketYear)
};



inputCitiesFrom.addEventListener("input", () => {
  showCity(inputCitiesFrom, dropdownCitiesFrom);
});

inputCitiesTo.addEventListener("click", () => {
  showCity(inputCitiesTo, dropdownCitiesTo);
});

dropdownCitiesFrom.addEventListener("click", event => {
  selectCity(event, inputCitiesFrom, dropdownCitiesFrom);
});

dropdownCitiesTo.addEventListener("click", event => {
  selectCity(event, inputCitiesTo, dropdownCitiesTo);
});

getData(CITIES_API, data => {
  city = JSON.parse(data).filter(item => item.name_translations);
  // console.log(city);
});

formSearch.addEventListener('submit', (event) => {
  event.preventDefault();

  const cityFrom = city.find((item) => {
    return inputCitiesFrom.value === item.name_translations.en
  });
  const cityTo = city.find((item) => {
    return inputCitiesTo.value === item.name_translations.en
  });

  const formData = {
    from: cityFrom.code,
    to: cityTo.code,
    when: inputDateDepart.value
  };

  const requestData = `?depart_date=${formData.when}&origin=${formData.from}&destination=${formData.to}&one_way=true&token=${API_KEY}`;

  getData(CALENDAR + requestData, (data) => {
    renderCheap(data, formData.when)
  });

});
