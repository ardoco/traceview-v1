# ArDoCo TraceView User Manual

ArDoCo TraceView is a static web application intended to be used to visualize artifacts and the traceability links (TLs) detected by ArDoCo.
The central use case is adding the required files to the application, instantiating visualizations and TLs for different levels of abstraction based on the input files and interactively examining the visualized TLs.
First, TraceView aims to make obvious at a glance which artifacts are not covered by any traceability links, which indicate incomplete documentation.
Second, it aims to provide a comfortable way to see which artifacts are connected to each other via TLs.

## Files

As of version 1.0, TraceView supports loading artifacts and traceability links (TLs) from the following file types:
- .uml, which will be parsed into an UMLModel object [(example)](https://github.com/ArDoCo/Benchmark/blob/main/teastore/model_2020/uml/teastore.uml)
- .acm, which will be parsed into a CodeModel object [(example)](https://raw.githubusercontent.com/ArDoCo/Benchmark/main/teastore/model_2022/code/codeModel.acm)
- any plain text format, each line of which is interpreted as a sentence and parsed into an array of NLSentence objects
- .json, which will be parsed into an array of TLs and axis-aligned bounding boxes for image based visualizations
- image formats supported by the desired visualization (as of 1.0 the diagram visualization supports any format supported by [HTMLImageElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement))

Before files can be used as inputs they need to be added to the application's file manager.\
You can see how many files have been added to the application, see the number to the right of the file manager button  (folder symbol) in the application's header.\
Hovering above the file manager button while open a dropdown menu listing all files currently available and hovering over the entries will show a preview of their contents.\
To add files, drag them from your system's explorer and drop them anywhere on the page. \
Adding files via drag and dropping a folder is not supported but multiple files can be added at a time.

## Visualizations

Once input files have been added, they can be used to create visualizations.\
To create a visualization hover over the *+* button in the application's header and select *Add Visualization*.\
In the popup first select the type of visualization you want to create, then select the file(s) to read the source artifacts from.\
Finally click the *Create* button which will close the popup and add a panel containing the visualization to the application UI.\
At this point the visualization is not connected to any other ones and visualized artifacts are not displayed as not highlightable.\
To connect visualization with each other using trace links, add at least two visualization to the application then hover over the *+* button and select *Add TraceLinks*.\
Next you can select a file for each pair of visualization from which traceability links will be read. Finally confirm your selection using the *Add* button.\
This will add the TLs to the application and visualized artifacts covered by a TL will now appear as highlightable.\
How a highlightable artifact's highlighting is toggled depends on the visualization: \

- Software Architecture Documentation: Each numbered list item corresponding to a sentence of the documentation is clickable
- UML: Edge and node labels are clickable and correspond to interfaces and components respectively
- Code Model: Nodes are clickable and correspond to files and packages.
- Diagram: Clicking inside a bounding box toggles its highlighting

Once an artifact's highlighting is toggled any artifacts in other visualization that are connected to the toggled artifact via a TL will also be highlighted using the same color.
Multiple artifacts can be highlighted at the same time in which case only one of the applicable colors is used for artifacts covered by multiple TLs.
Please not that at any point one visualization is considered to be the primary one and to ensure that the highlightable artifacts match the active TLs.
Toggling the highlighting of an artifact of a non-primary visualization will make it the primary one and clear the active TLs before setting the toggled highlighting.\

Each visualization provides a set of buttons to access additional functionality, for detailed information on any button see the respective visualization's documentation or source code. \
Two buttons are provided by every visualization:\
The *⌫* button will clear the currently active trace links. \
The *X* will close the visualization and remove it from the application. \
Once a visualization has been removed, all TLs connecting it to other visualizations will als also be removed and the remaining visualization will be updated to reflect the application's reduced set of TLs.


Which additional functionality a given visualization supports depends on the type of visualization.
Visualization based on a SVG element support both zooming in and out using the mouse wheel when the cursor is above the visualization and panning by holding down the left mouse button and moving the mouse (pan&drag)

In addition to visualizing TLs implictly by highlighting the artifacts they connect, TraceView provides a visualization to display the currently active TLs explictly
This TraceLink-Visualization can be added in a similar way to artifact visualizations: Hover over the *+* button in the application's header, and click on the *Add Other* entry of the dropdown menu.
Removing the TraceLink-Visualization does not change the application's state with regards to TLs or artifacts.

## User Interface

Providing a simple user interface that can be customized to the user's needs is a core goal of TraceView.
The panel containing each visualization can be resized horizontally by dragging the handles next to it.\
When hovering over the header of a visualization's panel, the cursor will turn into a hand. By holding down the left mouse button and dragging the cursor below the last row a new row will be added to the UI and the grabbed visualization will be moved to it. Visualization panels can also be moved from one row to another in this way. Once a row is empty it will be removed and it's height distributed among the remaining rows.
Dragging the horizontal handles will resize all elements in the neighboring rows vertically.\
By default TraceView uses a light blue color scheme based on the ArDoCo logo, but if desired there are two other color schemes available which can be selected by hovering over the paint palette symbol in the header and selecting the desired color scheme.\
Additional color schemes can easily be added to the application for details on this see the developer manual.
Please note that TraceView does not use cookies or server-side storage of user preferences or data. Thus on reloading the web page any necessary files or desired settings need to be manually added to the application or set again and.
