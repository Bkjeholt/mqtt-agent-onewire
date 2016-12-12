/************************************************************************
 Product    : Home information and control
 Date       : 2016-11-05
 Copyright  : Copyright (C) 2016 Kjeholt Engineering. All rights reserved.
 Contact    : dev@kjeholt.se
 Url        : http://www-dev.kjeholt.se
 Licence    : ---
 -------------------------------------------------------------------------
 File       : AgentOneWire/main.js
 Version    : 0.2.0
 Author     : Bjorn Kjeholt
 *************************************************************************/

var agent = require('./classes/agentBody');
// var agent = require('./AgentClass');


var agentObj = agent.create_AgentBody({ 
                                    agent: {
                                        name: process.env.npm_package_name,
                                        rev:  process.env.npm_package_version },
                                    health_check: {
                                        port_no: 3000,
                                        check_functions: [] },
                                    mqtt: {
                                        ip_addr: (process.env.MQTT_IP_ADDR !== undefined)? process.env.MQTT_IP_ADDR :
                                                                                           process.env.MQTT_PORT_1883_TCP_ADDR,
                                        port_no: (process.env.MQTT_PORT_NO !== undefined)? process.env.MQTT_PORT_NO :
                                                                                           process.env.MQTT_PORT_1883_TCP_PORT,
                                        user:    process.env.MQTT_USER,      //"hic_nw",
                                        passw:   process.env.MQTT_PASSWORD,  //"RtG75df-4Ge",
                                        connected: false,
                                        link: { 
                                            status: 'down',
                                            latest_status_time: (Math.floor((new Date())/1000)),
                                            timeout: 120 } // seconds
                                        },
                                    onewire: {
                                        ip_addr: (process.env.OWSERVER_IP_ADDR !== undefined)? process.env.OWSERVER_IP_ADDR : "127.0.0.1",
                                        port_no: (process.env.OWSERVER_PORT_NO !== undefined)? process.env.OWSERVER_PORT_NO : 4304 },
                                    node: {
                                        scan_node_data: 30000,
                                        scan_new_nodes: 300000 }
                                  });
var cnt= 0;

setInterval(function() {
    console.log("Status @ " + cnt + "sec. Mqtt link connected: " + agentObj.ci.mqtt.connected);
    cnt = cnt + 10;
},10000);
//abhObj.setup();

