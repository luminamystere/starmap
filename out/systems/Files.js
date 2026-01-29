var Files;
(function (Files) {
    let objectUrl;
    function downloadBinary(fileName, array) {
        return downloadBlob(fileName, new Blob([array], { type: "application/octet-stream" }));
    }
    Files.downloadBinary = downloadBinary;
    function downloadJSON(fileName, data) {
        return downloadString(fileName, JSON.stringify(data), "text/json");
    }
    Files.downloadJSON = downloadJSON;
    function downloadString(fileName, data, type = "text/plain") {
        return downloadBlob(fileName, new Blob([data], { type }));
    }
    Files.downloadString = downloadString;
    function downloadBlob(fileName, blob) {
        clearObjectUrl();
        objectUrl = URL.createObjectURL(blob);
        const linkElement = document.createElement("a");
        linkElement.href = objectUrl;
        linkElement.download = fileName;
        linkElement.click();
        linkElement.remove();
    }
    function clearObjectUrl() {
        if (objectUrl) {
            URL.revokeObjectURL(objectUrl);
            objectUrl = undefined;
        }
    }
    async function uploadJSONFromEvent(event) {
        const file = getFileFromEvent(event);
        return file && uploadJSON(file);
    }
    Files.uploadJSONFromEvent = uploadJSONFromEvent;
    async function uploadStringFromEvent(event) {
        const file = getFileFromEvent(event);
        return file && uploadString(file);
    }
    Files.uploadStringFromEvent = uploadStringFromEvent;
    async function uploadBinaryFromEvent(event) {
        const file = getFileFromEvent(event);
        return file && upload(file);
    }
    Files.uploadBinaryFromEvent = uploadBinaryFromEvent;
    async function uploadJSON(file) {
        try {
            const string = await uploadString(file);
            return string ? JSON.parse(string) : undefined;
        }
        catch (err) {
            console.warn(err);
        }
    }
    async function uploadString(file) {
        try {
            return new TextDecoder().decode(await upload(file));
        }
        catch (err) {
            console.warn(err);
        }
    }
    function getFileFromEvent(event) {
        return getFilesFromEvent(event)[0];
    }
    function getFilesFromEvent(event) {
        const inputEvent = event;
        const dataTransferFiles = inputEvent.dataTransfer?.files;
        if (dataTransferFiles) {
            return [...dataTransferFiles];
        }
        const input = inputEvent.target;
        const inputFiles = input.files;
        if (inputFiles) {
            const files = [...inputFiles];
            input.value = "";
            return files;
        }
        return [];
    }
    async function upload(file) {
        return file.arrayBuffer()
            .then(buffer => new Uint8Array(buffer))
            .catch(err => {
            console.warn(err);
            return undefined;
        });
    }
})(Files || (Files = {}));
export default Files;
