import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { QuillBinding } from 'y-quill'
import Quill from 'quill'
import QuillCursors from 'quill-cursors'

Quill.register('modules/cursors', QuillCursors)

var toolbarOptions = [
    ['bold', 'italic', 'underline', 'strike', 'link'],        // toggled buttons
    ['blockquote', 'code-block'],

    [{'header': 1}, {'header': 2}],               // custom button values
    [{'list': 'ordered'}, {'list': 'bullet'}, {'list': 'check'}],
    [{'script': 'sub'}, {'script': 'super'}],      // superscript/subscript
    [{'indent': '-1'}, {'indent': '+1'}],          // outdent/indent
    [{'direction': 'rtl'}],                         // text direction

    [{'size': ['small', false, 'large', 'huge']}],  // custom dropdown
    [{'header': [1, 2, 3, 4, 5, 6, false]}],

    [{'color': []}, {'background': []}],          // dropdown with defaults from theme
    ['image'],
    [{'font': []}],
    [{'align': []}],

    ['clean']                                         // remove formatting button
];
const quill = new Quill(document.querySelector('#editor'), {
    modules: {
        cursors: true,
        toolbar: toolbarOptions,
        history: {
            // Local undo shouldn't undo changes
            // from remote users
            userOnly: true
        }
    },
    placeholder: 'Start collaborating...',
    theme: 'snow' // 'bubble' is also great
})
quill.on('text-change', update);
var container = document.querySelector('#delta-container');
update();

// A Yjs document holds the shared data
const ydoc = new Y.Doc()

const provider = new WebsocketProvider('wss://demos.yjs.dev', 'quill-demo-chandler-2', ydoc)

// Define a shared text type on the document
const ytext = ydoc.getText('quill-1')

// All of our network providers implement the awareness crdt
const awareness = provider.awareness

// You can observe when a user updates their awareness information
awareness.on('change', changes => {
    // Whenever somebody updates their awareness information,
    // we log all awareness information from all users.
    // console.log(Array.from(awareness.getStates().values()))
})

// You can think of your own awareness information as a key-value store.
// We update our "user" field to propagate relevant user information.
awareness.setLocalStateField('user', {
    // Define a print name that should be displayed
    name: 'Emmanuelle Charpentier',
    // Define a color that should be associated to the user:
    color: '#9ac2c9' // should be a hex color
})

// "Bind" the quill editor to a Yjs text type.
const binding = new QuillBinding(ytext, quill, provider.awareness)

// Remove the selection when the iframe is blurred
window.addEventListener('blur', () => { quill.blur() })

const roomName = 'my-room-name'

const connectBtn = document.getElementById('y-connect-btn')
connectBtn.addEventListener('click', () => {
    if (provider.shouldConnect) {
        provider.disconnect()
        connectBtn.textContent = 'Connect'
    } else {
        provider.connect()
        connectBtn.textContent = 'Disconnect'
    }
})

// Get the text input element and submit button element
const inputTextEl = document.getElementById("input-text");
const submitBtnEl = document.getElementById("submit-btn");

// Add an event listener to the submit button to handle form submission
submitBtnEl.addEventListener("click", function(event) {
    event.preventDefault(); // prevent form from submitting
    const inputTextValue = inputTextEl.value;
    console.log("Input text value:", inputTextValue);
    // Do something with the input text value here...
    const jsonObject = JSON.parse(inputTextValue)
    console.log("jsonObject:", jsonObject);
    ytext.delete(0, ytext.length)
    ytext.applyDelta(jsonObject)
});

function update(delta) {
    var contents = quill.getContents();
    console.log('contents', contents);
    var html = "contents = " + JSON.stringify(contents, null, 2);
    if (delta) {
        console.log('change', delta)
        html = "change = " + JSON.stringify(delta, null, 2) + "\n\n" + html;
    }
    container.innerHTML = html;
}
