chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        alert("omg");
        console.log( sender.tab ? "yep, got it" : "nope we did not");
        document.querySelector("body").style.backgroundColor = "red";
        //let windowURl = window.location.href;
        //for (let entry of request) {
        //    console.log(entry.url);
        //}
    }
);


/*chrome.runtime.sendMessage({ 
    "text": "new highlight",
    "timestamp": timestamp,
    "highlightColor": bubble.style.backgroundColor,
    "highlightText": range.toString(),
    "dateCreated": (new Date()).toString(),
    "url": window.location.href,
    "websiteName": window.location.hostname,
    "tags": [],
    "notes": "",
    "hidden": false,
    "range": {
        "startOffset": range.startOffset,
        "endOffset": range.endOffset,
        "startNode": [range.getClientRects()[0].x, range.getClientRects()[0].y],
        "endNode": [range.getClientRects()[range.getClientRects().length - 1].x, range.getClientRects()[range.getClientRects().length - 1].y]
    }
});
})*/



//chrome.runtime.onMessage.addListener(checkStatus)
//let closeHighlight = 0;

/*var hltr = new TextHighlighter(document.body, {
    onBeforeHighlight: function(range) {
        document.querySelectorAll(".highlight-notes-color-option").addEventListener("click", function(event) {
            event.stopPropagation();
            return true;
        })
    }
});*/

//let color = "yellow";

/*let mouseDownX, mouseDownY, mouseUpX, mouseUpY;

document.querySelector("body").addEventListener("mousedown", function(event) {
    mouseDownX = event.clientX;
    mouseDownY = event.clientY;
    console.log(`down ${mouseDownX} ${mouseDownY}`)

})

document.querySelector("body").addEventListener("mouseup", function(event) {
    mouseUpX = event.clientX;
    mouseUpY = event.clientY;
    console.log(`up ${mouseUpX} ${mouseUpY}`)
})

let hasClicked = false;

var hltr = new TextHighlighter(document.body, {
    onAfterHighlight: function(range, highlights, timestamp) {
    
        //Sets the color of the highlights to blue to provide the user with some visiable feedback 
        //(what has just been selected) and attaches the edit menu to each tag which can be accessed
        // after the user selects the initial color of the highlight
        for (let tag of highlights) {
            tag.style.backgroundColor = "#add8e6";
            tag.classList.add("highlight-notes-color-has-not-been-picked");

            tag.addEventListener("click", function(event) {
                event.stopPropagation();

                createEditMenu(range, highlights, timestamp);
            })
        }

        //Creates the initial menu that allows the user to set the color of their highlight
        createInitialColorMenu(highlights, timestamp, range);

        //Finds the begining of the highlight and attaches the color menu to it //USE THE FIRST OR LAST SPAN TAG FOR THIS FOR IT TO BE AS CLOSE AS POSSIBLE

        let firstHighlightPosition = getPositionY(highlights[0])
        let lastHighlightPosition = getPositionY(highlights[highlights.length - 1]);

        let browserTopBorder = window.pageYOffset;
        let browserBottomBorder = window.pageYOffset + window.innerHeight;

        let menuContainer = document.querySelector(".highlight-notes-circle-menu-container");


        if (firstHighlightPosition > browserTopBorder && lastHighlightPosition < browserBottomBorder) {
            let topSpace = firstHighlightPosition - browserTopBorder;
            let bottomSpace = browserBottomBorder - lastHighlightPosition;
            if (topSpace > bottomSpace) {
                //let client = highlights[0].getBoundingClientRect();
                menuContainer.classList.remove("highlight-notes-rotate-menu");
                menuContainer.childNodes[0].childNodes[0].classList.remove("highlight-notes-rotate-menu");
                menuContainer.style.top = `${firstHighlightPosition - 40}px`;
                //menuContainer.style.left = `${client.left}px`; 
                
            } else {
                let client = highlights[highlights.length - 1].getBoundingClientRect();
                menuContainer.classList.add("highlight-notes-rotate-menu");
                menuContainer.childNodes[0].childNodes[0].classList.add("highlight-notes-rotate-menu");
                menuContainer.style.top = `${lastHighlightPosition + 40}px`;
                menuContainer.style.left = `${client.right}px`;
            }
        } else if (firstHighlightPosition <= browserTopBorder && browserBottomBorder - lastHighlightPosition > 40 ) {
            let client = highlights[highlights.length - 1].getBoundingClientRect();
            menuContainer.classList.add("highlight-notes-rotate-menu");
            menuContainer.childNodes[0].childNodes[0].classList.add("highlight-notes-rotate-menu");
            menuContainer.style.top = `${lastHighlightPosition + 20}px`;
            menuContainer.style.left = `${client.right}px`;
        } else if (lastHighlightPosition >= browserBottomBorder && firstHighlightPosition - browserTopBorder > 40) {
            let client = highlights[0].getBoundingClientRect();
            menuContainer.classList.remove("highlight-notes-rotate-menu");
            menuContainer.childNodes[0].childNodes[0].classList.remove("highlight-notes-rotate-menu");
            menuContainer.style.top = `${firstHighlightPosition - 20}px`;
            menuContainer.style.left = `${client.right}px`; 
        } 






        /*if (lastHighlightPosition > browserPosition + window.innerHeight && firstHighlightPosition > browserPosition + 100) {
            console.log("top " + firstHighlightPosition)
            let clients = highlights[0].getBoundingClientRect();
            console.log(clients.top);
            console.log(clients.left);
            menuContainer.style.top = `${firstHighlightPosition - 40}px`;
            menuContainer.style.left = `${clients.left}px`;  
        } else if (firstHighlightPosition <= )

        }*/

        
        //let menuContainer = document.querySelector(".highlight-notes-circle-menu-container");
        //menuContainer.style.top = `${window.pageYOffset + clients[0].y - 40}px`;
        //menuContainer.style.left = `${clients[0].left}px`;    
 /*   },
    removeHighlights: function(highlights) {
        //for (let tag of highlights) {
        //    tag.style.backgroundColor = "transparent";
        //}
        return true;
    }
});

console.log("up")


function getPositionY(element) {
    let location = 0;
        if (element.offsetParent) {
            do {
                location += element.offsetTop;
                element = element.offsetParent;
            } while (element);
        }
    return location
}



console.log("down");





/*window.addEventListener("click", function(event) {
    if (document.querySelector(".highlight-notes-circle-menu-container")) {
        if (!event.target.classList.contains("highlight-notes-round-button")) {
            if (closeHighlight === 1) {
                let timestamp = getEarlierTimestamp();
                let earlyHighlights = document.querySelectorAll(`[data-timestamp = "${timestamp}"]`);
        
                for (let tag of earlyHighlights) {
                    tag.style.backgroundColor = "transparent";
                    tag.classList.add("highlight-notes-hilight-to-be-discarded")
                }
                closeHighlight = 0;
                //let highlightMenu = document.querySelector(`[timestamp = "${timestamp}"]`);//not just any element with this timestamp bc it 
                //highlightMenu.parentNode.removeChild(highlightMenu);                       //could be any element, but the container menu  
            } else {
                closeHighlight++;
            }    
        }
    }
})*/

