/**
 * Created by negrero on 02/08/2016.
 */
http =require('http')

module.exports=function(RED){

    log = RED.log
    function Multiproject(config){
        RED.nodes.createNode(this,config)
        this.label = config.label || "project 1"
        this.type=config.type || "project"
        this.flows = config.flows || []
        this.id= config.id
    }
    RED.nodes.registerType("project",Multiproject);

    RED.httpAdmin.get("/projects",function(req,res){
        var projects=[]
        function allnodes(no){
            if(no.type=="project")
                projects.push(no)
        }
        RED.nodes.eachNode(allnodes)
        res.json(projects);

    })
    RED.httpAdmin.get("/projects/:id",function(req,res){
        var id=req.params.id;
        var projects
        var nodesProjects=[]
        function findProject(node){
            if(id==node.id)
                projects=node
        }
        RED.nodes.eachNode(findProject)
        projects.flows.forEach(function(el,ix,ar){
            function allnodes(no){
                if(no.type!=="tab"){
                    if(no.z==el)
                        nodesProjects.push(no)
                }else{
                    if(no.id==el)
                        nodesProjects.push(no)
                }
            }
            RED.nodes.eachNode(allnodes)

        })
        if(nodesProjects.length===0)
            nodesProjects.push({
                type:"tab",
                id:RED.util.generateId(),
                label:"flow 1"
            })
        res.json(nodesProjects)
    })

    RED.httpAdmin.post("/projects",function(req,res){

        var flows = req.body;
        function allnodes(no){
            var exist=flows.filter(function(e){
                return e.id===no.id
            })
            if(exist.length==0)
                flows.push(no)
        }
        RED.nodes.eachNode(allnodes)
        var deploymentType = req.get("Node-RED-Deployment-Type")||"full";
        log.audit({event: "flows.set",type:deploymentType},req);
        if (deploymentType === 'reload') {
            RED.nodes.loadFlows().then(function() {
                res.status(204).end();
            }).otherwise(function(err) {
                log.warn(log._("api.flows.error-reload",{message:err.message}));
                log.warn(err.stack);
                res.status(500).json({error:"unexpected_error", message:err.message});
            });
        } else {
            req.body=flows
            //res.redirect(307,'/flows')
            var options = {
                host: "localhost",
                path: '/flows',
                port:'1880',
                headers: {
                    "node-red-deployment-type":"full",
                    "cache-control": "no-cache",
                    "content-type": "application/json; charset=utf-8"

                },
                method: 'POST'
            };
            var callback = function(response) {
                var str = ''
                response.on('data', function (chunk) {
                    str += chunk;
                });

                response.on('end', function () {
                    res.status(204).end();
                    //log.warn(log._("api.flows.error-save",{message:err.message}));
                    //log.warn(err.stack);
                    //res.status(500).json({error:"unexpected_error", message:err.message});
                });
            }

            var request = http.request(options, callback);
            request.write(JSON.stringify(flows))
            request.end();

        }
    })
}