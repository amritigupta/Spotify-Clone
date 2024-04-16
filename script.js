console.log("Lets write Javascript");
let currentsong = new Audio();
let songs;
let currfolder;

function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

// console.log(secondsToMinutesSeconds(75)); // Output: "01:15"
// console.log(secondsToMinutesSeconds(3661)); // Output: "61:01"

async function getSongs(folder) {
  currfolder = folder;
  let a = await fetch(`/${folder}/`);
  let response = await a.text();
  // console.log(response);
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }

  //play first sng
  playmusic(songs[0]);

  //SHOW ALL THE SONGS
  let songUL = document
    .querySelector(".songlist")
    .getElementsByTagName("ul")[0];

  songUL.innerHTML = "";
  for (const song of songs) {
    songUL.innerHTML =
      songUL.innerHTML +
      `<li>
          <img class="invert" src="img/music.svg" alt="" />
          <div class="info">
            <div>${song.replaceAll("%20", " ")}</div>
            <div>Harry</div>
          </div>
          <div class="playnow">
            <div>Play Now</div>
            <img class="invert" src="img/play.svg" alt="" />
          </div>
        </li>`;
  }

  // play the firstsong

  // attach an event listener to each song
  Array.from(
    document.querySelector(".songlist").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      console.log(e.querySelector(".info").firstElementChild.innerHTML);
      playmusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });

  return songs;
}

async function playmusic(track, pause = false) {
  currentsong.src = `/${currfolder}/` + track;

  if (!pause) {
    currentsong.play();
    play.src = "img/pause.svg";
  }

  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}

async function displayalbums() {
  let a = await fetch(`/songs/`);
  let response = await a.text();
  console.log(response);
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("li");

  let cardContainer = document.querySelector(".cardContainer");
  // console.log(anchors)
  let lis = div.getElementsByTagName("a");
  // console.log(lis);
  // console.log(e.href)
  let array = Array.from(lis);
  for (let index = 0; index < array.length; index++) {
    const e = array[index];
    // console.log(e);

    if (e.href.includes("/songs/")) {
      // console.log(e.href);
      let folder = e.href.split("/songs/").slice(-1);
      console.log(folder);
      // get the metadata of the folder
      let a = await fetch(`/songs/${folder}/info.json`);
      let response = await a.json();
      // console.log(response);
      // console.log("/songs/${folder}/cover.jpg");
      cardContainer.innerHTML =
        cardContainer.innerHTML +
        `            <div data-folder="${folder}" class="card">
              <div class="play">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="40"
                  height="40"
                  fill="none"
                >
                  <!-- Circular background -->
                  <circle cx="12" cy="12" r="12" fill="#1fdf64" />
                  <!-- Black SVG icon -->
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="50%"
                    height="50%"
                    color="#000000"
                    fill="Black"
                    x="25%"
                    y="25%"
                  >
                    <path
                      d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linejoin="round"
                    />
                  </svg>
                </svg>
              </div>

              <img src="/songs/${folder}/cover.jpg" alt="" />
              <h2>${response.title}</h2>
              <p>${response.description}</p>
            </div>`;
    }
  }
  //load the playlist whenever card is clicked
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
      playmusic(songs[0]);
    });
  });
}

async function main() {
  await getSongs("songs/cs");
  // console.log(songs);
  playmusic(songs[0], true);

  //DISPLAY ALL THE ALBUMS ON THE PAGE
  displayalbums();

  //ATTACH AN EVENT LISTENER TO PLAY NEXT & PREVIOUS
  play.addEventListener("click", () => {
    if (currentsong.paused) {
      currentsong.play();
      play.src = "img/pause.svg";
    } else {
      currentsong.pause();
      play.src = "img/play.svg";
    }
  });

  //listen for timeupdate event
  currentsong.addEventListener("timeupdate", () => {
    // console.log(currentsong.currentTime, currentsong.duration);
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(
      currentsong.currentTime
    )}/${secondsToMinutesSeconds(currentsong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentsong.currentTime / currentsong.duration) * 100 + "%";
  });

  //add an event listener to seekbar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentsong.currentTime = (currentsong.duration * percent) / 100;
  });

  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });

  previous.addEventListener("click", () => {
    let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) {
      playmusic(songs[index - 1]);
    }
  });
  next.addEventListener("click", () => {
    let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
    let length = songs.length;
    if (index + 1 < length) {
      playmusic(songs[index + 1]);
    }
  });

  // Add an event to volume
  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      console.log("Setting volume to", e.target.value, "/ 100");
      currentsong.volume = parseInt(e.target.value) / 100;
    });

  //add event to mute the song
  document.querySelector(".volume>img").addEventListener("click", (e) => {
    // console.log(e.target.src);
    if (e.target.src.includes("img/volume.svg")) {
      e.target.src = e.target.src.replace("img/volume.svg", "img/mute.svg");
      currentsong.volume = 0;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 0;
    } else {
      currentsong.volume = 0.1;
      e.target.src = e.target.src.replace("img/mute.svg", "img/volume.svg");
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 10;
    }
  });
}

main();
