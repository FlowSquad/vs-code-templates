import * as vscode from 'vscode';

/**
 * Example for a custom text editor
 * This editor will open on '.example'-Files in VS-Code.
 */
export class CustomTextEditor implements vscode.CustomTextEditorProvider {

    public static readonly viewType = 'custom-text-editor';

    /**
     * Register the CustomTextEditorProvider
     * @param context The context of our extension
     * @returns a disposable
     */
    public static register(context: vscode.ExtensionContext): vscode.Disposable {
        const provider = new CustomTextEditor(context);
        return vscode.window.registerCustomEditorProvider(CustomTextEditor.viewType, provider);
    }

    public constructor(
        private readonly context: vscode.ExtensionContext
    ) {
    }

    /**
     * Called when the custom editor is opened.
     * @param document Represents the source file (.example)
     * @param webviewPanel The panel which contains the webview
     * @param token A cancellation token that indicates that the result is no longer needed
     */
    public async resolveCustomTextEditor(
        document: vscode.TextDocument,
        webviewPanel: vscode.WebviewPanel,
        token: vscode.CancellationToken
    ): Promise<void> {

        let isUpdateFromWebview = false;
        let isBuffer = false;

        // Setup initial content for the webview
        webviewPanel.webview.options = {
            enableScripts: true
        };

        webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview, this.context.extensionUri);

        // Manage received messages from the webview
        webviewPanel.webview.onDidReceiveMessage((event) => {
            switch (event.type) {
                case CustomTextEditor.viewType + '.updateFromWebview':
                    isUpdateFromWebview = true;
                    this.updateTextDocument(document, event.content);
                    break;
            }
        });

        // Send the content from the extension to the webview
        const updateWebview = (msgType: string) => {
            if (webviewPanel.visible) {
                webviewPanel.webview.postMessage({
                    type: msgType,
                    text: document.getText()
                })
                    .then((success) => {
                        if (success) {
                            // ...
                        }
                    }, (reason) => {
                        // If the editor is closed and the changes are not being saved the text editor does an undo,
                        // which will trigger this function and try to send a message to the destroyed webview.
                        if (!document.isClosed) {
                            console.error('Custom Text Editor', reason);
                        }
                    });
            }
        };

        /**
         * When changes are made inside the webview a message to the extension will be sent with the new data.
         * This will also change the model (= document). If the model is changed the onDidChangeTextDocument event
         * will trigger and the SAME data would be sent back to the webview.
         * To prevent this we check from where the changes came from (webview or somewhere else).
         * If the changes are made inside the webview (isUpdateFromWebview === true) then we will send NO data
         * to the webview. For example if the changes are made inside a separate editor then the data will be sent to
         * the webview to synchronize it with the current content of the model.
         */
        const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument((event) => {
            if (event.document.uri.toString() === document.uri.toString() && event.contentChanges.length !== 0) {

                // If the webview is in the background then no messages can be sent to it.
                // So we have to remember that we need to update its content the next time the webview regain its focus.
                if (!webviewPanel.visible) {
                    isBuffer = true;
                    return;
                }

                // Update the webviews content.
                switch (event.reason) {
                    case 1: {   // Undo
                        updateWebview(CustomTextEditor.viewType + '.undo');
                        break;
                    }
                    case 2: {   // Redo
                        updateWebview(CustomTextEditor.viewType + '.redo');
                        break;
                    }
                    case undefined: {
                        // If the initial update came from the webview then we don't need to update the webview.
                        if (!isUpdateFromWebview) {
                            updateWebview(CustomTextEditor.viewType + '.updateFromExtension');
                        }
                        isUpdateFromWebview = false;
                        break;
                    }
                }
            }
        });

        // Called when the view state changes (e.g. user switches the tab)
        webviewPanel.onDidChangeViewState(() => {
            switch (true) {
                case webviewPanel.active: {
                    /* falls through */
                }
                case webviewPanel.visible: {
                    // If changes has been made while the webview was not visible no messages could have been sent to the
                    // webview. So we have to update the webview if it gets its focus back.
                    if (isBuffer) {
                        updateWebview(CustomTextEditor.viewType + '.updateFromExtension');
                        isBuffer = false;
                    }
                }
            }
        });

        // Cleanup after editor was closed.
        webviewPanel.onDidDispose(() => {
            changeDocumentSubscription.dispose();
        });

        updateWebview(CustomTextEditor.viewType + '.updateFromExtension');
    }

    /**
     * Get the HTML-Document which display the webview
     * @param webview Webview belonging to the panel
     * @param extensionUri Uri to our project
     * @returns a string which represents the html content
     */
    private getHtmlForWebview(webview: vscode.Webview, extensionUri: vscode.Uri) {

        const scriptApp = webview.asWebviewUri(vscode.Uri.joinPath(
            extensionUri, 'dist', 'client', 'client.mjs'
        ));

        const styleReset = webview.asWebviewUri(vscode.Uri.joinPath(
            extensionUri, 'resources', 'css', 'reset.css'
        ));

        const styleApp = webview.asWebviewUri(vscode.Uri.joinPath(
            extensionUri, 'dist', 'client', 'style.css'
        ));

        const nonce = this.getNonce();

        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="utf-8" />

                <meta http-equiv="Content-Security-Policy" content="default-src 'none';
                    style-src ${webview.cspSource} 'unsafe-inline';
                    img-src ${webview.cspSource} data:;
                    script-src 'nonce-${nonce}';"/>

                <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                
                <link href="${styleReset}" rel="stylesheet" type="text/css" />
                <link href="${styleApp}" rel="stylesheet" type="text/css" />

                <title>Custom Text Editor Example</title>
            </head>
            <body>
              <div class="content">
                <textarea id="editor"></textarea>
              </div>
              
              <script type="text/javascript" src="${scriptApp}" nonce="${nonce}"></script>
            </body>
            </html>
        `;
    }

    private getNonce(): string {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 32; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }

    /**
     * Saves the changes to the source file
     * @param document The source file
     * @param text The data which was sent from the webview
     * @returns
     */
    private updateTextDocument(document: vscode.TextDocument, text: string): Thenable<boolean> {
        const edit = new vscode.WorkspaceEdit();

        edit.replace(
            document.uri,
            new vscode.Range(0, 0, document.lineCount, 0),
            text
        );

        return vscode.workspace.applyEdit(edit);
    }
}