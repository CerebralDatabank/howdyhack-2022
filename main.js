function getTimeStr(date) {
  return `${((date.getHours() == 12 || date.getHours() == 0) ? 12 : date.getHours() % 12)}:${String(date.getMinutes()).padStart(2, "0")} ${(date.getHours() < 12) ? "AM" : "PM"}`;
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
    <div class="entry-edit" onclick="diagEditMode('${this.id}'); openDiag();"></div>
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

  toString() {
    let obj = {};
    obj.date = this.date.toString();
    obj.att = this.att;
    obj.city = this.city;
    obj.journal = this.journal;
    obj.id = this.id;
    return JSON.stringify(obj);
  }

  static fromString(str) {
    let entry = new Entry();
    let obj = JSON.parse(str);
    entry.date = new Date(obj.date);
    entry.att = obj.att;
    entry.city = obj.city;
    entry.journal = obj.journal;
    entry.id = obj.id;
    return entry;
  }
}

function validateText(inputElem) {
  document.getElementById("submit-error").classList.remove();
  if (!inputElem.value.trim()) {
    inputElem.classList.add("invalid-input");
    return false;
  }
  else {
    inputElem.classList.remove("invalid-input");
    return true;
  }
}

function combineDateTime(dateStr, timeStr) {
  return new Date(dateStr + "T" + timeStr);
}

function hideWelcomeScreen() {
  let welcomeScr = document.getElementById("welcome-screen")
  welcomeScr.classList.add("fade-up-out");
  setInterval(() => {
    welcomeScr.remove();
  }, 400);
}

function switchTheme(elemId) {
  ["blue", "green", "purple", "red", "maroon"].forEach(themeId => {
    document.documentElement.classList.remove(`theme-${themeId}`);
  });
  theme = elemId.slice(10);
  document.documentElement.classList.add(`theme-${theme}`);
  console.log(theme);
  storeTheme();
}

function openDiag() {
  document.getElementById('add-event-diag').showModal();
}

function showDiagMsg(elemId) {
  document.getElementById("time-conflict").classList.add("hidden");
  document.getElementById("submit-error").classList.add("hidden");
  document.getElementById(elemId).classList.remove("hidden");

  if (elemId == "time-conflict") {
    document.getElementById("diag-date").classList.add("warning-input");
    document.getElementById("diag-time").classList.add("warning-input");
  }
}

function hideDiagMsg(elemId) {
  document.getElementById("time-conflict").classList.add("hidden");
  document.getElementById("submit-error").classList.add("hidden");
  document.getElementById(elemId).classList.add("hidden");

  if (elemId == "time-conflict") {
    document.getElementById("diag-date").classList.remove("warning-input");
    document.getElementById("diag-time").classList.remove("warning-input");
  }
}

function clearInvalid() {
  hideDiagMsg("time-conflict");
  document.getElementById("diag-city").classList.remove("invalid-input");
  document.getElementById("diag-att").classList.remove("invalid-input");
  document.getElementById("diag-date").classList.remove("invalid-input");
  document.getElementById("diag-time").classList.remove("invalid-input");
}

function checkTimeConflict(evtType) {
  if (evtType == "blur") {
    let currDate = combineDateTime(document.getElementById("diag-date").value, document.getElementById("diag-time").value);
    for (let entry of entries) {
      if (entry.date.toString() == "Invalid Date") {
        continue;
      }
      if (entry.date.toString() == currDate.toString() && (!entryEditId || entries.find(e => e == entryEditId).date.toString() != currDate.toString())) {
        showDiagMsg("time-conflict");
        break;
      }
    }
  }

  if (evtType == "input") {
    hideDiagMsg("time-conflict");
  }
}

let entries = [];
let theme = "blue";

function closeDiag() {
  document.getElementById("add-event-diag").close();
}

function clearDiag() {
  // document.getElementById("diag-date").value = "";
  document.getElementById("diag-time").value = "";
  document.getElementById("diag-att").value = "";
  document.getElementById("diag-city").value = "";
  document.getElementById("diag-journal").value = "";
}

let entryEditId = null;