/*

window.addEventListener("click", function(event) {
    let selectedHighlights = document.querySelectorAll(".highlight-notes-color-has-not-been-picked");
    
    let numberOfSelections = countSelections(selectedHighlights);
    if (numberOfSelections.length > 1) {
        numberOfSelections.sort((a,b) => a-b);
        for (let tag of selectedHighlights) {
            if (Number(tag.getAttribute("data-timestamp")) !== numberOfSelections[numberOfSelections.length-1]) {
                tag.style.backgroundColor = "transparent";
                tag.classList.remove("highlight-notes-color-has-not-been-picked");
                tag.classList.add("highlight-notes-hilight-to-be-discarded");
            }
        }
        /*for (let stamp of numberOfSelections) {
            if (stamp !== numberOfSelections[numberOfSelections.length - 1]) {
                let colorMenu = document.querySelector(`[timestamp = "${stamp}"]`);
                colorMenu.parentNode.removeChild(colorMenu);
            }
        }*/
    } //else if (numberOfSelections.length === 1) {
        
    //}
})



function countSelections(selectedHighlights) {
    let uniqueTimestamps = [];

    for (let tag of selectedHighlights) {
        if (!uniqueTimestamps.includes(tag.getAttribute('data-timestamp'))) {
            uniqueTimestamps.push(Number(tag.getAttribute('data-timestamp')));
        }
    }
    console.log(uniqueTimestamps);
    return uniqueTimestamps;
}









