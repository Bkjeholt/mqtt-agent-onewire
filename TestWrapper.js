/************************************************************************
 Product    : Home information and control
 Date       : 2016-06-01
 Copyright  : Copyright (C) 2016 Kjeholt Engineering. All rights reserved.
 Contact    : dev@kjeholt.se
 Url        : http://www-dev.kjeholt.se
 Licence    : ---
 -------------------------------------------------------------------------
 File       : TestWrapper.js
 Version    : 0.1.0
 Author     : Bjorn Kjeholt
 *************************************************************************/

    process.env.AGENT_NAME = "hic-agent-onewire";
    process.env.AGENT_REV = "0.1.1";
    process.env.MQTT_IP_ADDR = "192.168.1.78";
    process.env.MQTT_PORT_NO = "1883";
    process.env.MQTT_USER = "NA";
    process.env.MQTT_PASSWORD = "NA";
    process.env.OWSERVER_IP_ADDR = "192.168.1.78";
    process.env.OWSERVER_PORT_NO = "4304";
    process.env.npm_package_name = "hic-agent-onewire";
    process.env.npm_package_version = "testenv-0.1.1";

require("./main.js");