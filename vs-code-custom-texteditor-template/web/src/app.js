import './app.css';

(function () {

    // Only for developing
    const ENVIRONMENTS = {
        Browser: 'browser',
        VsCode: 'vscode'
    };
    const ENV = ENVIRONMENTS.VsCode;

    const editor = /** @type HTMLTextAreaElement */ document.getElementById('editor');
    let vscode;
    let textarea;

    if (ENV === ENVIRONMENTS.VsCode) {
        vscode = acquireVsCodeApi();

        const state = vscode.getState();
        if (state) {
            editor.value = state.text;
        }

        window.addEventListener('message', (event) => {
            const message = event.data;
            switch (message.type) {
                case 'custom-text-editor.redo': {
                    editor.value = message.text;
                    break;
                }
                case 'custom-text-editor.undo': {
                    editor.value = message.text;
                    break;
                }
                case 'custom-text-editor.updateFromExtension': {
                    editor.value = message.text;
                    break;
                }
            }
        });

    } else if (ENV === ENVIRONMENTS.Browser) {
        const simulator = document.createElement('div');  // simulates vscode respectively the document
        textarea = document.createElement('textarea');
        const style = document.createElement('style');

        simulator.className = 'simulator';
        textarea.className = 'sim-document';
        style.textContent = `
       .content {
           height: 70%;
       }
       .simulator {
           width: 100%;
           height: 30%;
       }
       .sim-document {
           width: 100%;
           height: 100%;
           resize: none;
       }
    `;

        simulator.appendChild(style);
        simulator.appendChild(textarea);
        document.body.appendChild(simulator);
    }

    editor.addEventListener('input', () => {
        if (ENV === ENVIRONMENTS.VsCode) {
            vscode.setState({
                text: editor.value
            });
            vscode.postMessage({
                type: 'custom-text-editor.updateFromWebview', content: editor.value
            });
        } else if (ENV === ENVIRONMENTS.Browser) {
            textarea.value = editor.value;
        }
    });
}());