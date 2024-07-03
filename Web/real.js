//:)

let currAudio = new Audio();
var audioData = []
let songinfo = document.querySelector(".songinfo")
let songduration = document.querySelector(".songduration")

//TimeFormat:
function formatTime(time) {
    if (isNaN(time) || time < 0) {
        return "00:00"
    }
    const seconds = Math.floor(time)//kyuki time 8 decimal places tk aa rha hai...rest is from gpt and yes I had encountered the same logic in my algo days:)  
    const minutes = Math.floor(seconds / 60)
    const remaining = seconds % 60;
    const formated = remaining < 10 ? '0' + remaining : remaining;
    return `${minutes}:${formated}`
}

//get all the files of given folder:
async function getSongFiles(folder) {
    let a = await fetch(`http://127.0.0.1:3000/song/${folder}/`)
    let b = await a.text()
    const dom = new DOMParser().parseFromString(b, "text/html")
    let anchors = dom.getElementsByTagName("a")

    let audioData = []
    for (const data of anchors) {
        if (data.href.endsWith("mp3")) {
            audioData.push(data.href)
        }
    }
    let location = document.querySelector(".songsList").firstElementChild
    location.innerHTML = ""
    //Now add the list in library:
    for (const song of audioData) {
        location.innerHTML = location.innerHTML + `
        <li>
        <img src="/assets/svg/music.svg" alt="">
        <div>
            ${song.split(`${folder}/`)[1].replaceAll("%20", " ")}
        </div>
        <button><img src="/assets/svg/play.svg" alt=""></button>
        </li>
        `
    }
    //event listner to all songs listed:-->here Array.foreach beacuse leave it in background and 
    Array.from(location.getElementsByTagName("li")).forEach((list, index) => {
        list.addEventListener("click", () => {//yaha element ki kya jarurat
            // let src=audioData[index]
            // playMusic(index)-->Mai ye bhi kar sakta hu since audioData is global
            playMusic(audioData[index])
        })
    })
    return audioData
}

const playMusic=(src,pause=false)=> {
    currAudio.src = src
    if (!pause) {
        currAudio.play()
        play.firstElementChild.src = "/assets/svg/pause.svg"
    }
    // songinfo.innerHTML=`${src.split("/").splice(-1).replaceAll("%20"," ")}`
    songinfo.innerHTML=`${src.split("/").pop().replaceAll("%20"," ")}`
    songduration.innerHTML="00:00"
}

//display all playlist folder(remember its a folder)
async function display() {
    let a = await fetch("http://127.0.0.1:3000/song/")
    let b = await a.text()
    const dom = new DOMParser().parseFromString(b, "text/html")
    let anchors = dom.getElementsByTagName("a")
    //fload the playlist div with folder
    // Array.from(anchors).forEach(async element => {--> I have to clear this doubt how can await for this
    for (const element of anchors) {
        if (element.href.includes("song/")) {
            // console.log(element.href.split("song/")[1])
            let folder = element.href.split("/").slice(-2)[0]
            // console.log(folder);-->last time yahi doubt tha ki kaise mai different folder name ko handle karu
            //metadata of folder:
            let a = await fetch(`http://127.0.0.1:3000/song/${folder}/info.json`)
            let b = await a.json()
            let container = document.querySelector(".playlist")
            container.innerHTML = container.innerHTML + `
            <div data-playlist="${folder}" class="template scratch">
                <div class="img">
                    <img src="/song/${folder}/cover_image.jpg" alt="photo hai">
                </div>
                <div>
                ${b.title}
                </div>
                <div>
                ${b.description}
                </div>
                <div class="playbutton">
                    <img src="/assets/svg/playbutton.svg" alt="play">
                </div>
            </div>
            `
        }
    }

    Array.from(document.getElementsByClassName("scratch")).forEach(element => {
        element.addEventListener("click", async item => {
            audioData = await getSongFiles(item.currentTarget.dataset.playlist);
            playMusic(audioData[0])
        })
    })
}

(async function main() {
    audioData=await getSongFiles("playlist1")//mera await direct kyu nahi ho rha hai...?
    playMusic(audioData[0],true)
    await display()


    currAudio.addEventListener("timeupdate", () => {
        songduration.innerHTML = `${formatTime(currAudio.currentTime)}/${formatTime(currAudio.duration)}`
        document.querySelector(".circle").style.left = (currAudio.currentTime / currAudio.duration) * 99 + "%";
    })


    play.addEventListener("click", () => {
        // if (currAudio.src) {//I know this is noob way to handle error}else{console.log("something")}
        if (currAudio.paused) {
            currAudio.play()
            //icon to pause it again
            play.firstElementChild.src = "/assets/svg/pause.svg"
        } else {
            currAudio.pause()
            //have to show the icon to play it back
            play.firstElementChild.src = "/assets/svg/play.svg"
        }
    })

    previous.addEventListener("click", () => {
        let idx = audioData.indexOf(currAudio.src)
        if (idx > 0) {
            playMusic(audioData[idx-1])
            play.firstElementChild.src = "/assets/svg/pause.svg"
        }
    })

    next.addEventListener("click", () => {
        let idx = audioData.indexOf(currAudio.src)
        if (idx+1<audioData.length) {
            playMusic(audioData[idx+1])
        }
    })


    //seekbar:
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let width = e.offsetX / e.target.getBoundingClientRect().width
        document.querySelector(".circle").style.left = width * 99 + "%"
        currAudio.currentTime = (width * currAudio.duration);
    })

    //hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })
    document.querySelector(".cancel").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-110%"
    })
    
    //volume:
    document.querySelector(".volume").getElementsByTagName("input")[0].addEventListener("change",(e)=>{
        currAudio.volume=e.target.value/100
    })
    //mute
    document.querySelector(".volume").getElementsByTagName("img")[0].addEventListener("click",(e)=>{
        if (e.target.src.includes("volume.svg")) {
            e.target.src=e.target.src.replace("volume.svg","muted.svg")
            currAudio.volume=0;
            document.querySelector(".volume").getElementsByTagName("input")[0].value=0;
        } else {
            e.target.src=e.target.src.replace("muted.svg","volume.svg")
            currAudio.volume=0.1
            document.querySelector(".volume").getElementsByTagName("input")[0].value=10;
        }
    })
})()  