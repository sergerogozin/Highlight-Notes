chrome.storage.sync.get(["tags","notes"], function(memoryObject) { 
    // If there are previously-created notes, thumbnails representing
    // the notes are created, the latest one is selected and used 
    // to populate the form in the right column 
    if (memoryObject.notes) {
        let counter = 0;
        for (let note of memoryObject.notes.reverse()) {
            createPreview(note);   //hide the deleted an archived
            if (!note.deleted) {
                counter++;
            } 
        }
        if (counter <= 99) {
            document.querySelector("#main-tag input").setAttribute("value", `${counter}`);    
        } else {
            document.querySelector("#main-tag input").setAttribute("value", `+99`); 
        }

        for (let preview of document.querySelectorAll("#review-list li")) {
            if (!preview.classList.contains("deleted")) {
                preview.dispatchEvent(new Event("click"));
                break;
            }
        }
        document.querySelector("#note").classList.remove("hide-form"); 
    }
    // If there are previously-created tags, list items representing
    // them are built and added to the left column     
    if (memoryObject.tags) {
        for (let tag of memoryObject.tags) {
            createTag(tag);
        } 
    }
})
document.querySelector("body").style.opacity="1";

// Left column
window.addEventListener("resize", originalSideBar);
document.querySelector("#edit-dot-container").addEventListener("click", toggleMainEditIcon);
document.querySelector("#expand-button").addEventListener("click", toggleSideBar);
document.querySelector("header").addEventListener("click", selectMainTag);
document.querySelector("#tag-list").addEventListener("scroll", adjustDropdownMenu);
document.querySelector("#add-label").addEventListener("keyup", submitNewTag);
document.querySelector("#add-label").addEventListener("click", function(event) { event.stopPropagation(); haltEditing();})
for (let item of document.querySelectorAll("#folders-list li")) {
    item.addEventListener("click", selectTag);
}

// Middle column
document.querySelector('[type="search"]').addEventListener("keyup", searchPreviews);
document.querySelector("#preview-filter").addEventListener("click", filterPreviews); 

// Right column
document.querySelector("#note-title").addEventListener("keyup", function() {
    updateNoteObject("title", document.querySelector("#note-title").value);
    updatePreviewTitle(document.querySelector("#note-title").value);
})
document.querySelector("#save-button").addEventListener("click", function() {
    updateNoteObject("notes", document.querySelector("#note-comment").value);
    saveAnimation();
})
for (let noteIcon of document.querySelectorAll("#note-icons *")) {
    noteIcon.addEventListener("click", updateNoteStatus);
}


/*----------------------------SIDEBAR/LEFT COLUMN----------------------------------*/

// Takes an object as an argument that contains info about a tag 
// (name, number of highlights associated with it and its color),
// constructs a list item displaying all of this info, and then
// adds this list to the bottom of the unordered list of the sidebar menu
function createTag(tagObject) {
    let colorNode = document.createElement("div");                  //The following block creates the tag's circle
    colorNode.classList.add("tag-color");                       
    colorNode.style.backgroundColor = tagObject.tagColor;

    let textNode = document.createElement("input");                 //The following block creates the 
    textNode.setAttribute("value", String(tagObject.tagName));      //tag name part of the tag 
    textNode.setAttribute("disabled", true);
    textNode.setAttribute("maxlength", "17");
    
    let deletedCounter = 0;
    if (document.querySelector(".deleted")) {                       // Counts how many "deleted" notes have this 
        for (let preview of document.querySelectorAll(".deleted")) {// tag so the total number could be adjusted
            for (let previewTag of preview.querySelectorAll(".preview-tag")) {
                if (previewTag.innerText === tagObject.tagName) {
                    deletedCounter++;
                    break;
                }
            }
        }
    }

    let numberNode = document.createElement("input");               //The following block creates
    numberNode.classList.add("tag-number")                          //the number part of the tag
    numberNode.setAttribute("value", String(tagObject.tagNumber - deletedCounter)); 
    numberNode.setAttribute("disabled", true);

    let gearIcon = document.createElement("img");                   //The following block creates the 
    gearIcon.setAttribute("src", "images/gear-icon.svg");                  //gear icon that is hidden behind         
    gearIcon.classList.add("tag-gear-icon");                        //the number tag
    gearIcon.addEventListener("click", toggleDropdownMenu);
    
    let tag = document.createElement('div');                        //The following block creates a
    tag.classList.add('tag-section');                               //div that holds all the elements
    tag.appendChild(colorNode);                                     
    tag.appendChild(textNode);                           
    tag.appendChild(numberNode);
    tag.appendChild(gearIcon);

    let listItem = document.createElement("li"); 
    listItem.classList.add("tag");                                  //Allows to separate from other li elements on this page
    listItem.appendChild(tag);
    listItem.appendChild(createEditMenu());
    listItem.addEventListener("click", selectTag)
    
    document.querySelector("#tag-list").appendChild(listItem);

    if(checkListHeight() && !document.querySelector("#tag-list").classList.contains("list-overflow")) {
        document.querySelector("#tag-list").classList.add("list-overflow");
    }
}

// Creates the tag's dropdown menu
function createEditMenu() {
    let editOptionsContainer = document.createElement("div");
    editOptionsContainer.classList.add("edit-options-container");
    editOptionsContainer.classList.add("edit-options-container-hidden");
    let options = ["Color", "Rename", "Delete"];
    for (let x = 0; x < 3; x++) {
        let optionHolder = document.createElement("p");
        optionHolder.addEventListener("click", optionClicked);
        optionHolder.classList.add("edit-option-par");
        optionHolder.innerText = options[x];

        let optionDiv = document.createElement("div");
        optionDiv.appendChild(optionHolder);

        editOptionsContainer.appendChild(optionDiv);
    }
    return editOptionsContainer;
}

// Once the "Add Tag" field is populated and the user has clicked "Enter",
// a new tag object is created and added to the chrome's storage and the 
// function responsible for the creation of a new tag element in the left column is called    
function submitNewTag(event) {    
    document.querySelector("#tag-warning").classList.add("hide-warning");
    if (event.keyCode === 13 && document.querySelector("#add-label").value) {
        chrome.storage.sync.get("tags", function(memoryObject) {
            let existingColors = ["rgb(164, 150, 243)", "rgb(125, 105, 238)"]; // the two purple theme colors used in the left column
            let existingTitles = [];
            let newTitle = document.querySelector("#add-label").value;
            if (memoryObject.tags) {
                for (let tag of memoryObject.tags) {
                    existingColors.push(tag.tagColor);
                    existingTitles.push(tag.tagName);
                }
            } else {
                memoryObject.tags = [];
            }
            if (existingTitles.indexOf(newTitle) === -1) {
                let newColor = `rgb(${Math.floor(Math.random() * 251)}, ${Math.floor(Math.random() * 251)}, ${Math.floor(Math.random() * 251)})`;
                while (existingColors.indexOf(newColor) !== -1) {
                    newColor = `rgb(${Math.floor(Math.random() * 251)}, ${Math.floor(Math.random() * 251)}, ${Math.floor(Math.random() * 251)})`;
                }
                let tagObject = {
                    tagName: newTitle,
                    tagNumber: 0,
                    tagColor: newColor
                }
                memoryObject.tags.push( {"tagName": tagObject.tagName, "tagNumber": tagObject.tagNumber, "tagColor": tagObject.tagColor})
                chrome.storage.sync.set( {"tags": memoryObject.tags});
                createTag(tagObject);
                document.querySelector("#add-label").value = ""; 
                document.querySelector("#note-form-add-button").classList.remove("disabled-button");
            } else {
                document.querySelector("#tag-warning").classList.remove("hide-warning");
            }   
        })
    }
} 

// Takes an event as an argument and climbs up
// the DOM tree until it gets to the "main" tag 
// at the top of the page. If the "main" tag is not selected,
// the rest of the tags are deselected and the "main" tag is selected. 
function selectMainTag(event) {                     
    let element = event.target;
    while (element.id !== "main-tag") {   
        element = element.parentNode;         
    }
    if (!element.classList.contains("selected-tag")) {
        deselectTags();
        haltEditing();
        element.classList.add("selected-tag");
        element.classList.add("selected-tag-div")
        searchPreviews();
    }    
}

