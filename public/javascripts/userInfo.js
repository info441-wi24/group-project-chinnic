async function init() {
    await loadIdentity();
    await loadUserInfo();
    document.querySelector("#search-term").addEventListener("input", searchBar);
    document.getElementById("home-btn").addEventListener("click", homeButton);
    document.getElementById("post-btn").addEventListener("click", async function () {
        try {
            const identityResponse = await fetch('api/users/myIdentity');
            const identityInfo = await identityResponse.json();

            if (identityInfo.status === "loggedin") {
                window.location.href = 'createpost.html';
            } else {
                alert("Must be logged in to create posts!")
            }
        } catch (error) {
            console.error("logging in", error)
        }
    });
    document.getElementById("chat-btn").addEventListener("click", async function () {
        try {
          const identityResponse = await fetch('api/users/myIdentity');
          const identityInfo = await identityResponse.json();

          if (identityInfo.status === "loggedin") {
            window.location.href = 'chat.html';
          } else {
            alert("Must be logged in to chat!")
          }
        } catch (error) {
          console.error("logging in", error)
        }
      });
}

async function saveUserInfo() {
    try {
        const updatedpreferredName = document.getElementById("updatedpreferredName").value;
        const updatedPronouns = document.getElementById("updatedPronouns").value;
        const updatedMajor = document.getElementById("updatedMajor").value;
        const updatedYear = document.getElementById("updatedYear").value;
        const updatedFunFact = document.getElementById("updatedFunFact").value;
        await fetchJSON(`api/userInfo`, {
            method: "POST",
            body: {
                username: myIdentity,
                preferred_name: updatedpreferredName,
                pronouns: updatedPronouns,
                major: updatedMajor,
                year: updatedYear,
                fun_fact: updatedFunFact
            },
        });

        window.location.reload();
    } catch (error) {
        console.error('Error saving user information:', error);
        document.getElementById("user_info_new_div").innerText = error;
    }
}

async function loadUserInfo() {
    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get('user');
    if (username == myIdentity) {
        document.getElementById("username-span").innerText = `You (${username})`;
        document.getElementById("user_info_new_div").classList.remove("d-none");
    } else {
        document.getElementById("username-span").innerText = username;
        document.getElementById("user_info_new_div").classList.add("d-none");
    }
    try {
        const userInfoJson = await fetchJSON(`api/userInfo?username=${encodeURIComponent(username)}`);
        console.log(userInfoJson)
        if (userInfoJson && userInfoJson.length > 0) {
            document.getElementById("preferred-name-span").innerText = userInfoJson[0].preferred_name || "No preferred name specified";
            document.getElementById("pronouns-span").innerText = userInfoJson[0].pronouns || "No pronouns specified";
            document.getElementById("major-span").innerText = userInfoJson[0].major || "No major specified";
            document.getElementById("year-span").innerText = userInfoJson[0].year || "No graduating year specified";
            document.getElementById("fun-fact-span").innerText = userInfoJson[0].fun_fact || "No fun fact specified";
        } else {
            document.getElementById("preferred-name-span").innerText = "No preferred name specified";
            document.getElementById("pronouns-span").innerText = "No pronouns specified";
            document.getElementById("major-span").innerText = "No major specified";
            document.getElementById("year-span").innerText = "No graduating year specified";
            document.getElementById("fun-fact-span").innerText = "No fun fact specified";
        }

        loadUserInfoPosts(username);
    } catch (error) {
        console.error('Error loading user information:', error);
    }
}


async function loadUserInfoPosts(username) {
    document.getElementById("user-posts-loading").innerText = "Loading...";
    let postsJson = await fetchJSON(`api/posts?username=${encodeURIComponent(username)}`);
    for (let i = 0; i < postsJson.length; i++) {
        let specificData = postsJson[i];
        let container = await postCard(specificData);
        document.getElementById("posts_box").appendChild(container);
    }
    document.getElementById("user-posts-loading").innerText = "";
}


