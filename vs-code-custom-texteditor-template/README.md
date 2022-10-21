# VS Code BPMN Modeler

Template for custom text editor extension with plain javascript.

### Project structure
```
.
├── LICENSE
├── README.md
├── examples
├── package.json
├── tsconfig.json
├── resources
│   └── css
│       └── reset.css
├── src
│   ├── CustomTextEditor.ts
│   ├── extension.ts
│   ├── test
│   └── types
└── web
    ├── src
    │   ├── app.css
    │   ├── app.js
    │   └── index.html
    ├── tsconfig.json
    └── vite.config.js
```

### Quickstart
```shell
git clone https://github.com/FlowSquad/vs-code-bpmn-modeler.git
cd vs-code-bpmn-modeler
```
```shell
npm install
npm run web
```
```shell
code .
```
Open `Extension Host` with `F5` and open the example folder.

### Development
The `web folder` contains the necessary files for building the webapp we use later for our webview.  
So it is possible to develop the webview detached from the extension.  
For bundling the webview we use `vite`.  
**During development use `npm run web-dev` and open the index.html under `web/src/` with your preferred browser.
Since Electron uses Chromium using Chrome as your browser is a good idea.**

Does the webapp meet your requirements adjust your webviews html content.  
Extend your webapp, so it can communicate with your extension by using the `aquireVsCodeAPI`.  
For debugging your extension use `F5` inside vscode.  