// Takes an event as an argument and climbs up
// the DOM tree until it gets to an li element,
// then the li is checked whether it is already selected/highlighted. 
// If not, deselectTags is called to unselect all other li, the li is 
// highlighted and "edit menu" is displayed. 
function selectTag(event) {
    if (!event.target.classList.contains("tag-gear-icon")) {
        hideAllDropdowns();
    }
    if (!(event.target.className === "options-li" || event.target.className === "options-ul")) { //Makes sure that the function is not executed when                                                                
        let element = event.target;                                                              //the tag's edit menu's li elements are clicked    
        while (element.localName !== "li") {
            element = element.parentNode;                       
        }                                                       
        if (!element.classList.contains("selected-tag")) {
            deselectTags();
            element.classList.add("selected-tag");
            if (element.parentNode.id === "folders-list") {
                element.classList.add("selected-tag-div");
                haltEditing();
            } else {
                element.childNodes[0].classList.add("selected-tag-div");
            }
            searchPreviews();                              
        }
    } 
}

// Goes through all of the folders/tags and removes the class that 
// marks it as the "selected" one
function deselectTags() {
    let selectedTag = document.querySelector(".selected-tag");
    if (selectedTag) {
        console.log(selectedTag);
        if (selectedTag.getAttribute("id") === "main-tag" || selectedTag.parentNode.getAttribute("id") === "folders-list") {
            selectedTag.classList.remove("selected-tag");
            selectedTag.classList.remove("selected-tag-div");
        } else {
            selectedTag.classList.remove("selected-tag");
            selectedTag.childNodes[0].classList.remove("selected-tag-div");
            if (selectedTag.childNodes[1].classList.contains("menu-opened")) {

            }
        }
    }
}

// "Opens" or "closes" the three-dot icon in the left column 
// and triggers the function that is responsible for hiding/showing
// the gear icons
function toggleMainEditIcon(event) {
    let element = event.target;
    while (element.getAttribute("id") !== "edit-dot-container") {
        element = element.parentNode
    }
    toggleTagCounters();
    if (element.classList.contains("edit-menu-has-been-clicked")) {
        element.classList.remove("edit-menu-has-been-clicked");
        element.style.animation = "closeEditMenu .6s forwards";
        if (document.querySelector(".gear-clicked")) {
            hideAllDropdowns();
        }
    } else {
        element.classList.add("edit-menu-has-been-clicked");
        element.style.animation = "openEditMenu .6s forwards";
    }
}

// Goes through all of the tags and either hides or shows 
// the tags' gear icons depending on their current state
function toggleTagCounters() {
    let tags = document.querySelectorAll("#tag-list li");
    let editStatus = document.querySelector(".edit-menu-has-been-clicked");
    if (editStatus) {
        for (let tag of tags) {
            tag.childNodes[0].childNodes[2].style.animation = "moveNumberRight .5s forwards";
        }
    } else {
        for (let tag of tags) {
            tag.childNodes[0].childNodes[2].style.animation = "moveNumberLeft .5s forwards";
        }
    }    
}

// The three-dot icon and tag counters are moved back in 
// place and the function responsible for hiding tags' dropdown 
// menus is called to prevent the user from editing the existing tags 
function haltEditing() {
    let editMenu = document.querySelector(".edit-menu-has-been-clicked");
    if (editMenu) {
        editMenu.classList.remove("edit-menu-has-been-clicked");
        editMenu.style.animation = "closeEditMenu .6s forwards";
        //hideGears(document.querySelectorAll("#tag-list li"));
        for (let tag of document.querySelectorAll("#tag-list li")) {
            tag.childNodes[0].childNodes[2].style.animation = "moveNumberRight .5s forwards";
        }
        hideAllDropdowns();
    }
}

// Either hides or shows the tag's dropdown menu which allows to
// edit the tag's color, title or even delete it 
function toggleDropdownMenu(event) {
    let gearIcon = event.target;
    if (gearIcon === document.querySelector(".gear-clicked")) {
        gearIcon.parentNode.parentNode.childNodes[1].classList.add("edit-options-container-hidden");
        gearIcon.classList.remove("gear-clicked");
    } else {
        hideAllDropdowns()
        let rect = gearIcon.getBoundingClientRect();
        gearIcon.parentNode.parentNode.childNodes[1].style.top = `${rect.y + 20}px`
        gearIcon.parentNode.parentNode.childNodes[1].style.left = `${rect.left - 28}px`
        gearIcon.parentNode.parentNode.childNodes[1].classList.remove("edit-options-container-hidden");
        gearIcon.classList.add("gear-clicked");
    }    
}

// Adjusts the vertical position of the opened dropdown menu
// unless the gear icon of the opened dropdown menu is hidden
// from sight (due to scroll). In that case, the gear icon serves as
// the source of a click event (to trigger a function that would close the dropdown) 
function adjustDropdownMenu() {
    if (document.querySelector(".gear-clicked")) {
        let gearIcon = document.querySelector(".gear-clicked");
        let gearIconBox = gearIcon.getBoundingClientRect();
        let tagListBox = document.querySelector("#tag-list").getBoundingClientRect();

        if (gearIconBox.bottom <= tagListBox.top || gearIconBox.bottom >= tagListBox.bottom) {
            gearIcon.dispatchEvent(new Event("click"));
        } else {
            gearIcon.parentNode.parentNode.childNodes[1].style.top = `${gearIconBox.y + 20}px`;
            gearIcon.parentNode.parentNode.childNodes[1].style.left = `${gearIconBox.left - 28}px`;
        }
    }
}

// Hides all open dropdown menus
function hideAllDropdowns() {
    let tagMenus = document.querySelectorAll(".edit-options-container");
    for (let menu of tagMenus) {
        if (!menu.classList.contains("edit-options-container-hidden")) {
            menu.classList.add("edit-options-container-hidden");
            menu.parentNode.childNodes[0].childNodes[3].classList.remove("gear-clicked");
        }
    }    
}

//chrome.storage.sync.clear()

function checkListHeight() {
    let listHeight = document.querySelector("#tag-list").clientHeight;
    let pageHight = document.querySelector("body").clientHeight;

    return listHeight > pageHight * 0.5;
}

// Determines what the user wants to edit and calls the appropriate function
function optionClicked(event) {
    if (event.target.innerText === "Rename") {
        createRenameWindow(event)
    } else if (event.target.innerText === "Delete") {
        createDeleteWindow(event);
    } else if (event.target.innerText === "Color") {
        createChangeColorWindow(event);
    }
}

function createRenameWindow(event) {
    let element = event.target;
    while (!element.classList.contains("tag")) {
        element = element.parentNode;
    } 
    let name = document.querySelector(".selected-tag-div").childNodes[1].value;  

    let darkScreen = buildTopOfPopUp("pencil-icon.svg", "Rename Tag");

    let bodyCaption = document.createElement("p");
    bodyCaption.classList.add("pop-up-text");
    bodyCaption.innerHTML = `What should the new title of <span>${name}</span> be?`;

    let inputBox = document.createElement("input");
    inputBox.classList.add("rename-input");
    inputBox.setAttribute("value", `${name}`);
    inputBox.setAttribute("maxlength", "17");
    inputBox.addEventListener("keyup", checkInput);

    let buttonHolder = buildButtons("Save", "Cancel");
    buttonHolder.style.position = "relative";
    let warningPhrase = document.createElement("span");
    warningPhrase.innerText = "A tag with this title already exists!"
    warningPhrase.classList.add("warning-phrase");
    warningPhrase.classList.add("hide-warning");
    buttonHolder.appendChild(warningPhrase);
    
    let popUp = darkScreen.childNodes[0];
    popUp.appendChild(bodyCaption);
    popUp.appendChild(inputBox);
    popUp.appendChild(buttonHolder);

    document.querySelector("body").prepend(darkScreen);
    darkScreen.addEventListener("click", removePopUp);
    document.querySelector(".affirmative-button").classList.add("disabled-button");
    inputBox.select();

    document.querySelector(".affirmative-button").addEventListener("click", function(event) {
        renameTags(event, name, inputBox.value);
    });
}