function createInitialColorMenu(highlights, timestamp, range) {
    
    //Creates the container that holds the menu
    let menuContainer = document.createElement("div");
    menuContainer.classList.add("highlight-notes-circle-menu-container");
    //menuContainer.setAttribute("timestamp", `${timestamp}`);

    //Creates the little highlighter icon 
    let highlighterIcon = document.createElement("img");
    let imageURL = chrome.runtime.getURL("main-icon.svg");
    highlighterIcon.setAttribute("src", `${imageURL}`);
    highlighterIcon.classList.add("highlight-notes-menu-button-menu-icon");

    //Creates the main color menu button
    let colorMenu = document.createElement("div");
    colorMenu.classList.add("highlight-notes-round-button");
    colorMenu.appendChild(highlighterIcon);
    colorMenu.classList.add("highlight-notes-main-menu-button");

    //Creates a div that occupies the empty space between the main
    //color menu button and the color option bubbles in order to keep
    //the menu "expanded" on hover
    let emptySpace = document.createElement("div");
    emptySpace.classList.add("highlight-notes-menu-empty-space");

    //Attaches the highlighter icon to the main color menu button
    colorMenu.appendChild(highlighterIcon);

    //Attaches the main color menu button to the menu container
    menuContainer.appendChild(colorMenu);
    
    //Attaches the "empty space" div to the menu container
    menuContainer.appendChild(emptySpace);

    //Creates an array with the available highlight colors
    let highlightColors = ["#FFCAD7", "#B4FFEB", "#D1FF61", "#ffff7b"];
    
    //Goes through the array of highlight colors, calls a function that
    //creates a color option for the color menu, and attaches the option
    //to the color menu container
    for (let highlightColor of highlightColors) {
        let colorBubble = createColorBubble(highlightColor, timestamp, menuContainer, range);
        menuContainer.appendChild(colorBubble);
    }

    //When the user hovers over color menu container or any of its children
    //the menu "expands" to show all of the highlight color options
    menuContainer.addEventListener("mouseover", function(event) {
        let element = event.target;
        while (!element.classList.contains("highlight-notes-circle-menu-container")) {
            element = element.parentNode;
        }
        let menuContainerChildren = element.childNodes; 
        
        menuContainerChildren[0].classList.add("highlight-notes-menu-opened");
        menuContainerChildren[1].style.transform = "scaleX(3) scaleY(2.5)";
        menuContainerChildren[2].style.animation = "colorOptionOne .4s forwards";
        menuContainerChildren[3].style.animation = "colorOptionTwo .4s forwards";
        menuContainerChildren[4].style.animation = "colorOptionThree .4s forwards";
        menuContainerChildren[5].style.animation = "colorOptionFour .4s forwards";
    })

    //When the user's mouse leaves the color menu container or any of its children
    //the menu "collapses" and the highlight color options hide behind the main menu button
    menuContainer.addEventListener("mouseleave", function(event) {
        let element = event.target;
        while (!element.classList.contains("highlight-notes-circle-menu-container")) {
            element = element.parentNode;
        }
        let menuContainerChildren = element.childNodes; 
        
        menuContainerChildren[0].classList.remove("highlight-notes-menu-opened");
        menuContainerChildren[1].style.transform = "scaleX(0) scaleY(0)";
        menuContainerChildren[2].style.animation = "moveBackOne .6s forwards";
        menuContainerChildren[3].style.animation = "moveBackTwo .6s forwards";
        menuContainerChildren[4].style.animation = "moveBackThree .6s forwards";
        menuContainerChildren[5].style.animation = "moveBackFour .6s forwards";
    })

    //Attaches the menu to the DOM and animates the color menu button
    document.querySelector("body").appendChild(menuContainer);
    colorMenu.style.animation = "appears2 .6s forwards";
}


