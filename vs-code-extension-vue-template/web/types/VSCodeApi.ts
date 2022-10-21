export type VsCode = {
    postMessage(message: VscMessage): void;
    getState(): VscState;
    setState(state: VscState): void;
};

type VscMessage = {
    type: string;
    content: JSON;
}

type VscState = {
    viewType: string;
    text: string;
}