function diagEditMode(entryId) {
  document.getElementById("diag-title").innerHTML = "Edit Event";
  document.getElementById("diag-add-btn").innerHTML = "Save";
  entryEditId = entryId;

  let entryToEdit = entries.find(e => e.id == entryId);

  document.getElementById("diag-date").value = getDateStr(entryToEdit.date); 
  document.getElementById("diag-time").value = entryToEdit.time;
  document.getElementById("diag-att").value = entryToEdit.att;
  document.getElementById("diag-city").value = entryToEdit.city;
  document.getElementById("diag-journal").value = entryToEdit.journal;
}

function diagAddMode() {
  document.getElementById("diag-title").innerHTML = "Add Event";
  document.getElementById("diag-add-btn").innerHTML = "Add";
  entryEditId = null;
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
    // if (entry.timestamp == Number(elem.getAttribute("data-timestamp"))) {
    //   alert("Conflicting time!");
    // }
    if (elem.classList.contains("day-sep") && entry.dateStr == getDateStr(Number(elem.getAttribute("data-timestamp")))) {
      daySepExists = true;
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

function addEvent(entryId) {
  let valid1 = validateText(document.getElementById("diag-city"));
  let valid2 = validateText(document.getElementById("diag-att"));
  let valid3 = validateText(document.getElementById("diag-date"));
  let valid4 = validateText(document.getElementById("diag-time"));
  if (!(valid1 && valid2 && valid3 && valid4)) {
    showDiagMsg("submit-error");
    return;
  }

  let dateStr = document.getElementById("diag-date").value;
  let timeStr = document.getElementById("diag-time").value;
  let currDate = combineDateTime(dateStr, timeStr);

  let currEntry = new Entry(
    currDate,
    document.getElementById("diag-att").value,
    document.getElementById("diag-city").value,
    document.getElementById("diag-journal").value.replace(/\n/g, "<br>")
  );

  if (entryId) {
    deleteEntry(entryId, true);
  }
  entries.push(currEntry);
  insertEntry(currEntry);
  storeEntries(entries);
  clearDiag();
  clearInvalid();
  closeDiag();
}

function deleteEntry(entryId, instant = false) {
  if (!instant && !confirm("Are you sure you want to delete this?\nThis action cannot be undone!")) {
    return;
  }
  document.getElementById(`entry_${entryId}`).classList.add("entry-deleting");
  let currDaySep = document.getElementById(`entry_${entryId}`);
  while (currDaySep != null && !currDaySep.classList.contains("day-sep")) {
    currDaySep = currDaySep.previousElementSibling;
  }
  if (currDaySep) {
    let nextSibling = currDaySep.nextElementSibling;
    if (nextSibling.classList.contains("entry-deleting")) {
      nextSibling = nextSibling.nextElementSibling;
    }
    if (nextSibling && nextSibling.classList.contains("entry")) {}
    else {
      currDaySep.classList.add("day-sep-deleting");
      if (!instant) {
        setTimeout(() => {
          currDaySep.remove();
        }, 700);
      }
      else {
        currDaySep.remove();
      }
    }
  }
  if (!instant) {
    setTimeout(() => {
      document.getElementById(`entry_${entryId}`).remove();
      entries.splice(entries.findIndex(entry => entry.id == entryId), 1);
      if (entries.length == 0) {
        document.getElementById("entry-list").insertAdjacentHTML("beforeend", `<div id="empty-msg">No events yet!</div>`);
      }
      storeEntries(entries);
    }, 1000);
  }
  else {
    document.getElementById(`entry_${entryId}`).remove();
    entries.splice(entries.findIndex(entry => entry.id == entryId), 1);
    if (entries.length == 0) {
      document.getElementById("entry-list").insertAdjacentHTML("beforeend", `<div id="empty-msg">No events yet!</div>`);
    }
    storeEntries(entries);
  }
}

function storeEntries(entries) {
  localStorage.setItem("user_entries", entries.map(entry => entry.toString()).join("|"));
}

function restoreEntries() {
  if (!localStorage.getItem("user_entries")) {
    return;
  }
  entries = [];
  for (let entryStr of localStorage.getItem("user_entries").split("|")) {
    let entry = Entry.fromString(entryStr);
    entries.push(entry);
    insertEntry(entry);
  }
}

function storeTheme() {
  localStorage.setItem("user_theme", theme);
}

function restoreTheme() {
  theme = localStorage.getItem("user_theme");
  console.log(`theme-btn-${theme}`);
  switchTheme(`theme-btn-${theme}`);
}

window.addEventListener("load", () => {
  restoreEntries();
  restoreTheme();
});