// Finds all instances of the given tag on a page and updates its title,
// then saves the changes to chrome storage and calls a function
// to close the pop-up window 
function renameTags(event, oldName, newName) {
    if (!event.target.classList.contains("disabled-button")) {
        for (let sideBarTag of document.querySelectorAll(".tag")) {
            if (sideBarTag.childNodes[0].childNodes[1].value === oldName) {
                sideBarTag.childNodes[0].childNodes[1].value = newName;
           }
        }
       for (let previewEntry of document.querySelectorAll(".preview-entry")) {
           for (let previewTag of previewEntry.childNodes[2].childNodes) {
               if (previewTag.innerText === oldName) {
                previewTag.innerText = newName;
               }
           }
        }
       for (let formEntryTag of document.querySelectorAll(".note-tag")) {
           if (formEntryTag.childNodes[0].innerText === oldName) {
            formEntryTag.childNodes[0].innerText = newName;
           }
        }
        chrome.storage.sync.get(["tags", "notes"], function(memoryObject) {
           for (let tagObject of memoryObject.tags) {
               if (tagObject.tagName === oldName) {
                   tagObject.tagName = newName;
               }
           }
           for (let note of memoryObject.notes) {
                let index = note.tags.indexOf(oldName);
                if (index !== -1) {
                    note.tags[index] = newName;
                }
           }
           chrome.storage.sync.set({"tags": memoryObject.tags, "notes": memoryObject.notes});
           event.target.classList.add("ok-to-close");
           removePopUp(event);
       })
    }
}

// Removes the pop-up window from the page
function removePopUp(event) {
    if (event.target.classList.contains("dark-screen") ||
    event.target.classList.contains("cancel-icon") || 
    event.target.classList.contains("cancel-button") ||
    event.target.classList.contains("ok-to-close")) {
        let background = document.querySelector(".dark-screen");
        let popUp = document.querySelector(".pop-up");
        background.style.animation = "darkScreenGone .3s forwards";
        popUp.style.animation = "popUpGone .2s forwards";
        setTimeout(function() {background.parentNode.removeChild(background);}, 300);
    }
}

// Makes sure the title provided by the user does not already exist,
// If it does, displays a notification informing the user about the need to 
// provide a different title
function checkInput(event) {
    let existingTags = document.querySelectorAll(".tag-section");
    let existingTagTitles = [];
    for (let tag of existingTags) {
        existingTagTitles.push(tag.childNodes[1].value); 
    }
    if (event.target.value === event.target.getAttribute("value") ) {
        document.querySelector(".affirmative-button").classList.add("disabled-button");
    } else if (existingTagTitles.indexOf(event.target.value) !== -1) {
        document.querySelector(".affirmative-button").classList.add("disabled-button");
        document.querySelector(".warning-phrase").classList.remove("hide-warning");
    } else {
        if (document.querySelector(".affirmative-button").classList.contains("disabled-button")) {
            document.querySelector(".affirmative-button").classList.remove("disabled-button");
            document.querySelector(".warning-phrase").classList.add("hide-warning");
        }
    }
}

function createDeleteWindow(event) {
    element = event.target;
    while (!element.classList.contains("tag")) {
        element = element.parentNode;
    }
    let name = document.querySelector(".selected-tag-div").childNodes[1].value; 
    
    let darkScreen = buildTopOfPopUp("trash-can.svg", "Delete Tag"); 
    
    let textBody = document.createElement("div");
    textBody.classList.add("pop-up-text");
    textBody.innerHTML=`Are you sure you want to delete the<br>tag named <span>${name}</span>?`;

    let buttonHolder = buildButtons("Yes, delete this tag", "Cancel, keep this tag");

    let popUp = darkScreen.childNodes[0];
    popUp.appendChild(textBody);
    popUp.appendChild(buttonHolder);

    document.querySelector("body").prepend(darkScreen);
    darkScreen.addEventListener("click", removePopUp);
    document.querySelector(".affirmative-button").addEventListener("click", function() {deleteTags(name, event)});
}

// Removes all instances of a tag from the page, deletes it from 
// chrome storage's list of existing tags and every note's list of tags,
// and calls a function to remove the pop-up window 
function deleteTags(title, event) {
    for (let sideBarTag of document.querySelectorAll(".tag")) {
        if (sideBarTag.childNodes[0].childNodes[1].value === title) {
            sideBarTag.parentNode.removeChild(sideBarTag);
            break;
        }
    }
    for (let previewEntry of document.querySelectorAll(".preview-entry")) {
        for (let previewTag of previewEntry.childNodes[2].childNodes) {
           if (previewTag.innerText === title) {
                previewTag.parentNode.removeChild(previewTag);
                break;
            }    
        }
    }
    for (let formEntryTag of document.querySelectorAll(".note-tag")) {
        if (formEntryTag.childNodes[0].innerText === title) {
            formEntryTag.parentNode.removeChild(formEntryTag);
        }
    }
    chrome.storage.sync.get(["tags", "notes"], function(memoryObject) {
        memoryObject.tags = memoryObject.tags.filter( a => a.tagName !== title);
        
        for (let note of memoryObject.notes) {
             let index = note.tags.indexOf(title);
             if (index !== -1) {
                 note.tags = note.tags.filter( a => a !== title);
             }
        }
        chrome.storage.sync.set({"tags": memoryObject.tags, "notes": memoryObject.notes});
        event.target.classList.add("ok-to-close");
        removePopUp(event);
    })
}


function createChangeColorWindow(event) {
    element = event.target;
    while (!element.classList.contains("tag")) {
        element = element.parentNode;
    }
    let circleColor = element.childNodes[0].childNodes[0].style.backgroundColor;

    let darkScreen = buildTopOfPopUp("paint-brush.svg", "Update Color");
    darkScreen.addEventListener("click", removePopUp);  

    let body = document.createElement("div");
    body.classList.add("body");
    
    let newColorsContainer = document.createElement('div');
    newColorsContainer.classList.add("new-colors-container");
    for (let x = 0; x < 2; x++) {
        let row = document.createElement("div");
        row.classList.add("row");
        for (let y = 0; y < 5; y ++) {
            let generatedColorCircle = document.createElement("div");
            generatedColorCircle.classList.add("generated-color");
            generatedColorCircle.addEventListener("click", selectColorOption);
            row.appendChild(generatedColorCircle);
        }
        newColorsContainer.appendChild(row);
    }
    body.appendChild(newColorsContainer);

    let controlsContainer = document.createElement("div");

    let currentColorCircle = document.createElement("div");
    currentColorCircle.classList.add("current-color");
    currentColorCircle.style.backgroundColor = circleColor;
    
    let arrows = document.createElement("img");
    arrows.setAttribute("src", "images/refresh-icon.svg");
    arrows.setAttribute("height", "15px");

    let refreshButton = document.createElement("div");
    refreshButton.classList.add("refresh-button");
    refreshButton.appendChild(arrows);
    refreshButton.addEventListener("click", function(event) {
        if (document.querySelector(".selected-new-color")) {
            document.querySelector(".selected-new-color").classList.remove("selected-new-color");
        }
        generateColors();
    })

    let leftColumn = document.createElement("div");
    leftColumn.classList.add("column");
    leftColumn.appendChild(currentColorCircle);
    leftColumn.appendChild(refreshButton);
    
    let topCaption = document.createElement("p");
    topCaption.innerText = "Current";
    let bottomCaption = document.createElement("p");
    bottomCaption.innerText = "Refresh";

    let rightColumn = document.createElement("div");
    rightColumn.classList.add("column");
    rightColumn.appendChild(topCaption);
    rightColumn.appendChild(bottomCaption);

    controlsContainer.appendChild(leftColumn);
    controlsContainer.appendChild(rightColumn);
    controlsContainer.classList.add("controls-container");

    body.appendChild(controlsContainer);

    let buttonHolder = buildButtons("Yes, update the color ", "No, keep the old one");

    let popUp = darkScreen.childNodes[0];
    popUp.appendChild(body);
    popUp.appendChild(buttonHolder);

    document.querySelector("body").prepend(darkScreen);
    document.querySelector(".affirmative-button").classList.add("disabled-button");
    document.querySelector(".affirmative-button").addEventListener("click", function(event) {
        updateTagColors(event, circleColor);
    })

    generateColors();
}

