console.log("background running");

// Creates a context menu option for the menu that appears
// when a user right-clicks anywhere on a page
let contextMenuItem = {
    "id": "createNote",
    "title": "Create Note",
    "contexts": ["selection"]
};
chrome.contextMenus.create(contextMenuItem);

// Background listens for the user to click the aforementioned 
// context menu option. If the user has selected/highlighted any text,
// a message is sent to the content file containing an array of objects that
// represent existing tags. If the user has not created any tags yet, a string 
// is sent instead.
chrome.contextMenus.onClicked.addListener(function(optionClicked) {
    if (optionClicked.menuItemId === "createNote" && optionClicked.selectionText) {
        console.log("button clicked");
        chrome.tabs.query({active:true, currentWindow:true}, function(tabs) {
            chrome.storage.sync.get("tags", function(memoryObject) {
                if (memoryObject.tags) {
                    chrome.tabs.sendMessage(tabs[0].id, memoryObject.tags);
                } else {
                    chrome.tabs.sendMessage(tabs[0].id, "No tags");
                }
            })
        })
    }
})

// Listens for a message sent from the content file that contains info about a 
// newly created note, gives the note a default title, updates the tag objects 
// if the user attached any tags to the note, and commits these updates and the 
// the new note to chrome storage 
chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse) {
        chrome.storage.sync.get(["notes", "untitled", "tags"], function(memoryObject) {
            if (!memoryObject.notes) {
                memoryObject.untitled = 0;
                message.title = "Untitled";
                memoryObject.notes = [message];

            } else {
                memoryObject.untitled++;
                message.title = `Untitled-${memoryObject.untitled}`
                memoryObject.notes.push(message);
            }
            if (memoryObject.tags && message.tags.length !== 0) {
                for (let newTag of message.tags) {
                    for (let existingTag of memoryObject.tags) {
                        if (newTag === existingTag.tagName) {
                            existingTag.tagNumber++
                            break;
                        }
                    }
                }
            }
            chrome.storage.sync.set({"notes": memoryObject.notes, "untitled": memoryObject.untitled, "tags": memoryObject.tags});
        })
    }
)

// Listens for the user to click the extensions icon in the 
// top-right corner and runs the function that opens the options 
// page in a new tab
chrome.browserAction.onClicked.addListener(function(tab) {
    openOptionsPage();
 });

// Opens the options page in a new tab or switches to it if it 
// is already open 
function openOptionsPage() {
   let optionsUrl = chrome.extension.getURL('options.html'); 
   chrome.tabs.query({}, function(extensionTabs) {
      let found = false;
      for (let i=0; i < extensionTabs.length; i++) {
         if (optionsUrl == extensionTabs[i].url) {
            found = true;
            console.log("tab id: " + extensionTabs[i].id);
            chrome.tabs.update(extensionTabs[i].id, {"selected": true});
         }
      }
      if (found == false) {
          chrome.tabs.create({url: "options.html"});
      }
   });
}


