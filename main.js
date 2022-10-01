class Entry {
  constructor(time = "At any time", att = "An attraction", city = "A city", journal = "feelings") {
    this.time = time;
    this.att = att;
    this.city = city;
    this.journal = journal;
  }

  toHTML() {
    return `<div class="entry">
    <div class="entry-time">${this.time}</div>
    <div class="entry-att">${this.att}</div>
    <div class="entry-city">${this.city}</div>
    <div class="entry-journal">${this.journal}</div>
  </div>`;
  }
}

function addEvent() {
  
}