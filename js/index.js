const catSelect = document.getElementById("category");
const nameSelect = document.getElementById("name");
const details = document.getElementById("details");
var values = {
  people: [],
  planets: [],
  films: [],
  species: [],
  vehicles: [],
  starships: []
};

fetch("https://swapi.co/api/").then(response => {
  if (!isValidJsonResponse(response)) return;

  response.json().then(json => {
    catSelect.innerHTML = Object.keys(json)
      .map(key => `<option value="${key}">${key}</option>`)
      .join("");
    handleCategoryChange.call(catSelect);
  });
});

function isValidJsonResponse(response) {
  const contentType = response.headers.get("content-type");
  return (
    contentType &&
    contentType.indexOf("application/json") !== -1 &&
    response.status === 200
  );
}

function getDataByCategory(currentPage) {
  let category = catSelect.value;
  let page = currentPage || 1;
  return fetch(`https://swapi.co/api/${category}/?page=${page}`)
    .then(function(response) {
      if (!isValidJsonResponse(response)) return;
      return response.json();
    })
    .then(json => {
      values[category].push(...json.results);
      if (json.next !== null) {
        return getDataByCategory((page += 1));
      } else {
        return json;
      }
    });
}

function removeOptions(selectbox) {
  var i;
  for (i = selectbox.options.length - 1; i >= 0; i--) {
    selectbox.remove(i);
  }
}

function addLoadingOption(selectbox) {
  nameSelect.innerHTML = `<option value="-1">Loading..</option>`;
}

function handleCategoryChange() {
  addLoadingOption(nameSelect);
  console.dir(values[catSelect.value]);
  if (values[catSelect.value].length > 0) {
    removeOptions(nameSelect);
    nameSelect.innerHTML = values[catSelect.value]
      .map(
        key =>
          `<option value="${key.name || key.title}" data-url="${key.url ||
            "null"}">${key.name || key.title}</option>`
      )
      .join("");
    handleValueChange.call(nameSelect);
  } else {
    getDataByCategory().then(function() {
      values[catSelect.value].sort(function(a, b) {
        var textA = (a.name || a.title).toUpperCase();
        var textB = (b.name || b.title).toUpperCase();
        return textA < textB ? -1 : textA > textB ? 1 : 0;
      });

      removeOptions(nameSelect);

      nameSelect.innerHTML = values[catSelect.value]
        .map(
          key =>
            `<option value="${key.name || key.title}" data-url="${key.url ||
              "null"}">${key.name || key.title}</option>`
        )
        .join("");

      handleValueChange.call(nameSelect);
    });
  }
}

function handleValueChange() {
  console.dir(details);
  details.innerHTML = "";

  const item = values[catSelect.value].filter(
    option => (option.name || option.title) === this.selectedOptions[0].value
  )[0];

  const keys = Object.keys(item);
  const detailsHtml = document.createElement("dl");
  detailsHtml.classList.add("row");

  keys.forEach(key => {
    const dt = document.createElement("dt");
    dt.classList.add("col-4");
    dt.textContent = key;

    const dd = document.createElement("dd");
    dd.classList.add("col-8");

    if (Array.isArray(item[key])) {
      dd.innerHTML = item[key].join("<br/>");
    } else {
      dd.textContent = item[key];
    }
    detailsHtml.appendChild(dt);
    detailsHtml.appendChild(dd);
  });

  details.appendChild(detailsHtml);
}

catSelect.addEventListener("change", handleCategoryChange);
nameSelect.addEventListener("change", handleValueChange);