// Attaches a class that inflates the selected color option and deselects 
// all others, then removes the class that disables the submit button
function selectColorOption(event) {
    if (event.target.classList.contains("selected-new-color")) {
        event.target.classList.remove("selected-new-color");
        document.querySelector(".affirmative-button").classList.add("disabled-button");
    } else {
        for (let circle of document.querySelectorAll(".generated-color")) {
            circle.classList.remove("selected-new-color");
        }
        event.target.classList.add("selected-new-color");
        document.querySelector(".affirmative-button").classList.remove("disabled-button");
    }
}

// Generates a set of unique colors for the user to choose from
function generateColors() {
    let circles = document.querySelectorAll(".generated-color");
    chrome.storage.sync.get("tags", function(memoryObject) {
        let color = ""
        let newColors = [];
        let tagColors = ["rgb(164, 150, 243)", "rgb(125, 105, 238)"]; // The two purple theme colors
        for (let tag of memoryObject.tags) {
            tagColors.push(tag.tagColor);
        }
        for (let x = 0; x < 10; x++) {
            do {
                color = `rgb(${Math.floor(Math.random() * 251)}, ${Math.floor(Math.random() * 251)}, ${Math.floor(Math.random() * 251)})`;
            } while (newColors.includes(color) || tagColors.includes(color));
            newColors.push(color);
            circles[x].style.backgroundColor = color;
        }  
    })
}

// Finds and updates the color of all instances of a tag on the page 
// and commits the color change to chrome storage, then calls a function
// to remove the pop-up window 
function updateTagColors(event, currentColor) {
    if (!event.target.classList.contains("disabled-button")) {
        let newColor = document.querySelector(".selected-new-color").style.backgroundColor;
        for (let sideBarTag of document.querySelectorAll(".tag")) {
            if (sideBarTag.childNodes[0].childNodes[0].style.backgroundColor === currentColor) {
                sideBarTag.childNodes[0].childNodes[0].style.backgroundColor = newColor;
                break;
            }
        }
        for (let previewEntry of document.querySelectorAll(".preview-entry")) {
            for (let previewTag of previewEntry.childNodes[2].childNodes) {
                if (previewTag.style.backgroundColor === currentColor) {
                    previewTag.style.backgroundColor = newColor;
                    break;
                }    
            }
        }
        for (let formEntryTag of document.querySelectorAll(".note-tag")) {
            if (formEntryTag.style.backgroundColor === currentColor) {
                formEntryTag.style.backgroundColor = newColor;
                break;
            }
        }
        chrome.storage.sync.get("tags", function(memoryObject) {
            for (let tag of memoryObject.tags) {
                if (tag.tagColor === currentColor) {
                    tag.tagColor = newColor;
                    break;
                }
            }
            chrome.storage.sync.set({"tags": memoryObject.tags});
            document.querySelector(".affirmative-button").classList.add("ok-to-close");
            removePopUp(event);
        })
    }
}

// Creates the dark background that holds the pop-up window 
// and the portion of the pop-up window that every pop-up window shares
function buildTopOfPopUp(icon, text) {
    //Creates the dark screen that sits on top of the website's content
    let darkScreen = document.createElement("div");
    darkScreen.classList.add("dark-screen");
    
    //Creates the actual pop-up box
    let popUp = document.createElement("div");
    popUp.classList.add("pop-up");
    
    //Creates the container that holds the cancel icon
    let cancelHolder = document.createElement("div");
    cancelHolder.classList.add("cancel-holder");

    //Creates the cancel icon
    let cancelIcon = document.createElement("img");
    cancelIcon.setAttribute("src", "images/cancel-icon.svg");
    cancelIcon.classList.add("cancel-icon");

    cancelHolder.appendChild(cancelIcon);
    
    //Creates the pop-up's "theme" image 
    let image = document.createElement("img");
    image.setAttribute("src", `images/${icon}`);
    image.classList.add("pop-up-image");

    //Adds the title of the pop-up
    let textHeader = document.createElement("div");
    textHeader.classList.add("pop-up-header");
    textHeader.innerHTML = `<span>${text}</span>`;
    
    popUp.appendChild(cancelHolder);
    popUp.appendChild(image);
    popUp.appendChild(textHeader);
    darkScreen.appendChild(popUp);

    return darkScreen;
}

// Creates the "accept" and "cancel" buttons for the pop-up window
function buildButtons(yes, no) {
    let buttonHolder = document.createElement("div");
    buttonHolder.classList.add("button-holder");

    let affirmativeText = document.createTextNode(yes);
    let affirmativeButton = document.createElement("div");
    affirmativeButton.appendChild(affirmativeText);
    affirmativeButton.classList.add("button");
    affirmativeButton.classList.add("affirmative-button");


    let cancelText = document.createTextNode(no);
    let cancelButton = document.createElement("div");
    cancelButton.appendChild(cancelText);
    cancelButton.classList.add("button");
    cancelButton.classList.add("cancel-button");


    buttonHolder.appendChild(affirmativeButton);
    buttonHolder.appendChild(cancelButton); 

    return buttonHolder;
}

// Either opens or closes the sidebar (left column) depending on the current state
// of the button that calls this function when clicked
function toggleSideBar() {
    if (!document.querySelector("#expand-button").classList.contains("sidebar-opened")) {

        document.querySelector("#sidebar").classList.add("expand-sidebar");
        document.querySelector("#sidebar").classList.remove("hide-sidebar");

        document.querySelector("#expand-button").classList.add("rotate-arrow-back");
        document.querySelector("#expand-button").classList.remove("rotate-arrow");
        document.querySelector("#expand-button").classList.add("sidebar-opened");
    } else {
        document.querySelector("#sidebar").classList.remove("expand-sidebar");
        document.querySelector("#sidebar").classList.add("hide-sidebar");
        
        document.querySelector("#expand-button").classList.remove("rotate-arrow-back");
        document.querySelector("#expand-button").classList.add("rotate-arrow");
        document.querySelector("#expand-button").classList.remove("sidebar-opened");
    }
}

// Returns the sidebar to its "closed" state in case the user forgets to do it
// when resizing the window in order to preserve the layout of the page when the 
// window shrinks again
function originalSideBar() {
    if (window.innerWidth > 1050) {
        document.querySelector("#sidebar").classList.remove("expand-sidebar");
        document.querySelector("#sidebar").classList.remove("hide-sidebar");

        document.querySelector("#expand-button").classList.remove("rotate-arrow");
        document.querySelector("#expand-button").classList.remove("rotate-arrow-back");
        document.querySelector("#expand-button").classList.remove("sidebar-opened");
    }
}
/*-----------------------------------------------------------------------------------*/

/*----------------------------PREVIEW/MIDDLE COLUMN----------------------------------*/

