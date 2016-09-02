/**
 * Created by Andres Carmona Gil for Thingtrack,sl on 02/08/2016.
 */

http =require('http')

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

        function allnodes(no) {
            if (no.type == "project")
                projects.push(no)
        }

        RED.nodes.eachNode(allnodes)
        res.json(projects);

    })
    RED.httpAdmin.get("/projects/:id", function (req, res) {
        var id = req.params.id;
        var projects
        var nodesProjects = []

        function findProject(node) {
            if (id == node.id)
                projects = node
        }

        RED.nodes.eachNode(findProject)
        projects.flows.forEach(function (el, ix, ar) {
            function allnodes(no) {
                if (no.type !== "tab") {
                    if (no.z == el || no.z === "")
                        nodesProjects.push(no)
                } else {
                    if (no.id == el)
                        nodesProjects.push(no)
                }
            }

            RED.nodes.eachNode(allnodes)
            /*
             var tab=RED.nodes.getNode(el);
             if(tab===null){
             nodesProjects.push({id:el.id,label:el.label,type:el.type})
             }else{
             nodesProjects.push({id:tab.id,label:tab.label,type:"tab"})
             if(tab.configs)
             nodesProjects=nodesProjects.concat(tab.configs)
             nodesProjects=nodesProjects.concat(tab.nodes)
             }
             */
        })
        if (nodesProjects.length === 0)
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
        /*
         var project=flows.filter(function(e){
         return e.type==='project'
         })
         var tabs=flows.reduce(function(tabs,e,i,a){
         if(actual.type==='tab')
         tabs.push(actual.id)
         },[])
         project[0].flows=tabs
         */
        var deploymentType = req.get("Node-RED-Deployment-Type") || "full";
        if (req.get("project")) {
            var delete_project = JSON.parse(req.get("project"))
        }

        function allnodes(no) {
            var exist = flows.filter(function (e) {
                return e.id === no.id
            })
            if (exist.length == 0)
                flows.push(no)
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

        } else {
            RED.nodes.eachNode(allnodes)
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

            var request = http.request(options, callback);
            request.write(JSON.stringify(flows))
            request.end();

        }
    })
}