function createColorBubble(highlightColor, timestamp, menuContainer, range) {
    
    //Creates a bubble that represents a color option for the highlight
    let bubble = document.createElement("div");
    bubble.classList.add("highlight-notes-round-button");
    bubble.classList.add("highlight-notes-menu-color-bubble-option");
    bubble.style.backgroundColor = highlightColor;
    bubble.style.animation = "appears2 .6s forwards";
    
    //When the user clicks one of the color options, the color of the bubble
    //is applied to the highlights, the color menu container is removed 
    //from the DOM, and a message is sent to background.js to save this 
    //highlight along with its relevant info
    bubble.addEventListener("click", function(event) {
        event.stopPropagation();

        let highlights = document.querySelectorAll(".highlight-notes-color-has-not-been-picked");
        let selectedText = "";

        for (let spanTag of highlights) {
            spanTag.classList.remove("highlight-notes-color-has-not-been-picked");
            spanTag.style.backgroundColor = bubble.style.backgroundColor;
            spanTag.style.cursor = "pointer";
            selectedText = selectedText + spanTag.innerText;
        }
        menuContainer.parentNode.removeChild(menuContainer);
        

        //for (let node of document.body.childNodes) {
        //    console.log(node);
        //}


        chrome.runtime.sendMessage({ 
                                    "text": "new highlight",
                                    "timestamp": timestamp,
                                    "highlightColor": bubble.style.backgroundColor,
                                    "highlightText": range.toString(),
                                    "dateCreated": (new Date()).toString(),
                                    "url": window.location.href,
                                    "websiteName": window.location.hostname,
                                    "tags": [],
                                    "notes": "",
                                    "hidden": false,
                                    "range": {
                                        "startOffset": range.startOffset,
                                        "endOffset": range.endOffset,
                                        "startNode": [range.getClientRects()[0].x, range.getClientRects()[0].y],
                                        "endNode": [range.getClientRects()[range.getClientRects().length - 1].x, range.getClientRects()[range.getClientRects().length - 1].y]
                                    }
                                });
    })

    return bubble;
}


function createEditMenu(range, highlights, timestamp) {

    //Makes sure that only "finished" highlights (those that have had their color selected already)
    //get access to this edit menu
    if (!highlights[0].classList.contains(".highlight-notes-color-has-not-been-picked")) {

        //Creates the container that holds the menu
        let editMenuContainer = document.createElement("div");
        editMenuContainer.classList.add("highlight-notes-circle-edit-container");
        editMenuContainer.setAttribute("timestamp", `${timestamp}`);

        //Creates the edit icon 
        let editIcon = document.createElement("img");
        let editURL = chrome.runtime.getURL("pencil-icon.svg");
        editIcon.setAttribute("src", `${editURL}`);
        editIcon.classList.add("highlight-notes-menu-button-menu-icon");

        //Creates the hide icon
        let hideIcon = document.createElement("img");
        let hideURL = chrome.runtime.getURL("monkey-icon.svg");
        hideIcon.setAttribute("src", `${hideURL}`);
        hideIcon.classList.add("highlight-notes-menu-button-menu-icon");

        //Creates the delete icon 
        let deleteIcon = document.createElement("img");
        let deleteURL = chrome.runtime.getURL("trash-can.svg");
        deleteIcon.setAttribute("src", `${deleteURL}`);
        deleteIcon.classList.add("highlight-notes-menu-button-menu-icon");

        //Creates the edit tooltip
        let editTooltip = document.createElement("div");
        editTooltip.classList.add("highlight-notes-edit-menu-tooltip");
        editTooltip.innerHTML = "<p>Edit</p><div></div>"

        //Creates the hide tooltip
        let hideTooltip = document.createElement("div");
        hideTooltip.classList.add("highlight-notes-edit-menu-tooltip");
        hideTooltip.innerHTML = "<p>Hide</p><div></div>"

        //Creates the delete tooltip
        let deleteTooltip = document.createElement("div");
        deleteTooltip.classList.add("highlight-notes-edit-menu-tooltip");
        deleteTooltip.innerHTML = "<p>Delete</p><div></div>"

        //Creates the edit button
        let editButton = document.createElement("div");
        editButton.classList.add("highlight-notes-round-edit-button");
        editButton.appendChild(editIcon);
        editButton.appendChild(editTooltip);
        editButton.classList.add("highlight-notes-main-menu-button");
        editButton.style.animation = "appears2 .6s forwards";

        //Creates the hide button
        let hideButton = document.createElement("div");
        hideButton.classList.add("highlight-notes-round-edit-button");
        hideButton.appendChild(hideIcon);
        hideButton.appendChild(hideTooltip);
        hideButton.classList.add("highlight-notes-main-menu-button");
        hideButton.style.animation = "appears2 .6s forwards";

        //Creates the cancel button
        let cancelButton = document.createElement("div");
        cancelButton.classList.add("highlight-notes-round-edit-button");
        cancelButton.appendChild(deleteIcon);
        cancelButton.appendChild(deleteTooltip);
        cancelButton.classList.add("highlight-notes-main-menu-button");
        cancelButton.style.animation = "appears2 .6s forwards";

        let buttons = [editButton, hideButton, cancelButton];
        
        //Makes the tooltips appear when user hovers over the buttons
        for (let button of buttons) {
            button.addEventListener("mouseover", function(event) {
                let element = event.target;
                while (!element.classList.contains("highlight-notes-round-edit-button")) {
                    element = element.parentNode;
                }
                element.childNodes[1].style.display = "flex";
            })
        }

        //Hides the tooltips when the mouse leaves the buttons
        for (let button of buttons) {
            button.addEventListener("mouseleave", function(event) {
                let element = event.target;
                while (!element.classList.contains("highlight-notes-round-edit-button")) {
                    element = element.parentNode;
                }
                element.childNodes[1].style.display = "none";
            })
        }

        //Triggers the function that creates and adds an edit form on click 
        editButton.addEventListener("click", function(event) {

        })


        //Triggers the creation of the delete pop-up 
        cancelButton.addEventListener("click", function(event) {
            event.stopPropagation();
            let tagsAboutToGetDeleted = document.querySelectorAll(`[data-timestamp = "${timestamp}"]`);
            for (let tag of tagsAboutToGetDeleted) {
                tag.style.backgroundColor = "transparent";
                tag.classList.add("highlight-notes-hilight-to-be-discarded");
            }
            editMenuContainer.parentNode.removeChild(editMenuContainer);
        })

        editMenuContainer.appendChild(editButton);
        editMenuContainer.appendChild(hideButton);
        editMenuContainer.appendChild(cancelButton);



        let clients = range.getClientRects();
        editMenuContainer.style.top = `${window.pageYOffset + clients[0].y - 40}px`;
        editMenuContainer.style.left = `${clients[0].left}px`;

        document.querySelector("body").appendChild(editMenuContainer);

    }    

}


