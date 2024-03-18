# Traceability Link Visualization

Welcome to the repository for ArDoCo TraceView. TraceView is intended to visualize artifacts at different levels of abstraction during the software development process and the "implements" relationship between them cakked a traceability link (TL).
TraceView does this by displaying visualizations of each level of abstraction (natural language description, UML, code model, diagrams) and indicating relationships by highlighting related artifacts using unique colors for each traceability link.
Additionally artifacts that are not part of any TL relationship are displayed differently than those that are, allowing the user to distinguish them at a glance.
The lack of any TL relationship may indicate a superflous implementation, unrealized parts of the software architecture of missing documentation.

# Design Goals
Our central design goals in desigining ArDoCo TraceView were to create an application that ...
1. ... is easy and comfortable to use
2. ... can be extended to support new types of artifacts and visualizations

Our first goal is what lead us to implement the application as a static web application.
Through this approach no local installation of the the application is necessary and it is independent of the user's develpment environment or OS and since the web application is static, no dedicated backend server needs to be developed and maintained.
Secondly we wanted to make sure that the user's interaction with the application is comfortable as well.
To this end TraceView supports different color schemes that can be switched easily via a dropdown menu in the page header and every displayed visualization can be resized to fill as little or as much of the screen as the user desires.

# Architecture Design Decisions

A Traceability Link (TL) is a [relationship between two artifacts at different levels of abstraction](https://publikationen.bibliothek.kit.edu/1000165692/post).
In TraceView each level of abstraction corresponds to a visualization and each TL is represented as a 4-tuple consisting of the unique identifiers of source and target artifact and unique identifiers of source and target visualization. 
They key advantage and reason for this representation of TLs is that it does not require artifacts identifier to be unique across all levels of abstraction. 
When adding a new level of abstraction and corresponding set of artifact identifier and TLs it is not necessary to scan all previously added identifiers to avoid creating ambigous TLs.

It is important to note that TraceView manages artifacts and TLs in very different ways: 
The application delegates the managment of the active and inactive TLs to the VisualizationObserver, which explicitly stores them in one of its member variables.
This is not the case for artifacts.\
By selecting the desired files to instantiate a visualization from the user decies which raw string file contents are passed to the VisualizationFactory which will attempt to parse them into artifacts of the type  specified by the user.\
If successfull, the artifacts are used in the initialization of a visualization and as the VisualizationFactory is stateless, discarded after calling the visualization's constructor.\
Visualizations may store their artifacts, but in our implementations we found this unnecessary and discard them after the corresponding elements of a visualization (i.e. nodes in a graph) have been created.\
Per the interface of a HighlightingVisualization which is the only interface that will be used to interact with visualization objects beyond their instantiation, visualizations only need to maintain a list of currently highlightable identifiers.






The key characteristic of ArDoCo Traceview's architecture is the extensive use of the observer pattern:
Firstly, the application receives user input via listeners attached to the Document Object Model (DOM) as is usually the case with web based applications.
Secondly each visualization is observed by the aforementioned VisualizationObserver which holds the TLs known to the application and sets each visualizations highlighting based on the received inputs from its observation subjects. \