function createPreview(note) {

    let previewDate = document.createElement("p");
    previewDate.classList.add("preview-entry-date");
    previewDate.innerText = note.dateCreated.split(" ").slice(1, 4).join(" ");
    
    let previewTime = document.createElement("p");
    previewTime.classList.add("preview-entry-time");
    previewTime.innerText = convertTime(note.dateCreated);

    let previewDetails = document.createElement("div");
    previewDetails.classList.add("preview-entry-header-details");
    previewDetails.appendChild(previewDate);
    previewDetails.appendChild(previewTime);

    let previewTitle = document.createElement("p");
    previewTitle.classList.add("preview-entry-title");
    previewTitle.innerText = note.title;

    let previewIcons = document.createElement("div");
    previewIcons.classList.add("preview-icon-container");
    let sources = ["star-purple.svg", "lock-orange.svg"];
    for (let iconSource of sources) {
        let icon = document.createElement("img");
        icon.setAttribute("src", `images/${iconSource}`);
        icon.classList.add(`preview-icon-${iconSource.split("-")[0]}`);
        icon.classList.add("preview-icon-hidden");
        previewIcons.appendChild(icon);
    }

    let previewHeader = document.createElement("div");
    previewHeader.classList.add("preview-entry-header");
    previewHeader.appendChild(previewDetails);
    previewHeader.appendChild(previewTitle);
    previewHeader.appendChild(previewIcons);

    let previewHighlight = document.createElement("p");
    previewHighlight.classList.add("preview-highlight");
    previewHighlight.innerText = note.highlightText;

    let previewTagContainer = document.createElement("div");
    previewTagContainer.classList.add("preview-tag-container");
    if (note.tags.length > 0) {
        for (let tag of note.tags) {
            let previewTag = document.createElement("div");
            previewTag.innerText = `${tag}`;
            previewTag.classList.add("preview-tag");
            assignColor(previewTag, tag);
            previewTagContainer.appendChild(previewTag);
        }
    }

    let previewContainer = document.createElement("li");
    previewContainer.classList.add("preview-entry");
    if (note.favorite) {
        previewContainer.classList.add("favorites");
        previewIcons.childNodes[0].classList.remove("preview-icon-hidden");
        let numberOfFavorites = Number(document.querySelectorAll("#folders-list li")[0].childNodes[2].value);
        document.querySelectorAll("#folders-list li")[0].childNodes[2].setAttribute("value", `${++numberOfFavorites}`);
    }
    if (note.archived) {
        previewContainer.classList.add("archived");
        previewIcons.childNodes[1].classList.remove("preview-icon-hidden");
        let numberOfArchived = Number(document.querySelectorAll("#folders-list li")[1].childNodes[2].value);
        document.querySelectorAll("#folders-list li")[1].childNodes[2].setAttribute("value", `${++numberOfArchived}`);
    }
    if (note.deleted) {
        previewContainer.classList.add("deleted");
        previewContainer.classList.add("hide-preview-entry");
        let numberOfDeleted = Number(document.querySelectorAll("#folders-list li")[2].childNodes[2].value);
        document.querySelectorAll("#folders-list li")[2].childNodes[2].setAttribute("value", `${++numberOfDeleted}`);
    }
    previewContainer.setAttribute("id", `${note.timestamp}`);
    previewContainer.appendChild(previewHeader);
    previewContainer.appendChild(previewHighlight);
    previewContainer.appendChild(previewTagContainer);

    previewContainer.addEventListener("click", selectPreview);
    document.querySelector("#review-list").appendChild(previewContainer);

    let timeBox = previewTime.getBoundingClientRect();
    let entryBox = previewContainer.getBoundingClientRect();
    previewIcons.style.right = `${entryBox.right - timeBox.left - 8}px`;
}


// Attaches a class that marks the clicked preview as the "selected" one 
// and calls a function to "expand" its tags while removing the class from 
// any other preview and hiding its tags. Finally, a function is called to
// populate the form in the right column with the info pertaining to the selected preview
function selectPreview(event) {
    let previews = document.querySelectorAll(".preview-entry");
    for (let preview of previews) {
        preview.classList.remove("selected-preview");
        foldPreviewTags(preview.childNodes[2].childNodes);
    }
    let element = event.target;
    while (!element.classList.contains("preview-entry")) {
        element = element.parentNode;
    }
    element.classList.add("selected-preview");
    expandPreviewTags(element.childNodes[2].childNodes);
    populateForm(element.getAttribute("id"));
}

// Expands all tags of the selected preview to reveal their titles
function expandPreviewTags(tagArray) {
    if (tagArray.length !== 0) {
        for (let tag of tagArray) {
           tag.classList.add("preview-tag-expanded");
        }
    }
}

// Shrinks all of the preview's tags to hide their titles 
function foldPreviewTags(tagArray) {
    if (tagArray.length !== 0) {
        for (let tag of tagArray) {
            tag.classList.remove("preview-tag-expanded");
        }
    }
}

// Retrieves the color of a tag from chrome storage and sets 
// it as the background color of the preview tag
function assignColor(previewTag, tagName) {
    chrome.storage.sync.get("tags", function(memoryObject) {
        for (let tag of memoryObject.tags) {
            if (tagName === tag.tagName) {
                previewTag.style.backgroundColor = tag.tagColor;
                return;
            }
        }
    })
}

// Converts time from a 24-hour format into a 12-hour(AM/PM) format
function convertTime(string) {
    let timeArray = string.split(" ")[4].split(":").slice(0, 2);
    let hour = Number(timeArray[0]);
    let amOrPm = hour <= 11 ? " AM" : " PM";

    if (hour === 0 || hour === 12) {
        timeArray[0] = "12";
    } else if (hour <= 11) {
        timeArray[0] = String(hour);
    } else {
        timeArray[0] = String(hour - 12);
    }

    return timeArray.join(":") + amOrPm;
}

// Calls a function to get all preview elements from the middle column that match the selected
// tag, checks whether their contents (date, time, title, highlight text, and tags) match
// the user's input and hides them if they do not. If no search pattern was provided by the user,
// the entire array returned from the function is displayed.   
function searchPreviews() {
    let userInput = document.querySelector(`input[type = 'search']`).value.toLowerCase();
    let idArray = getTaggedPreviews();

    for (let tag of document.querySelectorAll(".preview-entry")) {
        if (idArray.indexOf(tag.getAttribute("id")) >= 0) {
            tag.classList.remove("hide-preview-entry");
        } else {
            tag.classList.add("hide-preview-entry");
        }
    }
    
    if (userInput) {
        for (let i = 0; i < idArray.length; i++) {
            let tag = document.getElementById(idArray[i]);
            let textElements = [
                tag.querySelector(".preview-entry-date"),
                tag.querySelector(".preview-entry-time"),
                tag.querySelector(".preview-entry-title"),
                tag.querySelector(".preview-highlight"),
                ...tag.querySelectorAll(".preview-tag")
            ];
            let display = false; 
            for (let element of textElements) {
                if (element.innerText.toLowerCase().indexOf(userInput) >= 0) {
                    display = true;
                } 
            }
            if (display) {
                tag.classList.remove("hide-preview-entry");
            } else {
                tag.classList.add("hide-preview-entry");
            }   
        }
    }
}

// Returns an array of all preview tag elements from the middle column 
// that match the selected tag in the left column and have not been marked
// as "deleted" 
function getTaggedPreviews() {
    let selectedTag = document.querySelector(".selected-tag-div"); 
    let selectedTagText = "";
    let previewArray = [];
    if (selectedTag.getAttribute("id") === "main-tag") {
        for (let previewTag of document.querySelectorAll(".preview-entry")) {
            if (!previewTag.classList.contains("deleted")) {
                previewArray.push(previewTag);
            }
        }
    } else if (selectedTag.parentNode.getAttribute("id") === "folders-list") {
        selectedTagText = selectedTag.childNodes[1].innerText.toLowerCase();
        previewArray = document.querySelectorAll(`.${selectedTagText}`);
    } else {
        selectedTagText = selectedTag.childNodes[1].value;
        for (let item of document.querySelectorAll(".preview-entry")) {
            for (let tag of item.querySelectorAll(".preview-tag")) {
                if (tag.innerText === selectedTagText && !item.classList.contains("deleted")) {
                    previewArray.push(item);
                }
            }
        }
    }
    let idArray = [];
    for (let preview of previewArray) {
        idArray.push(preview.getAttribute("id"));
    }
    return idArray;
}

// Updates the filter text and caret when the user toggles them 
// and calls a function to sort preview elements in the middle column 
// by creation date
function filterPreviews() {
    let filter = document.querySelector("#filter-arrow");
    if (filter.classList.contains("rotate-up")) {
        document.querySelector("#preview-filter span").innerText = "Oldest First";
        filter.classList.remove("rotate-up");
        filter.classList.add("rotate-down");
        sortPreviews("oldest");
    } else {
        document.querySelector("#preview-filter span").innerText = "Newest First";
        filter.classList.remove("rotate-down");  
        filter.classList.add("rotate-up");
        sortPreviews("newest");
    }
}