async function deletePost(postID) {
    let responseJson = await fetchJSON(`api/posts`, {
        method: "DELETE",
        body: { postID: postID }
    })
    loadUserInfo();
}

async function searchBar(event) {
    let search = event.target.value.trim()
    if (search === "") {
        document.getElementById("search-btn").disabled = true
    } else {
        document.getElementById("search-btn").disabled = false
        document.getElementById("search-btn").addEventListener("click", searchPost)
    }
}

async function searchPost() {
    sessionStorage.setItem('searchQuery', document.getElementById("search-term").value)
    window.location.href = '/';
}

async function homeButton() {
    window.location.href = '/';
}

async function tagSearch(event) {
    sessionStorage.setItem('selectedTag', event.target.textContent.substring(1));
    window.location.href = '/';
}

function postCard(data) {
    let container = document.createElement("article")
    container.classList.add("card")
    container.id = data["id"]
  
    let username = data["name"]
    let indivName = document.createElement("p")
    indivName.classList.add("individual")
    indivName.textContent = username
    let firstDiv = document.createElement("div")
    firstDiv.appendChild(indivName)
  
    let extraInfo = document.createElement("p")
    extraInfo.classList.add("user-time")
    //debug
    if (!data["post"]) {
      data["post"] = "No post available";
    }
    let tempTime = data["created_date"];
    let currDate = new Date(tempTime);
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    };
    let formattedDate = currDate.toLocaleDateString('en-US', options)
    extraInfo.textContent = data["username"] + " posted on " + formattedDate;
    let postContent = document.createElement("p");
    let title = document.createElement("h1");
    title.textContent = data["title"];
  
    firstDiv.appendChild(title);
    postContent.textContent = data["post"];
    firstDiv.appendChild(postContent);
  
    const hashTagString = data["hashtag"][0];
    const hashTagArr = hashTagString.split(',');
    if (Array.isArray(hashTagArr) && hashTagArr.length > 0) {
      hashTagArr.map(tag => {
        allTags = document.createElement("p")
        allTags.textContent = '#' + tag.trim()
        allTags.style.fontStyle = "italic";
        allTags.style.color = "blue"
        allTags.style.display = 'inline-block'
        allTags.style.textIndent = "10px"
        allTags.addEventListener("click", tagSearch)
        firstDiv.appendChild(allTags);
      })
    }
    let likeBtn = document.createElement("button");
    likeBtn.innerHTML = "&#x2764;";
    likeBtn.classList.add("like-btn");
    likeBtn.style.borderRadius = "5px";
    likeBtn.style.border = "none";
  
    let likeCount = document.createElement("span");
    likeCount.textContent = data.likes.length + " Likes";
    likeCount.classList.add('like-count');
    likeCount.style.fontWeight = "bold";
  
    firstDiv.appendChild(likeBtn);
    firstDiv.appendChild(likeCount);
    function handleLikeButtonClick() {
      if (data["likes"].indexOf(username) === -1) {
        data["likes"].push(username);
        likeCount.textContent = data.likes.length + " Likes";
        likePost(data.id);
      } else {
        const index = data["likes"].indexOf(username);
        if (index !== -1) {
          data["likes"].splice(index, 1);
          likeCount.textContent = data.likes.length + " Likes";
          unlikePost(data.id);
        }
      }
    }
    likeBtn.addEventListener("click", handleLikeButtonClick);
    hideLikes();
    let viewPostBtn = document.createElement("button")
    viewPostBtn.classList.add("viewbtn");
    viewPostBtn.textContent = "View Post!"
    viewPostBtn.addEventListener("click", function() {
      userPost(data["id"]);
    })
    firstDiv.appendChild(extraInfo)
    firstDiv.appendChild(viewPostBtn);
    container.appendChild(firstDiv)
    return container
  }

async function userPost(postID) {
    window.location.href = `viewpost.html?id=${postID}`;
  }