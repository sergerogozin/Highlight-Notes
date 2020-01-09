let cssFont = document.createElement("link");
document.querySelector("head").appendChild(cssFont);

console.log("content script has been called");

// Listens for a message from the background file that
// is sent when a user clicks the extension's content menu option.
// The message contains either an array of objects that represent 
// tags the user has previously created or a string if no tags have 
// been made 
chrome.runtime.onMessage.addListener(gotMessage);

// Calls a function to build a pop-up window 
function gotMessage(request, sender, sendResponse) {
    buildPopUp(request);    
}

// Builds a pop-up window that allows the user to save their 
// newly created note
function buildPopUp(existingTags) {
    let cancelIcon = document.createElement("img");
    let cancelIconURL = chrome.runtime.getURL("images/cancel-icon.svg");
    cancelIcon.setAttribute("src", `${cancelIconURL}`);
    cancelIcon.classList.add("highlight-note-cancel-icon");

    let cancelHolder = document.createElement("div");
    cancelHolder.classList.add("highlight-note-cancel-holder");
    cancelHolder.appendChild(cancelIcon);

    let popUpImg = document.createElement("img");
    let popUpImgURL = chrome.runtime.getURL("images/project-logo-purple.svg");
    popUpImg.setAttribute("src", `${popUpImgURL}`);
    popUpImg.classList.add("highlight-note-save-icon");

    let textHeader = document.createElement("div");
    textHeader.classList.add("highlight-note-text-header");
    textHeader.innerHTML = `<span>Create Note?</span>`;

    let selectedText = window.getSelection().toString();
    let selectedTextContainer = document.createElement("p");
    selectedTextContainer.classList.add("highlight-note-highlight");
    selectedTextContainer.innerText = selectedText;

    let commentIcon = document.createElement("img");
    let commentURL = chrome.runtime.getURL("images/font-icon-white.svg");
    commentIcon.setAttribute("src", `${commentURL}`);
    commentIcon.classList.add("highlight-notes-comment-icon");

    let tagIcon = document.createElement("img");
    let tagURL = chrome.runtime.getURL("images/tag-icon-gray.svg");
    tagIcon.setAttribute("src", `${tagURL}`);
    tagIcon.classList.add("highlight-notes-tag-icon");

    let commentTooltip = document.createElement("div");
    commentTooltip.classList.add("highlight-notes-tooltip-left");
    commentTooltip.innerHTML = "<p>Annotate</p><div></div>"

    let tagTooltip = document.createElement("div");
    tagTooltip.classList.add("highlight-notes-tooltip-right");
    tagTooltip.innerHTML = "<p>Tag</p><div></div>"

    let commentButton = document.createElement("div");
    commentButton.classList.add("highlight-notes-options-button");
    commentButton.classList.add("highlight-notes-button-clicked");
    commentButton.setAttribute("id", "comment-button");
    commentButton.appendChild(commentIcon);
    commentButton.appendChild(commentTooltip);

    let tagButton = document.createElement("div");
    tagButton.classList.add("highlight-notes-options-button");
    tagButton.setAttribute("id", "tag-button");
    tagButton.appendChild(tagIcon);
    tagButton.appendChild(tagTooltip);

    for (let button of [commentButton, tagButton]) {
        button.addEventListener("mouseover", showTooltip);
        button.addEventListener("mouseleave", hideTooltip);
        button.addEventListener("click", toggleTab);
    }

    let optionsContainer = document.createElement("div");
    optionsContainer.classList.add("highlight-notes-options-container");
    optionsContainer.appendChild(commentButton);
    optionsContainer.appendChild(tagButton);

    let comment = document.createElement("textarea");
    comment.classList.add("highlight-notes-comment-section");
    comment.classList.add("highlight-notes-show-tab");
    comment.setAttribute("placeholder", "Enter your thoughts here...");
    
    let tagContainer = document.createElement("div");
    tagContainer.classList.add("highlight-notes-tag-container");

    if (existingTags !== "No tags") {
        for (let tag of existingTags) {
            let tagText = document.createElement("p");
            tagText.innerText = `${tag.tagName}`;
            
            let tagBody = document.createElement("div");
            tagBody.style.backgroundColor = `${tag.tagColor}`;
            tagBody.classList.add("highlight-notes-tag");
            tagBody.addEventListener("click", toggleTag);

            tagBody.appendChild(tagText);
            tagContainer.appendChild(tagBody)
            
        }
    } else {
        let backUpText = document.createElement("p");
        backUpText.innerText = "Looks like no tags have been created yet! Click the purple highlighter in the browser's toolbar to go over to the home page and make some.";
        backUpText.classList.add("highlight-note-error-text");
        tagContainer.appendChild(backUpText);
    }

    let tabContainer = document.createElement("div");
    tabContainer.classList.add("highlight-notes-tab-container");
    tabContainer.appendChild(comment);
    tabContainer.appendChild(tagContainer);

    let buttonHolder = document.createElement("div");
    buttonHolder.classList.add("highlight-note-button-holder");

    let affirmativeText = document.createElement("p");
    affirmativeText.innerText = "Create Note"
    let affirmativeButton = document.createElement("div");
    affirmativeButton.appendChild(affirmativeText);
    affirmativeButton.classList.add("highlight-note-button");
    affirmativeButton.classList.add("highlight-note-affirmative-button");
    affirmativeButton.addEventListener("click", submitNote);

    let cancelText = document.createElement("p");
    cancelText.innerText = "Cancel";
    let cancelButton = document.createElement("div");
    cancelButton.appendChild(cancelText);
    cancelButton.classList.add("highlight-note-button");
    cancelButton.classList.add("highlight-note-cancel-button");

    buttonHolder.appendChild(affirmativeButton);
    buttonHolder.appendChild(cancelButton); 

    let popUp = document.createElement("div");
    popUp.classList.add("highlight-note-pop-up");
    popUp.appendChild(cancelHolder);
    popUp.appendChild(popUpImg);
    popUp.appendChild(textHeader);
    popUp.appendChild(selectedTextContainer);
    popUp.appendChild(optionsContainer);
    popUp.appendChild(tabContainer);
    popUp.appendChild(buttonHolder);
    
    let screen = document.createElement("div");
    screen.setAttribute("id", "highlight-notes-pop-up-screen");
    screen.classList.add("highlight-note-screen");
    screen.addEventListener("click", removePopUp);

    screen.appendChild(popUp);
    document.querySelector("body").appendChild(screen);
    
}

