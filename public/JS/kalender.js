let nav = 0; // this variable is used to keep track of the month the user is on
let blankDays;
let selectedDate;

const calendar = document.getElementById("calendar");
const weekdays = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];
const addButton = document.getElementById("add-button");


// LOAD CALENDAR FUNCTION //
async function loadCalendar() {
  const date = new Date();

  if (nav !== 0) {
    date.setMonth(new Date().getMonth() + nav);
  };

  const day = date.getDate();
  const month = date.getMonth(); // careful, getMonth index is 0-11 (0 = January, 11 = December)
  const year = date.getFullYear();
  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate(); // current year, month, 0 = the last day of the previous month)

  const dateString = firstDayOfMonth.toLocaleDateString("de-de", {
    weekday: "long",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });

  blankDays = weekdays.indexOf(dateString.split(", ")[0]); // calculating the "blank" days before the first day of the month in the week

  document.getElementById("monthDisplay").innerText = `${date.toLocaleDateString("de-de", { month: "long" })} ${year}`;

  calendar.innerHTML = ""; // resetting the calendar

  const eventsContainer = document.getElementById("events-container");
  eventsContainer.innerHTML = ""; // clear events when changing the month

  // Fetch event data from the backend
  const eventsData = await fetchEventData();

  // Loop through each day square and check if it has events
  for (let i = 1; i <= blankDays + daysInMonth; i++) {
    const daySquare = document.createElement("div");
    daySquare.classList.add("daySquare");

    if (i > blankDays) {
      daySquare.innerText = i - blankDays;

      if (i - blankDays === day && nav == 0) {
        daySquare.id = "currentDay";
      }
      const currentDate = new Date(year, month, i - blankDays);

      // Check if there are events on this date
      const eventsOnDate = filterEventsByDate(eventsData, currentDate);

      // Render events (e.g., by adding dots or labels)
      if (eventsOnDate.length > 0) {
        const eventIndicator = document.createElement("div");
        eventIndicator.classList.add("event-indicator");
        daySquare.appendChild(eventIndicator);
      }

      // Add a click event listener to handle interactions with the day square
      daySquare.addEventListener("click", () => {
        displayDayEvents(currentDate, eventsOnDate);

        const eventsContainer = document.getElementById("events-container");
        eventsContainer.scrollIntoView({ behavior: "smooth" });

        selectedDate = currentDate;
        // Format the date as yyyy-mm-dd with leading zeros and save it to local storage
        const formattedDate = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}`;
        localStorage.setItem("selectedDate", formattedDate);
      });

      addButton.addEventListener("click", () => {
        if (!selectedDate) {
          localStorage.setItem("selectedDate", "");
        } 
        window.location.assign("/kalender/neuer-Eintrag");
      });
    }

    calendar.appendChild(daySquare);
  }
};

// FILTER EVENTS BY DATE FUNCTION //
function filterEventsByDate(events, targetDate) {
  return events.filter((event) => {
    const eventDate = new Date(event.date);
    return (
      eventDate.getDate() === targetDate.getDate() &&
      eventDate.getMonth() === targetDate.getMonth() &&
      eventDate.getFullYear() === targetDate.getFullYear()
    );
  });
}

// DISPLAY DAY EVENTS FUNCTION //
function displayDayEvents(currentDate, eventsData) {
  // Filter events that match the clicked date
  const eventsOnDate = filterEventsByDate(eventsData, currentDate);
  const eventsContainer = document.getElementById("events-container");
  const eventList = document.createElement("ul");
  eventList.classList.add("event-list");

  // Loop through eventsOnDate and create list items for each event
  eventsOnDate.forEach((event) => {
    const eventListItem = document.createElement("li");
    eventListItem.classList.add("event-item");
    eventListItem.style.backgroundColor = event.color;

    const eventTitle = document.createElement("div");
    const eventTime = document.createElement("div");
    eventTitle.classList.add("event-title");
    eventTime.classList.add("event-time");

    eventTitle.textContent = event.title;
    eventTime.textContent = event.startEventTime && event.endEventTime ? `${event.startEventTime} - ${event.endEventTime}` : "";

    const deleteEventButton = document.createElement("button");
    deleteEventButton.classList.add("delete-btn-dark");
    deleteEventButton.addEventListener("click", () => {
    deleteCalendarEvent(event._id);
    });

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "20");
    svg.setAttribute("height", "20");
    svg.setAttribute("viewBox", "0 0 24 24");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("fill", "currentColor");
    path.setAttribute("d", "M7 21q-.825 0-1.413-.588T5 19V6q-.425 0-.713-.288T4 5q0-.425.288-.713T5 4h4q0-.425.288-.713T10 3h4q.425 0 .713.288T15 4h4q.425 0 .713.288T20 5q0 .425-.288.713T19 6v13q0 .825-.588 1.413T17 21H7Zm5-7.1l1.9 1.9q.275.275.7.275t.7-.275q.275-.275.275-.7t-.275-.7l-1.9-1.9l1.9-1.9q.275-.275.275-.7t-.275-.7q-.275-.275-.7-.275t-.7.275L12 11.1l-1.9-1.9q-.275-.275-.7-.275t-.7.275q-.275.275-.275.7t.275.7l1.9 1.9l-1.9 1.9q-.275.275-.275.7t.275.7q.275.275.7.275t.7-.275l1.9-1.9Z");

    svg.appendChild(path);
    deleteEventButton.appendChild(svg);

    eventListItem.appendChild(eventTitle);
    eventListItem.appendChild(eventTime);
    eventListItem.appendChild(deleteEventButton);

    eventList.appendChild(eventListItem);
  });
  // Append the eventList to the eventsContainer
  eventsContainer.innerHTML = ''; // Clear any previous content
  eventsContainer.appendChild(eventList);
};

// SEND AJAX REQUEST TO DELETE CALENDAR EVENT FUNCTION //

function deleteCalendarEvent (eventId) {
  if (!eventId) {
    console.log("Event ID is missing.");
    return;
  }

  fetch(`/kalender/delete-event/${eventId}`, {
    method: "DELETE",
  })
  .then((response) => {
    if (response.ok) {
      console.log("event erfolgreich gelöscht");
      loadCalendar();
    } else {
      console.log("ERROR, Löschung hat nicht funktioniert.");
    }
  })
  .catch((error) => {
    console.error("Ein Fehler ist unterlaufen beim Senden der DELETE REQUEST.", error);
  });
};

// FETCH EVENT DATA FROM BACKEND FUNCTION //
async function fetchEventData() {
  try {
    const response = await fetch("/kalender/api/events");
    if (response.ok) {
      const events = await response.json();
      return events;
    } else {
      throw new Error("Failed to fetch event data");
    }
  } catch (error) {
    console.error("Error fetching event data:", error);
    return [];
  }
}

// CHANGE MONTH FUNCTION //
function changeMonth() {
  document.getElementById("forwardMonthButton").addEventListener("click", () => {
    nav++;
    loadCalendar();
  });
  document.getElementById("backwardMonthButton").addEventListener("click", () => {
    nav--;
    loadCalendar();
  });
}

changeMonth();
loadCalendar();
