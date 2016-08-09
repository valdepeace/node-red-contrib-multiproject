## Node-RED multiproject

Este contrib crea un node de configuración el cual nos permite tener agruapado los flows o tabs por proyecto.

En la ui se nos creara un boton junto al deploy y donde tendremos todos nuestro proyectos y los flows asociados.

## npm install your node-red directory:

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

Contributors: Miguel Angel Salinas(miguel@thingtrack.com)
Company: [Thingtrack s.l](http://www.thingtrack.com)