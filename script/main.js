const formSearch = document.querySelector(".form-search"),
  inputCitiesFrom = formSearch.querySelector(".input__cities-from"),
  dropdownCitiesFrom = formSearch.querySelector(".dropdown__cities-from"),
  inputCitiesTo = formSearch.querySelector(".input__cities-to"),
  dropdownCitiesTo = formSearch.querySelector(".dropdown__cities-to"),
  inputDateDepart = formSearch.querySelector(".input__date-depart"),
  body = document.querySelector("body");

const cheapestTicket = document.getElementById("cheapest-ticket"),
  otherCheapTickets = document.getElementById("other-cheap-tickets");

const CITIES_API = "data/cities.json",
  //base - "http://api.travelpayouts.com/data/ru/cities.json",
  PROXY = "",
  //base - "https://cors-anywhere.herokuapp.com/",
  CALENDAR = "http://min-prices.aviasales.ru/calendar_preload",
  // API_KEY = "d338cf84b810caf336989e6923014c2a",
  MAX_COUNT = 10;

const CURRENCY_API = "data/currency.json";
//base - "http://yasen.aviasales.ru/adaptors/currency.json";

let city = [],
  euro = 0;

// BEGIN FUNCTION
const getData = (url, callback, errorFunc = console.error) => {
  const request = new XMLHttpRequest();

  request.open("GET", url);

  request.addEventListener("readystatechange", () => {
    if (request.readyState !== 4) return;

    if (request.status === 200) {
      callback(request.response);
    } else {
      errorFunc(request.status);
    }
  });
  request.send();
};

const formEvent = document.getElementById("form_search");
formEvent.addEventListener(
  "focus",
  function (event) {
    event.target.style.background = "#f57c00";
  },
  true
);
formEvent.addEventListener(
  "blur",
  function (event) {
    event.target.style.background = "";
  },
  true
);

const showCity = (input, list) => {
  list.textContent = "";

  if (input.value !== "") {
    const filterCity = city.filter(item => {
      const fixItem = item.name_translations.en.toLowerCase();
      return fixItem.startsWith(input.value.toLowerCase());
    });

    filterCity.forEach(item => {
      const li = document.createElement("li");
      li.classList.add("dropdown__city");
      li.textContent = item.name_translations.en;
      list.append(li);
    });
  }
};

const selectCity = (event, input, list) => {
  const target = event.target;
  if (target.tagName.toLowerCase() === "li") {
    input.value = target.textContent;
    list.textContent = "";
  }
};

const getNameCity = code => {
  const objCity = city.find(item => item.code === code);
  return objCity.name_translations.en;
};

const getDate = date => {
  return new Date(date).toLocaleString("en", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short"
  });
};

const getDirect = num => {
  if (num) {
    return num === 1 ? "1 direct" : "2 direct";
  } else {
    return "Non direct";
  }
};

const getLink = data => {
  let link = "https://www.aviasales.ua/search/";
  link += data.origin;

  const date = new Date(data.depart_date);
  const day = date.getDate();
  link += day < 10 ? "0" + day : day;

  const month = date.getMonth() + 1;
  link += month < 10 ? "0" + month : month;

  link += data.destination;
  link += "1";

  return link;
};

const createCard = data => {
  const ticket = document.createElement("article");
  ticket.classList.add("ticket");
  body.style.background = "white";
  let deep = "";

  if (data) {
    body.style.background = "";
    deep = `
    <h3 class="agent">${data.gate}</h3>
    <div class="ticket__wrapper">
      <div class="left-side">
        <a href="${getLink(
          data
        )}" target="_blank" " class="button button__buy">Ticket price ${Math.ceil(
      data.value / euro
    )} €</a>
      </div>
      <div class="right-side">
        <div class="block-left">
          <div class="city__from">Departure from
            <span class="city__name">${getNameCity(data.origin)}</span>
          </div>
          <div class="date">${getDate(data.depart_date)}</div>
        </div>

        <div class="block-right">
          <div class="changes">${getDirect(data.number_of_changes)}</div>
          <div class="city__to">Destination to:
            <span class="city__name">${getNameCity(data.destination)}</span>
          </div>
        </div>
      </div>
    </div>
    `;
  } else {
    deep = "<h3>Sorry, not found ticket in this date</h3>";
  }

  ticket.insertAdjacentHTML("afterbegin", deep);

  return ticket;
};

const renderCheapDay = cheapTicket => {
  cheapestTicket.style.display = "block";
  cheapestTicket.innerHTML =
    "<h2>The cheapest ticket for the selected date</h2>";

  const ticket = createCard(cheapTicket[0]);
  cheapestTicket.append(ticket);
};

const renderCheapYear = cheapTickets => {
  otherCheapTickets.style.display = "block";
  otherCheapTickets.innerHTML = "<h2>Cheapest tickets for other dates</h2>";

  cheapTickets.sort((a, b) => a.value - b.value);

  for (let i = 0; i < cheapTickets.length && i < MAX_COUNT; i++) {
    const ticket = createCard(cheapTickets[i]);
    otherCheapTickets.append(ticket);
  }
};

const renderCheap = (data, date) => {
  const cheapTicketYear = JSON.parse(data).best_prices;

  const cheapTicketDay = cheapTicketYear.filter(item => {
    return item.depart_date === date;
  });

  renderCheapDay(cheapTicketDay);
  renderCheapYear(cheapTicketYear);
};

inputCitiesFrom.addEventListener("input", () => {
  showCity(inputCitiesFrom, dropdownCitiesFrom);
});

inputCitiesTo.addEventListener("input", () => {
  showCity(inputCitiesTo, dropdownCitiesTo);
});

dropdownCitiesFrom.addEventListener("click", event => {
  selectCity(event, inputCitiesFrom, dropdownCitiesFrom);
});

dropdownCitiesTo.addEventListener("click", event => {
  selectCity(event, inputCitiesTo, dropdownCitiesTo);
});

// FUNCTION CALL
getData(PROXY + CURRENCY_API, data => {
  euro = JSON.parse(data).eur;
});

formSearch.addEventListener("submit", event => {
  event.preventDefault();

  const cityFrom = city.find(item => {
    return inputCitiesFrom.value === item.name_translations.en;
  });
  const cityTo = city.find(item => {
    return inputCitiesTo.value === item.name_translations.en;
  });

  const formData = {
    from: cityFrom,
    to: cityTo,
    when: inputDateDepart.value
  };

  if (formData.from && formData.to) {
    const requestData =
      `?depart_date=${formData.when}&origin=${formData.from.code}` +
      `&destination=${formData.to.code}&one_way=true`;

    getData(
      CALENDAR + requestData,
      data => {
        renderCheap(data, formData.when);
      },
      error => {
        alert("There are no flights in this direction");
        console.error("Error", error);
      }
    );
  } else {
    alert("Enter correct name city");
  }
});

getData(PROXY + CITIES_API, data => {
  city = JSON.parse(data).filter(
    item => item.name && item.name_translations.en
  );

  city.sort((a, b) => {
    if (a.name_translations.en > b.name_translations.en) {
      return 1;
    }
    if (a.name_translations.en < b.name_translations.en) {
      return -1;
    }
    return 0;
  });
});
