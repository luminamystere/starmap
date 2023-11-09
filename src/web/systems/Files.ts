namespace Files {

    let objectUrl: string | undefined;
    export function downloadBinary (fileName: string, array: Uint8Array) {
        return downloadBlob(fileName, new Blob([array], { type: "application/octet-stream" }));
    }

    type JSONValue<T = never> = null | string | boolean | number | T;
    type JSONObject = { [key in string]: JSONValue<JSONObject | JSONArray> };
    type JSONArray = Array<JSONValue<JSONObject | JSONArray>>;
    type JSON = JSONValue<JSONObject | JSONArray>;

    export function downloadJSON (fileName: string, data: JSON) {
        return downloadString(fileName, JSON.stringify(data), "text/json");
    }

    export function downloadString (fileName: string, data: string, type = "text/plain") {
        return downloadBlob(fileName, new Blob([data], { type }));
    }

    function downloadBlob (fileName: string, blob: Blob) {
        clearObjectUrl();

        objectUrl = URL.createObjectURL(blob);

        const linkElement = document.createElement("a");
        linkElement.href = objectUrl;
        linkElement.download = fileName;

        linkElement.click();
        linkElement.remove();
    }

    function clearObjectUrl () {
        if (objectUrl) {
            URL.revokeObjectURL(objectUrl);
            objectUrl = undefined;
        }
    }

    export async function uploadJSONFromEvent<TYPE extends JSON> (event: Event): Promise<TYPE | undefined> {
        const file = getFileFromEvent(event);
        return file && uploadJSON<TYPE>(file);
    }

    export async function uploadStringFromEvent (event: Event): Promise<string | undefined> {
        const file = getFileFromEvent(event);
        return file && uploadString(file);
    }

    export async function uploadBinaryFromEvent (event: Event): Promise<Uint8Array | undefined> {
        const file = getFileFromEvent(event);
        return file && upload(file);
    }

    async function uploadJSON<TYPE extends JSON> (file: File): Promise<TYPE | undefined> {
        try {
            const string = await uploadString(file);
            return string ? JSON.parse(string) : undefined;
        } catch (err) {
            console.warn(err);
        }
    }

    async function uploadString (file: File): Promise<string | undefined> {
        try {
            return new TextDecoder().decode(await upload(file));
        } catch (err) {
            console.warn(err);
        }
    }

    function getFileFromEvent (event: Event): File | undefined {
        return getFilesFromEvent(event)[0];
    }

    function getFilesFromEvent (event: Event) {
        const inputEvent = event as Partial<InputEvent> & Partial<DragEvent>;
        const dataTransferFiles = inputEvent.dataTransfer?.files;
        if (dataTransferFiles) {
            return [...dataTransferFiles];
        }

        const input = inputEvent.target as HTMLInputElement;
        const inputFiles = input.files;
        if (inputFiles) {
            const files = [...inputFiles];
            input.value = "";
            return files;
        }

        return [];
    }

    async function upload (file: File): Promise<Uint8Array | undefined> {
        return file.arrayBuffer()
            .then(buffer => new Uint8Array(buffer))
            .catch(err => {
                console.warn(err);
                return undefined;
            });
    }
}

export default Files;