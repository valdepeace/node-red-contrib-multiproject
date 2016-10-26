/**
 * Created by Andres Carmona Gil for Thingtrack,sl on 02/08/2016.
 */

var http = require('http');
var zlib = require('zlib');
var request = require('request')
module.exports=function(RED) {

    log = RED.log
    function Multiproject(config) {
        RED.nodes.createNode(this, config)
        this.name = config.name || "project 1"
        this.type = config.type || "project"
        this.flows = config.flows || []
        this.id = config.id

    }

    RED.nodes.registerType("project", Multiproject);

    RED.httpAdmin.get("/projects", function (req, res) {
        var projects = []
        var token=req.headers.authorization.split(" ")[1]

        if(RED.settings.adminAuth){
            var options = {
                uri: 'http://localhost:4000/api/Customers/getProjectsCustomers',
                method: 'POST',
                json: {
                    "token": token
                }
            };
            request(options, function (error, response, projects_sensor) {
                function allnodes_users(no) {
                    if (no.type == "project"){
                        if(projects_sensor!==undefined){
                            var exist=projects_sensor.projects.filter(function(e){
                                return e.id===no.id
                            })
                            if(exist.length>0)
                                projects.push(no)
                        }
                    }
                }
                if(!error && response.statusCode==200){
                    RED.nodes.eachNode(allnodes_users)
                    return res.json(projects);
                }else{
                    return res.status(404).send((error)?error:"error desconocido")
                }

            });
        }else{
            function allnodes(no) {
                if (no.type == "project")
                    projects.push(no)
            }
            RED.nodes.eachNode(allnodes)
            return res.json(projects);
        }

        /*
         getProjetsCustomers(token, function(err,projects_sensor){
         if(err)
         return res.status(404).send(err)

         if(projects_sensor!==undefined){

         }

         })
         */
    })

    RED.httpAdmin.get("/projects/:id", function (req, res) {
        var id = req.params.id;
        var projects
        var nodesProjects = []

        function findProject(node) {
            if (id == node.id)
                projects = node
        }

        RED.nodes.eachNode(findProject) // find project activo

        function allnodes(no) {
            var exist = projects.flows.filter(function (el) {
                return no.z == el || no.id == el

            })
            if (exist.length > 0)
                nodesProjects.push(no)
        }

        RED.nodes.eachNode(allnodes) //get nodes for projects

        if (nodesProjects.length === 0) // new tab if not exists for client
            nodesProjects.push({
                type: "tab",
                id: RED.util.generateId(),
                label: "flow 1"
            })
        nodesProjects.push(projects)
        res.json(nodesProjects)
    })

    RED.httpAdmin.post("/projects", function (req, res) {

        var flows = req.body;




        var deploymentType = req.get("Node-RED-Deployment-Type") || "full";
        if (req.get("project")) {
            var delete_project = JSON.parse(req.get("project"))
        }

        function delete_nodes(no, i, a) {
            var exist = delete_project.flows.filter(function (e) {
                return e === no.id
            })
            if (exist.length == 0)
                if (delete_project.id !== no.id) {
                    flows.push(no)
                }
        }

        if (delete_project) {
            RED.nodes.eachNode(delete_nodes)

        }
        log.audit({event: "flows.set", type: deploymentType}, req);
        if (deploymentType === 'reload') {
            RED.nodes.loadFlows().then(function () {
                res.status(204).end();
            }).otherwise(function (err) {
                log.warn(log._("api.flows.error-reload", {message: err.message}));
                log.warn(err.stack);
                res.status(500).json({error: "unexpected_error", message: err.message});
            });
        } else {
            req.body = flows
            // req.headers.host="localhost:8080"
            var url=req.headers.host.split(":")
            var options = {
                host: url[0],
                path: (RED.settings.httpAdminRoot==="/")?'/flows':RED.settings.httpAdminRoot+'/flows',
                port: url[1],
                headers: {
                    "node-red-deployment-type":"full",
                    "cache-control": "no-cache",
                    "content-type": "application/json; charset=utf-8"

                },
                method: 'POST'
            };

            if(req.headers.authorization)
                options.headers.authorization=req.headers.authorization

            var callback = function(response) {
                var str = ''
                response.on('data', function (chunk) {
                    str += chunk;
                });

                response.on('end', function () {
                    res.status(this.statusCode).end(str)
                });

            }
            var flowsLaunch={}
            function getFlowsLaunch(no){
                if(no.type=='project'){
                    flowsLaunch[no.id]={
                        flows:no.flows.reduce(function(flow,el){
                            flow[el]={}
                            return flow
                        },{})
                    }
                }
            }
            RED.nodes.eachNode(getFlowsLaunch)
            var flowsClient={}
            function getFlowsClient(no){
                if(no.type=='project'){
                    flowsClient[no.id]={
                        flows:no.flows.reduce(function(flow,el){
                            flow[el]={}
                            return flow
                        },{})
                    }
                }
            }
            RED.nodes.eachNode(getFlowsClient)
            var flowSave=[]
            for (var key_launch in flowsLaunch){
                if (flowsClient[key_launch]!==undefined){
                    flowSave[key_launch]={}
                    for(var key_flow in flowsClient[key_launch].flows){
                        flowSave[key_flow]={}
                    }
                    delete flowsClient[key_launch]
                }else{
                    flowSave[key_launch]={}
                    for(var key_flow in flowsLaunch[key_launch]){
                        flowSave[key_flow]={}
                    }

                }
            }
            for (var key_client in flowsClient){
                flowSave[key_client]={}
                for(var key_flow in flowsClient){
                    flowSave[key_flow]={}
                }
            }
            var nodeSave=[]

            function getNodeSave(no){
                var node_body=req.body.filter(function(e){
                    return e.id==no.id
                })
                if(node_body.length>0){
                    nodeSave.push(node_body[0])
                }else{
                    if(flowSave[no.id]!==undefined){
                        nodeSave.push(no)
                    }
                }
            }
            RED.nodes.eachNode(getNodeSave)
            req.body.forEach(function(e){
                var exists=nodeSave.filter(function(el){
                    return e.id==el.id
                })
                if(exists.length===0)
                    nodeSave.push(e)
            })
            var request = http.request(options, callback);
            request.write(JSON.stringify(nodeSave))
            request.end();

        }
    })


}
