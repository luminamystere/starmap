import vfs from "vinyl-fs";
import File from "vinyl";
import dotenv from "dotenv";

//loop through all src/**/*.ts files
//when reaching "pro" in a comment, remove everything until "endpro"
dotenv.config();
if (process.env.STARMAP_STRIPPINGPRO) {

    const regexPro = /\/\/#pro.*?\/\/#endpro/gs;

    vfs.src(["src/**/*.ts"])
        .on("data", (file: File) => {
            if (!file.contents)
                return;

            const text = file.contents.toString("utf8");
            const updatedText = text.replace(regexPro, "");
            if (text === updatedText)
                return;

            console.log("stripping pro from ", file.path/*, updatedText*/);
            file.contents = Buffer.from(updatedText);
        })
        .on("end", () => console.log("finished!"));

} else {
    console.log("requires STARMAP_STRIPPINGPRO :(");
    process.exit(1);
}