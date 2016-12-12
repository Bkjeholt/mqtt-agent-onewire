/************************************************************************
 Product    : Home information and control
 Date       : 2016-05-04
 Copyright  : Copyright (C) 2016 Kjeholt Engineering. All rights reserved.
 Contact    : dev@kjeholt.se
 Url        : http://www-dev.kjeholt.se
 Licence    : ---
 ---------------------------------------------------------
 File       : SupportClasses/agentBody.js
 Version    : 2.0.1
 Author     : Bjorn Kjeholt
 *************************************************************************/

var mqtt = require('mqtt');
//var nodeHandler = require('./nodeHandler');
var nodeHandler = require('./nodeOneWire');

agentBody = function(ci) {
    var self = this;
    this.ci = ci;

    this.mqttConnected = false;
    this.gateWayReady = false;

    (function Initial_setup() {
        console.log("--------------------------------------------------------");
        console.log("Package name:    " + self.ci.agent.name);
        console.log("Package version: " + self.ci.agent.rev);
        console.log("--------------------------------------------------------");
        console.log("MQTT broker:     " + "mqtt://"+ci.mqtt.ip_addr+":1883");
        console.log("--------------------------------------------------------");
    })();

//     console.log("MQTT connect :");

    this.mqttSubscribe = function() {
        var subscriptions = ["info/request/" + self.ci.agent.name + "",
                             "info/request/" + self.ci.agent.name + "/#",
                             "data/response/" + self.ci.agent.name + "/#",
                             "status/alive/" + self.ci.agent.name + ""];
        var i = 0;
        
        for (i=0; i < subscriptions.length; i=i+1) {
            console.log("MQTT subscribe: ", subscriptions[i]);
            self.mqttClient.subscribe(subscriptions[i]);
        }

    };
    
    this.mqttPublish = function(topic,msg) {
        var msgStr = JSON.stringify(msg);
        
        var topicStr = topic.group + "/" +
                       topic.order + "/" +
                       self.ci.agent.name;

        if (topic.node !== undefined) {
            topicStr = topicStr + "/" + topic.node;
            
            if (topic.device !== undefined) {
                topicStr = topicStr + "/" + topic.device;
                
                if (topic.variable !== undefined) {
                    topicStr = topicStr + "/" + topic.variable;
                }
            }                    
        }
//        console.log("MQTT topic input:",topic);
        console.log("MQTT Publish: ",topicStr," -> ",msgStr);
        
        
        self.mqttClient.publish( topicStr,
                                 msgStr,
                                 { qos: 0,
                                   retain: 1 });
    };
    
    this.publishInfo = function (topic,msg) {
        var currTime = Math.floor((new Date())/1000);
        
        // Publish info about the agent
        
        self.mqttPublish({  group: 'info',
                            order: 'present',
                            agent: self.ci.agent.name  },
                         {  time: currTime,
                            date: new Date(),
                            name: self.ci.agent.name,
                            rev:  self.ci.agent.rev });

        self.nodeClient.updateNodeInfoList(function(err) {
            var nodeIndex = 0;
            var deviceIndex = 0;
        
//            console.log("infoRequest - nodeInfoList",self.nodeClient.nodeInfoList);
        
            for (nodeIndex=0; nodeIndex < self.nodeClient.nodeInfoList.length; nodeIndex = nodeIndex+1) {
                self.mqttPublish({  group: 'info',
                                    order: 'present',
                                    agent: self.ci.agent.name,
                                    node:  self.nodeClient.nodeInfoList[nodeIndex].name },
                                 {  time: currTime,
                                    date: new Date(),
                                    name: self.nodeClient.nodeInfoList[nodeIndex].name,
                                    type: self.nodeClient.nodeInfoList[nodeIndex].type });    
                            
                for (deviceIndex=0; deviceIndex < self.nodeClient.nodeInfoList[nodeIndex].devices.length; deviceIndex = deviceIndex+1) {
                    self.mqttPublish({  group: 'info',
                                        order: 'present',
                                        agent: self.ci.agent.name,
                                        node:  self.nodeClient.nodeInfoList[nodeIndex].name,
                                        device:  self.nodeClient.nodeInfoList[nodeIndex].devices[deviceIndex].name },
                                     {  time: currTime,
                                        date: new Date(),
                                        name: self.nodeClient.nodeInfoList[nodeIndex].devices[deviceIndex].name,
                                        rev:  '---',
                                        datatype: self.nodeClient.nodeInfoList[nodeIndex].devices[deviceIndex].data_type,
                                        devicetype: self.nodeClient.nodeInfoList[nodeIndex].devices[deviceIndex].dev_type,
                                        wraparound: self.nodeClient.nodeInfoList[nodeIndex].devices[deviceIndex].wrap_around });  
/*                                
                    if (self.nodeClient.nodeInfoList[nodeIndex].devices[deviceIndex].last_data !== null) {
                        self.mqttPublish({  group: 'data',
                                            order: 'present',
                                            agent: self.ci.agent.name,
                                            node:  self.nodeClient.nodeInfoList[nodeIndex].name,
                                            device:  self.nodeClient.nodeInfoList[nodeIndex].devices[deviceIndex].name },
                                         {  time: currTime,
                                            data: self.nodeClient.nodeInfoList[nodeIndex].devices[deviceIndex].last_data });    
                    }
                    */
                }
            }
        });
       
        
    };

    this.mqttConnect = function(connack) {
//        console.log("MQTT connected :",connack);
        self.mqttConnected = true;
        self.ci.mqtt.connected = true;
        self.mqttSubscribe();
        self.publishInfo({},{});
    };
    

    this.topicStrToJson = function (str) {
        var t = str.split("/");
        var result = {group: t[0],
                       order: t[1],
                       agent: '---',
                       node: '---',
                       device: '---',
                       variable: '---' };
        
        if (t[2] !== undefined) { 
            result.agent = t[2];
        
            if (t[3] !== undefined) {
                result.node = t[3];
        
                if (t[4] !== undefined) { 
                    result.device = t[4];
        
                    if (t[5] !== undefined) 
                        result.variable = t[5];
                }
            }
        }
        
        return result;
    };
    
    this.msgStrToJson = function (str) {
        var m = JSON.parse(str);
        
        return m;
    };
    

    this.mqttMessage = function(topicStr, messageStr, packet) {

        var topic = self.topicStrToJson(topicStr);
        var msg   = self.msgStrToJson(messageStr);
        var currTime = Math.floor((new Date())/1000);
        
//        var devObj = self.ci.mqtt.functions.devices;
//        var devInfo;
        var i;
        
//        console.log("MQTT topic:   ",topic);
//        console.log("MQTT message: ",msg);
    //    console.log("MQTT Receive: ",topicStr," -> ",messageStr);
        
        switch (topic.group) {
            case 'info':
                switch (topic.order) {
                    case 'config':
                        break;
//                    case 'refresh':
//                        // TODO: Just now if a refresh is requested all info about nodes and devices is sent to the manager independent if it is new or not.
//                        
//                        self.infoRequest(topic,msg);
//                        break;
                    case 'request':
                        self.infoRequest(topic,msg);
                        
                        break;
                    default:
                        break;
                }
                break;
            case 'data':
                switch (topic.order) {
                    case 'response':
                        break;
                    default:
                        break;
                }
                break;
            case 'status':
                switch (topic.order) {
                    case 'alive': //status/alive/AgentName
                        /*
                         * Reeceived a echo message from onw agent
                         */
                        
                        self.ci.mqtt.link.latest_status_time = Math.floor((new Date())/1000);

                            if (self.ci.mqtt.link.status !== 'alive') {
                                self.ci.mqtt.link.status = 'alive';
                                console.log("Link between Agent and mqtt-brooker alive");
                                self.infoRequest({},{});
                            }    
                            
                        break;
                    default:
                        break;
                }
                break;
            default:
                break;
        } 
    };

    this.mqttDisconnect = function () {
        self.mqttConnected = false;
        self.ci.mqtt.connected = false;
        
    };
    
    this.mqttError = function (error) {
        self.mqttConnected = false;
        self.ci.mqtt.connected = false;
        console.log("MQTT Error = ",error);
    };
    
    (function setup (ci) {
        (function mqttSetup (ci) {
            self.mqttClient = mqtt.connect("mqtt://"+ci.mqtt.ip_addr,
                                           { connectTimeout: 5000 });
//console.log(self.mqttClient);
            self.mqttClient.on('close',(self.mqttDisconnect));
            self.mqttClient.on('connect',(self.mqttConnect));
            self.mqttClient.on('error',(self.mqttError));
            self.mqttClient.on('message',(self.mqttMessage));
        }(ci));
        
        (function nodeSetup (ci) {
            self.nodeClient = nodeHandler.create_node(ci); 
            
/*            self.nodeClient.update_NodeInfoList(function(err) {
                            if (!err) {
                                console.log("update node info list ",self.nodeClient.nodeInfoList);          
                                
                                self.gateWayReady = true;
                            } else {
                                console.log("update node info list error ",err);          
                                
                            } 
            });*/
            
        })(ci);    
    })(this.ci);
    
    console.log("Start timers");
    
    setInterval(function () {
                    
                    var currTime = Math.floor((new Date())/1000);

//                    console.log("Intervall scan data from " + self.nodeClient.nodeInfoList.length + " nodes");

                    if (true) {
                        
                        if (self.mqttConnected) {
                            if (self.nodeClient.nodeInfoList.length > 0) {
                                /*
                                 * There are at least one device identified
                                 * Scan for data value for all identified devices
                                 */
                                self.nodeClient.get_NodeDataList(
                                        function (err,nodeDataList) {
                                            if (!err) {
//                                                console.log("GetNodeDatas result no err Nodedata = ",nodeDataList);
                                                for (var i=0; i < nodeDataList.length; i=i+1) {
//                                                    console.log("GetNodeData[" + i +"] ->",nodeDataList[i]);
                                                    for (var j=0; j < nodeDataList[i].devices.length; j=j+1) {                                                       
                                                        self.mqttPublish({  group: 'data',
                                                                            order: 'present',
                                                                            agent: self.ci.agent.name,
                                                                            node:  nodeDataList[i].name,
                                                                            device:  nodeDataList[i].devices[j].name },
                                                                         {  time: currTime,
                                                                            date: new Date(),
                                                                            data: nodeDataList[i].devices[j].data });    
                                                    }
                                                }
                                            } else {
//                                                console.log("GetNodeDatas result",err," Nodedata = ",nodeDataList);
                                            }
                                        });
                            };
                            
                         

                            /*
                             * Scan for new devices
                             */
                            
                            self.nodeClient.updateNodeInfoList(
                                        function (err) {
                                            
                                            if (err) {
                                                console.log("Update node info list err = ", err);
                                            } else {
//                                                console.log("Update node info list total no of devices = ", self.nodeClient.nodeInfoList.length);
                                
                                                (function getNextNewNode (nodeIndex) {
                                                    var deviceIndex = 0;
                                                    
                                                    if (nodeIndex > 0) {
                                                        nodeIndex = nodeIndex - 1;
                                                        if (self.nodeClient.nodeInfoList[nodeIndex].old === undefined) {

                                                            self.nodeClient.nodeInfoList[nodeIndex].old = currTime;

                                                            self.mqttPublish({  group: 'info',
                                                                                order: 'present',
                                                                                agent: self.ci.agent.name,
                                                                                node:  self.nodeClient.nodeInfoList[nodeIndex].name },
                                                                             {  time: currTime,
                                                                                name: self.nodeClient.nodeInfoList[nodeIndex].name,
                                                                                name: self.nodeClient.nodeInfoList[nodeIndex].type });    
                            

                                                            for (deviceIndex=0; deviceIndex < self.nodeClient.nodeInfoList[nodeIndex].devices.length; deviceIndex = deviceIndex+1) {
                                                                self.mqttPublish({  group: 'info',
                                                                                    order: 'present',
                                                                                    agent: self.ci.agent.name,
                                                                                    node:  self.nodeClient.nodeInfoList[nodeIndex].name,
                                                                                    device:  self.nodeClient.nodeInfoList[nodeIndex].devices[deviceIndex].name },
                                                                                 {  time: currTime,
                                                                                    date: new Date(),
                                                                                    rev: '---',
                                                                                    name: self.nodeClient.nodeInfoList[nodeIndex].devices[deviceIndex].name,
                                                                                    datatype: self.nodeClient.nodeInfoList[nodeIndex].devices[deviceIndex].data_type,
                                                                                    devicetype: self.nodeClient.nodeInfoList[nodeIndex].devices[deviceIndex].dev_type,
                                                                                    wraparound: self.nodeClient.nodeInfoList[nodeIndex].devices[deviceIndex].wrap_around });  
                                                            }
                                                        } else {
                                                            getNextNewNode(nodeIndex);
                                                        }
                                                    }
                                                })(self.nodeClient.nodeInfoList.length);                                                
                                            }
                                        });
                        }
                    }
                },ci.node.scan_node_data);
                    
    setInterval(function () {
//        console.log("Check to see if the mqtt brooker is connected", self.mqttConnected);
                        if (!self.ci.mqtt.connected) {
                            self.mqttClient = mqtt.connect("mqtt://"+ci.mqtt.ip_addr,
                                                           { connectTimeout: 5000 });

                        }                        
                    },10000);

};

exports.create_AgentBody = function (ci) {
    return new agentBody(ci);
};




