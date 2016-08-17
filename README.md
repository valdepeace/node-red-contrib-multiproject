## Node-RED Multiproject

This node-red package extension transform node-red in a mutiproject mode. We can group several flows in a set called project and manage different projects at the same time. 

This extension add the project name and a new visual combo list in the header of the node-red editor where we can create a new project,
remove or select one. To change the default name of the project double click in the project tittle and fill the name of it.

To install the node-red package extension:
```
npm install node-red-contrib-multiproject
```

To manage the relation between the projects and the flows, we add a new invisible node with a new type called 'project' in the default file of node-red, where we can mantein the name and the flow nodes of it. 

And example of this node could be:

```
[ ...
{ 
    "id" : "577e736dccf2bb09e469c910", 
    "type":"project",
    "flows":["6bf4a987.6cf088", "5c94cd6b.bd9a44"],     
    "name" : "Mqtt Project" 
},
```

![captura de pantalla 2016-08-17 a las 11 59 03](https://cloud.githubusercontent.com/assets/1216181/17732541/9995df32-6472-11e6-9376-bfa41ee41596.png)

Contributors: Miguel Angel Salinas (miguel@thingtrack.com)
Company: [Thingtrack s.l](http://www.thingtrack.com)