// Sorts the previews by creation date
function sortPreviews(order) {
    let list = document.querySelector("#review-list");
    let i;
    let switching = true;
    while (switching) {
        switching = false;
        let shouldSwitch = false
        let items = list.querySelectorAll("li");
        for (i = 0; i < items.length - 1; i++) {
            if (order === "newest") {
                if (Number(items[i].getAttribute("id")) < Number(items[i+1].getAttribute("id"))) {
                    shouldSwitch = true;
                    break;
                }
            } else {
                if (Number(items[i].getAttribute("id")) > Number(items[i+1].getAttribute("id"))) {
                    shouldSwitch = true;
                    break;
                } 
            }
        }
        if (shouldSwitch) {
            items[i].parentNode.insertBefore(items[i+1], items[i]);
            switching = true;
        }
    }
}

/*--------------------------------------------------------------------------------------------------- */

/*-----------------------------------FORM/RIGHT COLUMN----------------------------------------------- */

// Replaces the month abbreviation with the month's full name
function transformDate(dateString) {
    let dateArray = dateString.split(" ");
    switch (dateArray[1]) {
        case "Dec":
            dateArray[1] = "December";
            break;
        case "Jan":
            dateArray[1] = "January";
            break;
        case "Feb":
            dateArray[1] = "February";
            break;
        case "Mar":
            dateArray[1] = "March";
            break;
        case "Apr":
            dateArray[1] = "April";
            break;
        case "May":
            dateArray[1] = "May";
            break;
        case "Jun":
            dateArray[1] = "June";
            break;
        case "Jul":
            dateArray[1] = "July";
            break;
        case "Aug":
            dateArray[1] = "August";
            break;
        case "Sep":
            dateArray[1] = "September";
            break;
        case "Oct":
            dateArray[1] = "October";
            break;
        case "Nov":
            dateArray[1] = "November";
            break;
    }
    return dateArray.slice(1, 4).join(" ");
}

// Removes the clicked tag from the large form, calls a function to remove it
// from the preview thumbnail, updates the tag's object's number property and the
// note's object's array of tags in chrome storage, and calls a function that updates 
// the tag's counter in the left-hand column. If the number of tags of the highlight no longer,
// matches the total number of existing tags, the "disabled" class is removed from the "add tag" button
function removeTagFromForm(event) {
    let formTag = event.target.parentNode;
    let tagText = formTag.childNodes[0].innerText;
    formTag.parentNode.removeChild(formTag);
    chrome.storage.sync.get(["tags", "notes"], function(memoryObject) {
        for (let tagObject of memoryObject.tags) {              
            if (tagObject.tagName === tagText) {
                tagObject.tagNumber--;
                updateTagCounter(tagText, tagObject.tagNumber);
                break;
            }
        }
        let noteID = document.querySelector(".selected-preview").getAttribute("id");
        for (let note of memoryObject.notes) {
            if (note.timestamp == noteID) {
                note.tags = note.tags.filter(a => a !== tagText);
                note.lastUpdated = Date();
            }
        }
        if (document.querySelectorAll(".note-tag").length === document.querySelectorAll(".tag-section").length) {
            document.querySelector("#note-form-add-button").classList.add("disabled-button");
        } else {
            document.querySelector("#note-form-add-button").classList.remove("disabled-button");
        }
        removeTagFromPreview(tagText)
        chrome.storage.sync.set({"tags": memoryObject.tags, "notes": memoryObject.notes});
    })
}

// Updates the tag number in the left-hand column if the number is 
// not larger than 99, otherwise keeps it at +99
function updateTagCounter(tag, number) {
    let tagList = document.querySelectorAll(".tag-section");
    for (let listItem of tagList) {
        if (listItem.childNodes[1].value === tag) {
            if (number <= 99) {
                listItem.childNodes[2].setAttribute("value", `${number}`);
            } else {
                listItem.childNodes[2].setAttribute("value", `+99`);
            }
            break;
        }
    }
}

// Removes the tag that was deleted from the large form 
// from the preview thumbnail in the middle column
function removeTagFromPreview(tag) {
    let previewTags = document.querySelector(".selected-preview .preview-tag-container");
    for (let previewTag of previewTags.childNodes) {
        if (previewTag.innerText === tag) {
            previewTag.parentNode.removeChild(previewTag);
            break;
        }
    }
}

// Updates the keys of the appropriate note object with the passed value 
// and commits the change to chrome storage
function updateNoteObject(key, value) {
    if (!event.target.classList.contains("disabled-button")) {
        chrome.storage.sync.get(["notes", "tags"], function(memoryObject) {
            let noteID = document.querySelector(".selected-preview").getAttribute("id");
            for (let note of memoryObject.notes) {
                if (note.timestamp == noteID) {
                    if (value) {
                        note[key] = value;
                        note.lastUpdated = Date();
                        break;
                    } else {
                        for (let property in key) {
                            if (key[property]) {
                                if (key[property] === "select") {
                                    note[property] = true;
                                } else {
                                    note[property] = false;
                                }
                            }
                        }
                    }
                }
            }
            chrome.storage.sync.set({"notes": memoryObject.notes});
        })
    }
}

// Updates the title of the selected preview thumbnail
function updatePreviewTitle(title) {
    document.querySelector(".selected-preview").childNodes[0].childNodes[1].innerText = title; 
}

// Creates a pop-up that lets the user know their changes have been saved successfully.
// The pop-up is removed automatically in 1.5 seconds if the user does not close it on their own. 
function saveAnimation() {
    let darkScreen = buildTopOfPopUp("green-checkmark.svg", "Success!");

    let bodyCaption = document.createElement("p");
    bodyCaption.classList.add("pop-up-text");
    bodyCaption.innerHTML = `Your changes have been saved.`;
    bodyCaption.style.marginBottom = "30px";

    let popUp = darkScreen.childNodes[0];
    popUp.appendChild(bodyCaption);

    document.querySelector("body").prepend(darkScreen);
    darkScreen.addEventListener("click", removePopUp);

    setTimeout(function() {document.querySelector(".dark-screen").dispatchEvent(new Event("click"));}, 1500);
}

function populateForm(id) {
    chrome.storage.sync.get(["notes", "tags"], function(memoryObject) {
        for (let entry of memoryObject.notes) {
            if (entry.timestamp == id) {
                document.querySelector("#note-title").value = entry.title;
                document.querySelector("#date-created").innerText = transformDate(entry.dateCreated);
                if (entry.lastUpdated) {
                    document.querySelector("#note-header-row-two span").classList.remove("hide-form-element");
                    document.querySelector("#date-updated").classList.remove("hide-form-element");
                    
                    let todaysDate = Date();
                    if (todaysDate.split(" ")[1] === entry.lastUpdated.split(" ")[1] &&
                        todaysDate.split(" ")[2] === entry.lastUpdated.split(" ")[2] &&
                        todaysDate.split(" ")[3] === entry.lastUpdated.split(" ")[3]) {
                            document.querySelector("#date-updated").innerText = `Last updated at ${convertTime(entry.lastUpdated)}`;
                    } else {
                        document.querySelector("#date-updated").innerText = `Last updated on ${transformDate(entry.dateCreated)}`;
                    }
                } else {
                    document.querySelector("#note-header-row-two span").classList.add("hide-form-element");
                    document.querySelector("#date-updated").classList.add("hide-form-element");
                }
                
                document.querySelector("#note-tag-container").innerHTML = "<img id='note-form-add-button' src='images/add-icon.svg'>";

                for (let item of entry.tags) {
                    let formTagText = document.createElement("p");
                    formTagText.innerText = item;
        
                    let formTagCancel = document.createElement("img");
                    formTagCancel.setAttribute("src", "images/cancel-icon-white.svg");
        
                    let formTagContainer = document.createElement("div");
                    formTagContainer.classList.add("note-tag");
                    for (let tagObject of memoryObject.tags) {
                        if (tagObject.tagName === item) {
                            formTagContainer.style.backgroundColor = tagObject.tagColor;
                            break;
                        }
                    }
                    formTagContainer.appendChild(formTagText);
                    formTagContainer.appendChild(formTagCancel);
                    let noteTagContainer = document.querySelector("#note-tag-container");
                    noteTagContainer.insertBefore(formTagContainer, noteTagContainer.childNodes[noteTagContainer.childNodes.length-1]);
                }
        
                document.querySelector("#note-highlight").innerText = entry.highlightText;
                document.querySelector("#note-comment").innerText = entry.notes;

                if (entry.favorite) {
                    document.querySelectorAll("#note-icons img")[0].setAttribute("src", "images/star-purple.svg");
                } else {
                    document.querySelectorAll("#note-icons img")[0].setAttribute("src", "images/star-gray.svg");
                }
                
                if (entry.archived) {
                    document.querySelectorAll("#note-icons img")[1].setAttribute("src", "images/lock-orange.svg");
                } else {
                    document.querySelectorAll("#note-icons img")[1].setAttribute("src", "images/lock-gray.svg");;
                }
                
                if (entry.deleted) {
                    document.querySelectorAll("#note-icons img")[2].setAttribute("src", "images/trash-can-icon-red.svg");
                } else {
                    document.querySelectorAll("#note-icons img")[2].setAttribute("src", "images/trash-can-icon-gray.svg");
                }

                if (entry.archived || entry.deleted) {
                    freezeForm();
                } else {
                    unfreezeForm();
                }

                if (document.querySelectorAll(".note-tag").length === document.querySelectorAll(".tag-section").length ||
                    document.querySelector("#save-button").classList.contains("disabled-button")) {
                    document.querySelector("#note-form-add-button").classList.add("disabled-button");
                } else {
                    document.querySelector("#note-form-add-button").classList.remove("disabled-button");
                }
            }
        }
    })
}