function createEditForm() {

    //Creates the dark screen that sits on top of the websites content
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
    cancelIcon.setAttribute("src", "cancel-icon.svg");
    cancelIcon.classList.add("cancel-icon");

    cancelHolder.appendChild(cancelIcon);
    
    //Creates the pop-up's "theme" img
    let image = document.createElement("img");
    image.setAttribute("src", icon);
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


function getEarlierTimestamp() {
    let neverFinalizedHighlights = document.querySelectorAll(".highlight-notes-color-has-not-been-picked");
    let earliestTimestamp = Number(neverFinalizedHighlights[0].getAttribute("data-timestamp"));
    for (let tag of neverFinalizedHighlights) {
        if (!tag.classList.contains("highlight-notes-hilight-to-be-discarded"))
            if (Number(tag.getAttribute("data-timestamp")) < earliestTimestamp ) {
                earliestTimestamp = Number(tag.getAttribute("data-timestamp"));
            }
    }
    return earliestTimestamp;
}





//fix the slideout distance when closes  



/*window.addEventListener("mouseup", function() {
    if (window.getSelection().toString()) {
        
        
        let text = window.getSelection().toString();
        let range = window.getSelection().getRangeAt("0");
        
        var hltr = new TextHighlighter(document.body);


        console.log("something got selected");

        let menu = document.createElement("div");
        
        let topHighlight = document.querySelector(".highlighted").parentNode();
        topHighlight.setAttribute("position", "relative");
        menu.classList.add("highlight-notes-round-button");

        topHighlight.appendChild(menu);
        


        /*chrome.runtime.sendMessage({ 
                                    "text": "new highlight",
                                    "highlight": text,
                                    "dateCreated": (new Date()).toString(),
                                    "dateCreatedNumber": Date.now(),
                                    "url": window.location.href,
                                    "websiteName": window.location.hostname,
                                    "range": range
                                });*/
 /*   } else {
        console.log("nothing got selected");
    }
})
*/





function createHighlightMenu() {
    let menu = document.createElement("div");
    menu.classList.add(".highlight-notes-round-button");
    
    let topHighlight = document.querySelector(".highlighted");
    topHighlight.setAttribute("position", "relative");
    menu.setAttribute("position", "absolute");
}




/*////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// */







/*function createHighlightButton(element) {
    let highlightButton = document.createElement("div");
    highlightButton.classList.add("highlight-notes-round-button");
    return highlightButton;
    //element.style.position = "relative";
    //element.appendChild(highlightButton);

}


function makeEditableAndHighlight(colour) {
    sel = window.getSelection();
    if (sel.rangeCount && sel.getRangeAt) {
        range = sel.getRangeAt(0);
    }
    document.designMode = "on";
    if (range) {
        sel.removeAllRanges();
        sel.addRange(range);
    }
    // Use HiliteColor since some browsers apply BackColor to the whole block
    document.execCommand("hiliteColor", true, colour);
    document.designMode = "off";
}

function highlight(colour) {
    var range, sel;
    if (window.getSelection) {
        // IE9 and non-IE
        try {
            if (!document.execCommand("BackColor", false, colour)) {
                makeEditableAndHighlight(colour);
            }
        } catch (ex) {
            makeEditableAndHighlight(colour)
        }
    } else if (document.selection && document.selection.createRange) {
        // IE <= 8 case
        range = document.selection.createRange();
        range.execCommand("BackColor", false, colour);
    }
}


function getSafeRanges(dangerous) {
    var a = dangerous.commonAncestorContainer;
    // Starts -- Work inward from the start, selecting the largest safe range
    var s = new Array(0), rs = new Array(0);
    if (dangerous.startContainer != a)
        for(var i = dangerous.startContainer; i != a; i = i.parentNode)
            s.push(i)
    ;
    if (0 < s.length) for(var i = 0; i < s.length; i++) {
        var xs = document.createRange();
        if (i) {
            xs.setStartAfter(s[i-1]);
            xs.setEndAfter(s[i].lastChild);
        }
        else {
            xs.setStart(s[i], dangerous.startOffset);
            xs.setEndAfter(
                (s[i].nodeType == Node.TEXT_NODE)
                ? s[i] : s[i].lastChild
            );
        }
        rs.push(xs);
    }

    // Ends -- basically the same code reversed
    var e = new Array(0), re = new Array(0);
    if (dangerous.endContainer != a)
        for(var i = dangerous.endContainer; i != a; i = i.parentNode)
            e.push(i)
    ;
    if (0 < e.length) for(var i = 0; i < e.length; i++) {
        var xe = document.createRange();
        if (i) {
            xe.setStartBefore(e[i].firstChild);
            xe.setEndBefore(e[i-1]);
        }
        else {
            xe.setStartBefore(
                (e[i].nodeType == Node.TEXT_NODE)
                ? e[i] : e[i].firstChild
            );
            xe.setEnd(e[i], dangerous.endOffset);
        }
        re.unshift(xe);
    }

    // Middle -- the uncaptured middle
    if ((0 < s.length) && (0 < e.length)) {
        var xm = document.createRange();
        xm.setStartAfter(s[s.length - 1]);
        xm.setEndBefore(e[e.length - 1]);
    }
    else {
        return [dangerous];
    }

    // Concat
    rs.push(xm);
    response = rs.concat(re);    

    // Send to Console
    return response;
}

function highlightSelection() {
    var userSelection = window.getSelection().getRangeAt(0);
    var safeRanges = getSafeRanges(userSelection);
    for (var i = 0; i < safeRanges.length; i++) {
        if (safeRanges[i].toString()) {
            console.log(safeRanges[i]);
            highlightRange(safeRanges[i]); 
        }
    }
}


function highlightRange(range) {
    var newNode = document.createElement("mark");
    newNode.setAttribute("style", "background-color: pink;");

    range.surroundContents(newNode);
}





function doSearch(text) {
    if (window.find && window.getSelection) {
        document.designMode = "on";
        var sel = window.getSelection();
        sel.collapse(document.body, 0);

        while (window.find(text)) {
            document.execCommand("HiliteColor", false, "yellow");
            sel.collapseToEnd();
        }
        document.designMode = "off";
    } else if (document.body.createTextRange) {
        var textRange = document.body.createTextRange();
        while (textRange.findText(text)) {
            textRange.execCommand("BackColor", false, "yellow");
            textRange.collapse(false);
        }
    }
}*/



function checkStatus() {
    if (document.querySelector(".highlight-notes-sidebar")) {
        console.log("the sidebar is open");
        document.querySelector(".highlight-notes-sidebar").style.animation = "slideOut .4s forwards";
    } else {
        console.log("the sidebar is closed");
        let sidebar = buildSidebar();
        sidebar.style.animation = "slideIn .4s forwards";
        document.querySelector("body").appendChild(sidebar);
        
    }
}


function buildSidebar() {
    let sidebar = document.createElement("div");
    sidebar.classList.add("highlight-notes-sidebar");

    let cancelIcon = document.createElement("img");
    cancelIcon.setAttribute("src", "cancel-icon-white.svg");

    let header = document.createElement("header");
    header.classList.add("highlight-notes-header");
    header.appendChild(cancelIcon);

    sidebar.appendChild(header);
    return sidebar;
}