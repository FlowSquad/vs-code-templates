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

    if (ENV === "vscode") {
        vscode = acquireVsCodeApi();

        const state = vscode.getState();
        if (state) {
            editor.value = state.text;
        }

        window.addEventListener('message', (event) => {
            const message = event.data;
            switch (message.type) {
                case 'custom-text-editor.updateFromExtension':
                    editor.value = message.text;
            }
        });

    } else if (ENV === "browser") {
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
        if (ENV === 'vscode') {
            vscode.setState({
                text: editor.value
            });
            vscode.postMessage({
                type: 'custom-text-editor.updateFromWebview', content: editor.value
            });
        } else if (ENV === 'browser') {
            textarea.value = editor.value;
        }
    });
}());