// Removes the pop-up window from the page
function removePopUp(event) {
    if (event.target.classList.contains("highlight-note-cancel-button") ||
    event.target.classList.contains("highlight-note-cancel-icon") || 
    event.target.classList.contains("highlight-note-screen") ||
    event.target.classList.contains("highlight-note-submit")) {
        let background = document.querySelector("#highlight-notes-pop-up-screen");
        let popUp = document.querySelector(".highlight-note-pop-up");
        background.style.animation = "darkScreenGone .3s forwards";
        popUp.style.animation = "popUpGone .2s forwards";
        setTimeout(function() {background.parentNode.removeChild(background);}, 300);
    }
}

// Sends an object containing info about the newly created note to the background page, 
// adds a class to the affirmative button for the removePopUp function to work, and 
// calls the function to remove the window
function submitNote(event) {
    let tags = [];
    let selectedTags = document.querySelectorAll(".highlight-notes-tag-selected p");
    if (selectedTags.length !== 0) {
        for (let tag of selectedTags) {
            tags.push(tag.innerText);
        }
    }
    chrome.runtime.sendMessage({ 
        "highlightText": document.querySelector(".highlight-note-highlight").innerText,
        "timestamp": Date.now(),
        "dateCreated": Date(),
        "url": window.location.href,
        "websiteName": window.location.hostname,
        "notes": document.querySelector(".highlight-notes-comment-section").value,
        "tags": tags,
        "favorite": false,
        "archived": false,
        "deleted": false,
    });

    document.querySelector(".highlight-note-affirmative-button").classList.add("highlight-note-submit");
    document.querySelector(".highlight-note-affirmative-button p").classList.add("highlight-note-submit");
    removePopUp(event);
}

// Reveals the tooltip of the edit button
function showTooltip(event) {
    let element = event.target;
    while (!element.classList.contains("highlight-notes-options-button")) {
        element = element.parentNode;
    }
    element.childNodes[1].classList.add("highlight-notes-show-tooltip")
}

// Hides the tooltip of the edit button
function hideTooltip(event) {
    let element = event.target;
    while (!element.classList.contains("highlight-notes-options-button")) {
        element = element.parentNode;
    }
    element.childNodes[1].classList.remove("highlight-notes-show-tooltip")    
}

function toggleTab(event) {
    let element = event.target;
    while (!element.classList.contains("highlight-notes-options-button")) {
        element = element.parentNode;
    }
    if (!element.classList.contains("highlight-notes-button-clicked")) {
        if (element.getAttribute("id") === "tag-button") {
            document.querySelector("#comment-button").classList.remove("highlight-notes-button-clicked");
            let commentURL = chrome.runtime.getURL("images/font-icon-gray.svg");
            document.querySelector("#comment-button img").setAttribute("src", `${commentURL}`);
            document.querySelector(".highlight-notes-comment-section").classList.remove("highlight-notes-show-tab");
            
            document.querySelector(".highlight-notes-tag-container").classList.add("highlight-notes-show-tab");
            let tagURL = chrome.runtime.getURL("images/tag-icon-white.svg");
            document.querySelector("#tag-button img").setAttribute("src", `${tagURL}`);
            
        } else {
            document.querySelector("#tag-button").classList.remove("highlight-notes-button-clicked");
            let tagURL = chrome.runtime.getURL("images/tag-icon-gray.svg");
            document.querySelector("#tag-button img").setAttribute("src", `${tagURL}`);
            
            let commentURL = chrome.runtime.getURL("images/font-icon-white.svg");
            document.querySelector("#comment-button img").setAttribute("src", `${commentURL}`);
            document.querySelector(".highlight-notes-tag-container").classList.remove("highlight-notes-show-tab");
            document.querySelector(".highlight-notes-comment-section").classList.add("highlight-notes-show-tab");
        }
        element.classList.add("highlight-notes-button-clicked");
    }
}

// Adds or removes a class that controls the brightness of the background color
// creating a selected/deselected effect
function toggleTag(event) {
    let element = event.target;
    while (!element.classList.contains("highlight-notes-tag")) {
        element = element.parentNode;
    }
    if (element.classList.contains("highlight-notes-tag-selected")) {
        element.classList.remove("highlight-notes-tag-selected");
    } else {
        element.classList.add("highlight-notes-tag-selected");
    }
}























