// Disables the title and comment text fields, assigns classes that make the
// "save" and "add tag" buttons appear disabled, and removes "click" listeners from them
function freezeForm() {
    document.querySelector("#note-title").setAttribute("disabled", true);
    document.querySelector("#note-title").classList.add("disabled-cursor");
    document.querySelector("#note-comment").setAttribute("disabled", true);
    document.querySelector("#note-comment").classList.add("disabled-cursor");
    for (let cancelIcon of document.querySelectorAll(".note-tag img")) {
        cancelIcon.removeEventListener("click", removeTagFromForm);
    }
    document.querySelector("#note-form-add-button").removeEventListener("click", createTagSelectorWindow);
    document.querySelector("#save-button").classList.add("disabled-button");
}

// Removes the "disabled" attribute from the title and comment text area, removes the 
// classes that make the "save" and "add tag" buttons appear disabled, and attaches 
// click listeners to them 
function unfreezeForm() {
    document.querySelector("#note-title").removeAttribute("disabled");
    document.querySelector("#note-title").classList.remove("disabled-cursor");
    document.querySelector("#note-comment").removeAttribute("disabled", true);
    document.querySelector("#note-comment").classList.remove("disabled-cursor");   
    for (let cancelIcon of document.querySelectorAll(".note-tag img")) {
        cancelIcon.addEventListener("click", removeTagFromForm);
    }
    document.querySelector("#note-form-add-button").addEventListener("click", createTagSelectorWindow);
    document.querySelector("#save-button").classList.remove("disabled-button"); 
}

// Toggles the appearance of the form's clicked status icon. If the user clicks an icon while 
// there is already another "active" icon (icon that isn't gray), the clicked icon becomes the 
// new "active" icon while the old one gets deselected (turns gray). A function is called to update 
// the counters at the bottom of the sidebar and another function is called to commit the status change 
// to chrome storage
function updateNoteStatus(event) {
    let iconSrc = event.target.getAttribute("src");
    let preview = document.querySelector(".selected-preview");
    let actionsObj = {
        favorite: undefined,
        archived: undefined,
        deleted: undefined
    }
    let folderNumbers = obtainCurrentFolderNumbers();

    if (iconSrc.indexOf("can") !== -1) {
        if (iconSrc.indexOf("red") !== -1) {
            actionsObj.deleted = "deselect";
            toggleTrashCan("deselect");
            unfreezeForm();
            document.querySelector("#note-form-add-button").classList.remove("disabled-button");     
        } else {
            if (preview.classList.contains("favorites")) {
                actionsObj.favorite = "deselect";
                toggleStar("deselect");
            }
            if (preview.classList.contains("archived")) {
                actionsObj.archived = "deselect";
                toggleLock("deselect");
            }
            actionsObj.deleted = "select";
            toggleTrashCan("select");
            freezeForm();
            document.querySelector("#note-form-add-button").classList.add("disabled-button");  
        }
    } else if (iconSrc.indexOf("lock") !== -1) {
        if (iconSrc.indexOf("orange") !== -1) {
            actionsObj.archived = "deselect";
            toggleLock("deselect"); 
            unfreezeForm(); 
            document.querySelector("#note-form-add-button").classList.remove("disabled-button");      
        } else {
            if (preview.classList.contains("favorites")) {
                actionsObj.favorite = "deselect";
                toggleStar("deselect");
            }
            if (preview.classList.contains("deleted")) {
                actionsObj.deleted = "deselect";
                toggleTrashCan("deselect");
            }
            actionsObj.archived = "select";
            toggleLock("select");
            freezeForm(); 
            document.querySelector("#note-form-add-button").classList.add("disabled-button");  
        }
    } else {
        if (iconSrc.indexOf("purple") !== -1) {
            actionsObj.favorite = "deselect";
            toggleStar("deselect"); 
        } else {
            if (preview.classList.contains("archived")) {
                actionsObj.archived = "deselect";
                toggleLock("deselect");
            }
            if (preview.classList.contains("deleted")) {
                actionsObj.deleted = "deselect";
                toggleTrashCan("deselect");
            }
            actionsObj.favorite = "select";
            toggleStar("select"); 
            unfreezeForm();
            document.querySelector("#note-form-add-button").classList.remove("disabled-button");   
        }
    }
    updateFolderNumbers(folderNumbers, actionsObj);
    updateNoteObject(actionsObj);
    searchPreviews();
}

// Based on the key values of the argument object, which represent the actions of the user, the function
// calls functions to either increment or decrement the input values of All Notes, Favorites, Archived, 
// and Deleted counters
function updateFolderNumbers(numbersArray, actionsObj) {
    if (actionsObj.favorite) {
        if (actionsObj.favorite === "select") {
            setIncreasedInputValue(document.querySelectorAll("#folders-list li")[0].childNodes[2], numbersArray[1]);    
        } else {
            setDecreasedInputValue(document.querySelectorAll("#folders-list li")[0].childNodes[2], numbersArray[1]); 
        }    
    }
    if (actionsObj.archived) {
        if (actionsObj.archived === "select") {
            setIncreasedInputValue(document.querySelectorAll("#folders-list li")[1].childNodes[2], numbersArray[2]);    
        } else {
            setDecreasedInputValue(document.querySelectorAll("#folders-list li")[1].childNodes[2], numbersArray[2]); 
        }    
    }
    if (actionsObj.deleted) {
        if (actionsObj.deleted === "select") {
            setIncreasedInputValue(document.querySelectorAll("#folders-list li")[2].childNodes[2], numbersArray[3]);
            setDecreasedInputValue(document.querySelector("#main-tag input"), numbersArray[0])     
        } else {
            setDecreasedInputValue(document.querySelectorAll("#folders-list li")[2].childNodes[2], numbersArray[3]);
            setIncreasedInputValue(document.querySelector("#main-tag input"), numbersArray[0])
        }
    }
}

// Returns an array with the total number of existing notes as well as  
// the numbers of notes that have been favorited, archived or deleted
function obtainCurrentFolderNumbers() {
    let mainCounter = 0;
    let favoriteCounter = 0;
    let archivedCounter = 0;
    let deletedCounter = 0;
    for (let preview of document.querySelectorAll(".preview-entry")) {
        mainCounter++;
        if (preview.classList.contains("favorites")) {
            favoriteCounter++
        }
        if (preview.classList.contains("archived")) {
            archivedCounter++;
        }
        if (preview.classList.contains("deleted")) {
            deletedCounter++
        }
    }
    mainCounter = mainCounter - deletedCounter;
    return [mainCounter, favoriteCounter, archivedCounter, deletedCounter];
}

