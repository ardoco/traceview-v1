import os

# extract the data we need to build a usage/implementation graph of a typescript project

def extractImports(lines, includeFunctions=False):
    imports = []
    for line in lines:
        if line.startswith("import") and "{" in line and "}" in line:
            imported = [s.strip() for s in line.split("{")[1].split("}")[0].split(",")]
            imported = [s for s in imported if includeFunctions or (len(s) > 0) and s[0].isupper()]
            imports.extend(imported)
    return imports

def genericInheritanceExtractor(lines, keyword):
    implementations = []
    for line in lines:
        if "class" in line and keyword in line:
            segments = line.split(" ")
            className = segments[segments.index("class") + 1]
            interfaceNames = [s.strip() for s in line.split(keyword)[1].split(",")]
            if "{" in interfaceNames[-1]:
                interfaceNames[-1] = interfaceNames[-1].split("{")[0].strip()
            implementations.append((className, interfaceNames))
    return implementations

def extractImplementations(lines):
    return genericInheritanceExtractor(lines, "implements")

def extractExtends(lines):
    return genericInheritanceExtractor(lines, "extends")

def recursivelyGetAllSourceFiles(rootFolder):
    sourceFiles = []
    for root, dirs, files in os.walk(rootFolder):
        for file in files:
            if file.endswith(".ts"):
                sourceFiles.append(os.path.join(root, file))
    return sourceFiles


files = recursivelyGetAllSourceFiles(os.path.join(os.getcwd(), "src"))
for file in files:
    fileContent = open(file, "r", encoding="utf8").readlines()
    imports = extractImports(fileContent)
    implementations = extractImplementations(fileContent)
    extends = extractExtends(fileContent)
    if len(implementations) > 0:
        print(file, "\nIMPORT", imports, "\nIMPLEMENT", implementations, "\nEXTENDS", extends, "\n")