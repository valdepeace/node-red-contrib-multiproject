## Node-RED Multiproject

This contrib node-red package transform node-red in a mutiproject mode. We can group several flows in a set called project and manage different projects at the same time. 

This extension add the project name and new visual combo list in the header of the node-red editor from we can create a new project or selected one. To change the default name of the project double click in the project tittle and fill the name of it.

## to install the extension:

```
npm install node-red-contrib-multiproject
```

### nodes create example

```
{ 
    "id" : "577e736dccf2bb09e469c910", 
    "type":"project",
    "flows":["6bf4a987.6cf088","5c94cd6b.bd9a44"],     
    "name" : "Santo Adriano Tuñón" 
  
},
```

![captura de pantalla 2016-08-17 a las 11 59 03](https://cloud.githubusercontent.com/assets/1216181/17732541/9995df32-6472-11e6-9376-bfa41ee41596.png)

Contributors: Miguel Angel Salinas (miguel@thingtrack.com)
Company: [Thingtrack s.l](http://www.thingtrack.com)
