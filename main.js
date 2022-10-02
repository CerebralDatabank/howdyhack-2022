function getTimeStr(date) {
  return `${(date.getHours() == 12 ? 12 : date.getHours() % 12)}:${String(date.getMinutes()).padStart(2, "0")} ${(date.getHours() < 12) ? "AM" : "PM"}`;
}

function genId() {
  return Math.floor(Math.random() * (0xFFFFFF - 0 + 1) + 0).toString(16).padStart(6, "0").toUpperCase();
}

function getDateStr(timestamp) {
  let date = new Date(timestamp);
  return (
    String(date.getFullYear()).padStart(4, "0") + "-" +
    String((date.getMonth() + 1)).padStart(2, "0") + "-" +
    String(date.getDate()).padStart(2, "0"));
}

class Entry {
  constructor(date = new Date(), att = "An attraction", city = "A city", journal = "feelings") {
    this.date = date;
    this.att = att;
    this.city = city;
    this.journal = journal;
    this.id = genId();
  }

  toHTML() {
    return `<div class="entry" id="entry_${this.id}" data-timestamp="${this.timestamp}">
    <div class="entry-edit"></div>
    <div class="entry-delete" onclick="deleteEntry(this.parentElement.id.slice(6));"></div>
    <div class="entry-time">${getTimeStr(this.date)}</div>
    <div class="entry-att">${this.att}</div>
    <div class="entry-city">${this.city}</div>
    <div class="entry-journal">${this.journal}</div>
  </div>`;
  }

  get timestamp() {
    return this.date.getTime();
  }

  get dateStr() {
    return (
      String(this.date.getFullYear()).padStart(4, "0") + "-" +
      String((this.date.getMonth() + 1)).padStart(2, "0") + "-" +
      String(this.date.getDate()).padStart(2, "0"));
  }
}

let entries = [];

function closeDiag() {
  document.getElementById("add-event-diag").close();
}

function clearDiag() {
  // document.getElementById("diag-date").value = "";
  // document.getElementById("diag-time").value = "";
  document.getElementById("diag-att").value = "";
  document.getElementById("diag-city").value = "";
  document.getElementById("diag-journal").value = "";
}

function genDaySep(entry) {
  let justDay = new Date(entry.date);
  justDay.setHours(0);
  justDay.setMinutes(0);
  justDay.setSeconds(0);
  return `<div class="day-sep" data-timestamp="${justDay.getTime()}">${justDay.toString().slice(0, 15)}</div>`;
}

function insertEntry(entry) {
  if (document.getElementById("empty-msg")) {
    document.getElementById("empty-msg").remove();
  }

  let daySepExists = false;
  let htmlStr = entry.toHTML();
  
  for (let i = 0; i < document.getElementById("entry-list").children.length; i++) {
    let elem = document.getElementById("entry-list").children[i];
    if (entry.timestamp == Number(elem.getAttribute("data-timestamp"))) {
      alert("Conflicting time!");
    }
    if (elem.classList.contains("day-sep") && entry.dateStr == getDateStr(Number(elem.getAttribute("data-timestamp")))) {
      console.group("Day sep check");
      console.log(elem.classList.contains("day-sep"));
      console.log(entry.dateStr);
      console.log(getDateStr(Number(elem.getAttribute("data-timestamp"))));
      console.groupEnd();
      daySepExists = true;
      console.log("daySepExists is true");
    }
    if (entry.timestamp < Number(elem.getAttribute("data-timestamp"))) {
      if (!daySepExists) {
        htmlStr = genDaySep(entry) + htmlStr;
      }
      elem.insertAdjacentHTML("beforebegin", htmlStr);
      return;
    }
  }

  if (!daySepExists) {
    htmlStr = genDaySep(entry) + htmlStr;
  }
  document.getElementById("entry-list").insertAdjacentHTML("beforeend", htmlStr);
}

function addEvent() {
  let dateStr = document.getElementById("diag-date").value;
  let timeStr = document.getElementById("diag-time").value;
  let currDate = new Date(dateStr + "T" + timeStr);

  let currEntry = new Entry(
    currDate,
    document.getElementById("diag-att").value,
    document.getElementById("diag-city").value,
    document.getElementById("diag-journal").value.replace(/\n/g, "<br>")
  );

  entries.push(currEntry);

  insertEntry(currEntry);
  closeDiag();
}

// function saveEntry(entryId) {
// f
// }

function deleteEntry(entryId) {
  if (!confirm("Are you sure you want to delete this?\nThis action cannot be undone!")) {
    return;
  }
  document.getElementById(`entry_${entryId}`).classList.add("entry-deleting");
  let currDaySep = document.getElementById(`entry_${entryId}`);
  while (!currDaySep.classList.contains("day-sep") && currDaySep != null) {
    currDaySep = currDaySep.previousElementSibling;
  }
  if (!(currDaySep && currDaySep.nextElementSibling && !currDaySep.nextElementSibling.classList.contains("entry"))) {
    currDaySep.classList.add("day-sep-deleting");
    setTimeout(() => {
      currDaySep.remove();
    }, 700);
  }
  setTimeout(() => {
    document.getElementById(`entry_${entryId}`).remove();
    
  }, 1000);
}


window.addEventListener("load", event => {
  insertEntry(new Entry(new Date(), "Att", "City", "Journal"));
})