// Checks whether the input's value is going to be incremented past its "max" value.
// If it is, sets the input's value to +99. Otherwise, it simply increments it.
function setIncreasedInputValue(inputField, number) {
    if (number >= 99) {
        inputField.setAttribute("value", `+99`);
    } else {
        inputField.setAttribute("value", `${++number}`);
    }    
}

// Checks whether the input's value is going to continue to be over its "max" value. 
// If it is, sets the input's value to +99. Otherwise, it simply decrements it.
function setDecreasedInputValue(inputField, number) {
    if (number > 100) {
        inputField.setAttribute("value", `+99`);    
    } else {
        inputField.setAttribute("value", `${--number}`);
    }
}

// Either adds a purple star to the form and the selected preview or 
// removes it depending on the passed argument
function toggleStar(action) {
    if (action === "select") {
        document.querySelectorAll("#note-icons img")[0].setAttribute("src", "images/star-purple.svg");
        document.querySelector(".selected-preview").querySelector(".preview-icon-star").classList.remove("preview-icon-hidden");
        document.querySelector(".selected-preview").classList.add("favorites");
    } else {
        document.querySelectorAll("#note-icons img")[0].setAttribute("src", "images/star-gray.svg");
        document.querySelector(".selected-preview").querySelector(".preview-icon-star").classList.add("preview-icon-hidden");
        document.querySelector(".selected-preview").classList.remove("favorites");
    }    
}

// Either adds an orange lock to the form and the selected preview or 
// removes it depending on the passed argument
function toggleLock(action) {
    if (action === "select") {
        document.querySelectorAll("#note-icons img")[1].setAttribute("src", "images/lock-orange.svg");
        document.querySelector(".selected-preview").querySelector(".preview-icon-lock").classList.remove("preview-icon-hidden");
        document.querySelector(".selected-preview").classList.add("archived");    
    } else {
        document.querySelectorAll("#note-icons img")[1].setAttribute("src", "images/lock-gray.svg");
        document.querySelector(".selected-preview").querySelector(".preview-icon-lock").classList.add("preview-icon-hidden");
        document.querySelector(".selected-preview").classList.remove("archived"); 
    }
}

// Either adds a red trash can to the form or 
// removes it depending on the passed argument
function toggleTrashCan(action) {
    if (action === "select") {
        document.querySelectorAll("#note-icons img")[2].setAttribute("src", "images/trash-can-icon-red.svg");
        document.querySelector(".selected-preview").classList.add("deleted"); 
    } else {
        document.querySelectorAll("#note-icons img")[2].setAttribute("src", "images/trash-can-icon-gray.svg");
        document.querySelector(".selected-preview").classList.remove("deleted"); 
    }    
}


function createTagSelectorWindow(event) {
    if (!event.target.classList.contains("disabled-button")) {
        chrome.storage.sync.get("tags", function(memoryObject) {
            let darkScreen = buildTopOfPopUp("tag-icon.svg", "Add More Tags");

            let tagContainer = document.createElement("div");
            tagContainer.classList.add("note-form-tag-container");

            let selectedPreviewTags = document.querySelector(".selected-preview").childNodes[2].childNodes;
            let tagTitles = [];
            for (let tag of selectedPreviewTags) {
                tagTitles.push(tag.innerText);
            }
            console.log(tagTitles);
            for (let tagObj of memoryObject.tags) {
                if (tagTitles.indexOf(tagObj.tagName) === -1) {
                    let newTag = document.createElement("div");
                    newTag.innerText = `${tagObj.tagName}`;
                    newTag.classList.add("preview-tag-add");
                    newTag.addEventListener("click", toggleNewTag);
                    newTag.style.backgroundColor = `${tagObj.tagColor}`;
                    tagContainer.appendChild(newTag); 
                }
            }

            let buttonHolder = buildButtons("Add", "Cancel"); 
            
            let popUp = darkScreen.childNodes[0];
            popUp.appendChild(tagContainer);
            popUp.appendChild(buttonHolder);

            document.querySelector("body").prepend(darkScreen);
            darkScreen.addEventListener("click", removePopUp);
            document.querySelector(".affirmative-button").classList.add("disabled-button");

            document.querySelector(".affirmative-button").addEventListener("click", addNewTags);
        })
    }    
}

// Adds or removes a class that controls the brightness of the background color
// creating a selected/deselected effect
function toggleNewTag(event) {
    if (event.target.classList.contains("preview-tag-add-selected")) {
        event.target.classList.remove("preview-tag-add-selected");
        console.log("hello");
        if (document.querySelectorAll(".preview-tag-add-selected").length === 0) {
            document.querySelector(".affirmative-button").classList.add("disabled-button");
        }
    } else {
        event.target.classList.add("preview-tag-add-selected");
        document.querySelector(".affirmative-button").classList.remove("disabled-button");
    }
}

// Adds the tags picked using the tag selection window to the form and the selected preview
// thumbnail, updates the counters of the relevant tags in the left column, updates the 
// appropriate tags' object and notes' object and commits the changes to chrome storage
function addNewTags(event) {
    if (!event.target.classList.contains("disabled-button")) {
        let selectedTags = document.querySelectorAll(".preview-tag-add-selected");
        if (selectedTags) {
            let names = [];
            for (let selectedTag of selectedTags) {
                let newPreviewTag = document.createElement("div");
                newPreviewTag.innerText = `${selectedTag.innerText}`;
                newPreviewTag.style.backgroundColor = `${selectedTag.style.backgroundColor}`;
                newPreviewTag.classList.add("preview-tag");
                newPreviewTag.classList.add("preview-tag-expanded");
                document.querySelector(".selected-preview .preview-tag-container").appendChild(newPreviewTag);
                
                let newFormTag = document.createElement("div");
                newFormTag.classList.add("note-tag");
                newFormTag.style.backgroundColor = `${selectedTag.style.backgroundColor}`;
                newFormTag.innerHTML = `<p>${selectedTag.innerText}</p><img src='images/cancel-icon-white.svg'>`;
                newFormTag.childNodes[1].addEventListener("click", removeTagFromForm);
                let noteTagContainer = document.querySelector("#note-tag-container");
                noteTagContainer.insertBefore(newFormTag, noteTagContainer.childNodes[noteTagContainer.childNodes.length-1]);
                
                names.push(selectedTag.innerText);
            }
            if (document.querySelectorAll(".note-tag").length === document.querySelectorAll(".tag-section").length) {
                document.querySelector("#note-form-add-button").classList.add("disabled-button");
            } 
            for (let sideBarTag of document.querySelectorAll(".tag-section")) {
                if (names.indexOf(sideBarTag.childNodes[1].value) !== -1) {
                    let counter = sideBarTag.childNodes[2].value;
                    if (counter === "+99" || counter === "99") {
                        sideBarTag.childNodes[2].setAttribute("value", `+99`);    
                    } else {
                        let counterNumber = Number(counter);
                        sideBarTag.childNodes[2].setAttribute("value", `${++counterNumber}`);    
                    }
                }
            }
            
            chrome.storage.sync.get(["tags", "notes"], function(memoryObject) {
                for (let tagObj of memoryObject.tags) {
                    if (names.indexOf(tagObj.tagName) !== -1) {
                        tagObj.tagNumber++;
                    }
                }
                let selectedNoteID = document.querySelector(".selected-preview").getAttribute("id");
                for (let note of memoryObject.notes) {
                    if (note.timestamp == selectedNoteID) {
                        for (let item of names) {
                            note.tags.push(item);
                        }
                        note.lastUpdated = Date();
                    }
                }
                chrome.storage.sync.set({"tags": memoryObject.tags, "notes": memoryObject.notes});
                document.querySelector(".affirmative-button").classList.add("ok-to-close");
                removePopUp(event);
            })
        }
    }
}

