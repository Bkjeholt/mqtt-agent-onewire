/************************************************************************
 Product    : Home information and control
 Date       : 2016-01-01
 Copyright  : Copyright (C) 2016 Kjeholt Engineering. All rights reserved.
 Contact    : dev@kjeholt.se
 Url        : http://www-dev.kjeholt.se
 Licence    : ---
 ---------------------------------------------------------
 File       : TBD.js
 Version    : 0.1.0
 Author     : Bjorn Kjeholt
 *************************************************************************/

var owfsClient = require('owfs').Client;

var nodeOneWire = function (ci) {
    var self = this;
    var healthStatus = {
                         status: 'down',
                         last_mqtt_data_update: 0
                       };
                       
    this.ci = ci;
    console.log("ConfigInfo", ci);
    
    this.owfsConnect = new owfsClient( self.ci.onewire.ip_addr, self.ci.onewire.port_no);
    console.log("--------------------------------------------------------");
    console.log("owserver ip_addr:" + self.ci.onewire.ip_addr+"");
    console.log("owserver port_no:" + self.ci.onewire.port_no+"");
    console.log("--------------------------------------------------------");

    console.log("OWFS Connect");
    this.owfsConnect.get("/",function(err, directories){
	console.log("owfs dir ",directories," error info -> ",err);
    });

    this.nodeInfoList = [
/*        { name: 'AgentInfo',
                           devices: [{ name: 'AgentName',
                                       data_type: 'text',
                                       dev_type: 'static',
                                       last_value: self.ci.agent.name },
                                     { name: 'AgentRev',
                                       data_type: 'text',
                                       dev_type: 'static',
                                       last_value: self.ci.agent.rev }] }
*/                       ];

    /**
     * @function deviceTypeDecode
     */
    this.deviceTypeDecode = function (nodeType) {
        var deviceInfoList = [];
        
        switch(nodeType) {
            case 'DS1820':
            case 'DS18B20':
            case 'DS18S20':
                deviceInfoList.push({ name: 'temperature',
                                       data_type: 'float',
                                       dev_type: 'dynamic',
                                       last_value: null });
                deviceInfoList.push({ name: 'power',
                                       data_type: 'bool',
                                       dev_type: 'semistatic',
                                       last_value: null });
                break;
            case 'DS2423':
                deviceInfoList.push({ name: 'counters.A',
                                       data_type: 'int',
                                       dev_type: 'dynamic',
                                       wrap_around: (65536 * 65536),
                                       last_value: null });
                deviceInfoList.push({ name: 'counters.B',
                                       data_type: 'int',
                                       dev_type: 'dynamic',
                                       wrap_around: (65536 * 65536),
                                       last_value: null });
                break;
        }
        
        return (deviceInfoList);
    };

    /**
     * @function updateNodeInfoList
     * @param {function} callback
     * @returns {undefined}
     */
    this.updateNodeInfoList = function(callback) {
        console.log("Update OW node list");
        
        self.owfsConnect.get("/",function(err,listOfDevices) {
                if (err) {
                    console.log("Error Update OW node list",err);
                    callback(err);
                } else {
 //                   console.log("OWFS get directory ",listOfDevices);
    
                    (function loop(deviceId, callback) {
                        var nodeName = "";
                        var i;
                        var foundNode = false;
//                        var devInfoRecord = {};
                        var nodeInfoItem = {name: 'undef',
                                            type: 'undef',
                                            devices: [] };
                    
                        if (deviceId > 0) {
                            nodeInfoItem.name = listOfDevices[deviceId-1].substr(1,listOfDevices[deviceId-1].length-1);
                        
//                            console.log("NodeName = " + nodeName);
                            // Is the device already known
                        
                            for (i=0;i<self.nodeInfoList.length; i=i+1) {
                                if (nodeInfoItem.name === (self.nodeInfoList[i].name)) {
                                    foundNode = true;
                                }
//                                console.log("Identify node ("+nodeInfoItem.name+") == (/" + self.nodeInfoList[i].name + ") found=" + foundNode);
                            }

                            if (!foundNode) {
                            
//                                console.log("OWFS read type info for device = ",nodeName);
                                self.owfsConnect.read("" + nodeInfoItem.name + "/type", 
                                        function(err,nodeType) {
//                                            var newSubNodeList = [];
            
                                            if (err) {
                                                console.log("OWFS read type err", err);
                                                loop(deviceId-1,callback);
                                            } else {
//                                                console.log("OWFS read type device", nodeName," type ",result);
                                                nodeInfoItem.type = "ow-" + nodeType;
                                                nodeInfoItem.devices = self.deviceTypeDecode(nodeType);
                                                self.nodeInfoList.push(nodeInfoItem);
                                                
                                                loop(deviceId-1,callback);
                                            }
                                        });

                            } else {
                                loop(deviceId-1,callback);
                            }
                        } else {
                            callback(null);
                        }
                    })( listOfDevices.length, 
                        function(err) {
//                            console.log("Result from getDevices = ",self.nodeInfoList);
                            callback(err);
                        });
            }
        });
    };
    
    var readDataSubNode = function (ni, sni, subNodeDataList, sampleTime, callback) {
        var list = subNodeDataList;
        if (sni > 0) {
            sni = sni - 1;
                        
            self.owfsConnect.read("" + self.nodeInfoList[ni].name + "/"+ self.nodeInfoList[ni].devices[sni].name, 
                                        function(err,result) {
                                            if (!err) {
                                                if ((self.nodeInfoList[ni].devices[sni].dev_type === "dynamic") || 
                                                    (self.nodeInfoList[ni].devices[sni].last_data === null) ||
                                                    (self.nodeInfoList[ni].devices[sni].last_data !== result)) {
                                                    list.push({ snid: self.nodeInfoList[ni].devices[sni].snid,
                                                                vtid: self.nodeInfoList[ni].devices[sni].vartypeid,
                                                                name: self.nodeInfoList[ni].devices[sni].name,
                                                                time: sampleTime,
                                                                data: result });    
                                                    healthStatus.last_mqtt_data_update = sampleTime;
                                                }
                                                
                                                self.nodeInfoList[ni].devices[sni].last_data = result;
                                                
//                                                console.log("ReadDataSubNode Loop("+ni+":" + sni + ") list=",list);

                                                readDataSubNode(ni,sni, list, sampleTime, callback);
                                            } else {
                                                console.log("readDataSubNode err=",err);
                                                callback(err,list);
                                            }
                                        });
        } else {
            callback(null,list);
        }        
    };
    
    var readDataNode = function (ni, nodeDataList, sampleTime, callback) {
        var list = nodeDataList;
        if (ni > 0) {
            ni = ni-1;
            
            readDataSubNode(ni, self.nodeInfoList[ni].devices.length, [], sampleTime, 
                    function(err,subNodeDataListResult){
                        
                        list.push({ name: self.nodeInfoList[ni].name,
                                    devices: subNodeDataListResult
                                  });
//                        console.log("ReadDataNode Loop("+ni+") list=",list);
                        readDataNode(ni, list, sampleTime, callback);
                    });
        } else {
            callback(null, list);
        }
    };
    
    this.get_NodeDataList = function(callback) {
        var nodeDataList = [];

        readDataNode(self.nodeInfoList.length,nodeDataList, Math.floor(new Date()/1000), 
                    function(err,result) {
//                        console.log("Get nodeDataList result_",result);
                        
                        callback(null,result);
                    });
    };
    
    this.healthCheck = function(callback) {
        var currTime = Math.floor(new Date()/1000);
        var lastSampleTime = healthStatus.last_mqtt_data_update;
        var criticalTime = currTime - self.ci.onewire.link.timeout;
        
        if (lastSampleTime > criticalTime) {
            healthStatus.status = 'up';
            callback(null);
        } else {
            healthStatus.status = 'down';
            callback({ error: "non-healthy" });            
        }
        
    };
    
    (function setup() {
        self.owfsConnect = new owfsClient( self.ci.onewire.ip_addr, self.ci.onewire.port_no);
        self.ci.health_check.check_functions.push(self.healthCheck);
     })();
};

exports.create_node = function(ci){
    return new nodeOneWire(ci);
};

