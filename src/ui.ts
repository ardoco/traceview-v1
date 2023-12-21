import { select } from "d3";

export function addPlaceholder(parent : HTMLElement, width : string, height : string, text : string[], fontSize : string,listener : () => void) {
    const placeholder = document.createElement('div');
    placeholder.style.height = height;
    placeholder.style.height = height;
    placeholder.style.width = width;
    placeholder.classList.add("placeholder-shared");
    placeholder.style.fontSize = fontSize;
    for (let line of text) {
        const lineDiv = document.createElement('div');
        lineDiv.appendChild(document.createTextNode(line));
        placeholder.appendChild(lineDiv);
    }
    parent.appendChild(placeholder);
}

export function addFileInputPlaceholder(parent : HTMLElement, width : string, height : string, text : string, fontSize : string, listener : (fileContent : string) => boolean) {
    const placeholder = document.createElement('div');
    parent.appendChild(placeholder);
    placeholder.style.width = width;
    placeholder.style.height = height;
    placeholder.style.fontSize = fontSize;
    const subHeights = ["40%","20%","40%"];
    const justifies = ["flex-end","center","flex-start"];
    const fontSizes = [fontSize,fontSize,"20px"];
    for (let i = 0; i < 3; i++) {
        const div = document.createElement('div');
        div.style.width = "100%";
        div.style.height = subHeights[i];
        div.style.display = "flex";
        div.style.justifyContent = justifies[i];
        div.style.fontSize = fontSizes[i];
        div.style.alignItems = "center";
        div.classList.add("placeholder-shared");
        placeholder.appendChild(div);
    }
    // TODO use top,middle,bottom ; implement color change on file upload
    const top = placeholder.firstChild! as HTMLElement;
    const middle = top.nextSibling! as HTMLElement;;
    const bottom = middle.nextSibling! as HTMLElement;
    placeholder.firstChild!.appendChild(document.createTextNode(text));
    placeholder.firstChild!.nextSibling!.appendChild(document.createTextNode("+"));
    placeholder.addEventListener("click", (event) => {
        event.stopPropagation();
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.click();
        fileInput.addEventListener("change", () => {
            const selectedFile = fileInput.files && fileInput.files[0];
            if (selectedFile) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const fileContent = event.target!.result;
                    if (listener(fileContent as string)) {
                        (placeholder.firstChild?.nextSibling as HTMLElement).innerHTML = "";
                        (placeholder.firstChild?.nextSibling as HTMLElement).appendChild(document.createTextNode("✓"));
                    } else {
                        (placeholder.firstChild?.nextSibling as HTMLElement).innerHTML = "";
                        (placeholder.firstChild?.nextSibling as HTMLElement).appendChild(document.createTextNode("✗"));
                    }
                    console.log("File content:", fileContent);
                    (placeholder.lastChild as HTMLElement).innerHTML = "";
                    (placeholder.lastChild as HTMLElement).appendChild(document.createTextNode(selectedFile.name));
                    (placeholder.lastChild as HTMLElement).style.whiteSpace = "normal"; // or "normal" for text wrapping
                    (placeholder.lastChild as HTMLElement).style.overflow = "hidden";    // or "visible" if you want to show overflow
                }
                reader.readAsText(selectedFile);
            }
        }); 
    });
}